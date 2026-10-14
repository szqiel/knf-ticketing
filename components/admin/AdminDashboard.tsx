"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminDashboard.module.css";

type Program = { id: string; title: string; dayLabel: string | null; bookingOpen: boolean };
type AdminSeat = { id: string; label: string; rowName: string; number: number; status: "available" | "held" | "booked" | "blocked"; fixedBlocked: boolean; blockedReason: string | null };
type AudienceRow = { bookingId: string; programTitle: string; seatLabel: string | null; fullName: string; contact: string; status: "booked" | "cancelled"; source: string; createdAt: string; cancelledReason: string | null };

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [seats, setSeats] = useState<AdminSeat[]>([]);
  const [audience, setAudience] = useState<AudienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySeat, setBusySeat] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadPrograms = useCallback(async () => {
    const data = await readJson<{ programs: Program[] }>("/api/admin/programs");
    setPrograms(data.programs);
    setProgramId((current) => current || data.programs[0]?.id || "");
  }, []);
  const loadProgramData = useCallback(async (id: string) => {
    if (!id) return;
    const [seatData, audienceData] = await Promise.all([
      readJson<{ seats: AdminSeat[] }>(`/api/admin/programs/${id}/seats`),
      readJson<{ rows: AudienceRow[] }>(`/api/admin/audience?programId=${id}`),
    ]);
    setSeats(seatData.seats);
    setAudience(audienceData.rows);
  }, []);

  useEffect(() => {
    let active = true;
    // Data-fetch effects update state after the async request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPrograms().catch((e) => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadPrograms]);
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (programId) void loadProgramData(programId).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [programId, loadProgramData]);
  useEffect(() => {
    if (!programId) return;
    const source = new EventSource(`/api/programs/${programId}/stream`);
    const refresh = () => void loadProgramData(programId).catch((e) => setError(e.message));
    source.addEventListener("seats_changed", refresh);
    return () => { source.removeEventListener("seats_changed", refresh); source.close(); };
  }, [programId, loadProgramData]);

  const rows = useMemo(() => [...new Set(seats.map((seat) => seat.rowName))].sort(), [seats]);
  const toggleSeat = async (seat: AdminSeat) => {
    if (seat.fixedBlocked || busySeat || ["held", "booked"].includes(seat.status)) return;
    setBusySeat(seat.id); setError("");
    try {
      const data = await readJson<{ seats: AdminSeat[] }>(`/api/admin/programs/${programId}/seats`, { method: "PATCH", body: JSON.stringify({ seatId: seat.id, blocked: seat.status !== "blocked" }) });
      setSeats(data.seats);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update seat"); } finally { setBusySeat(null); }
  };
  const cancelBooking = async (row: AudienceRow) => {
    if (row.status === "cancelled" || !confirm(`Cancel booking ${row.bookingId.slice(0, 8)}?`)) return;
    try {
      await readJson(`/api/admin/audience/${row.bookingId}/cancel`, { method: "POST", body: JSON.stringify({ programId, reason: "Cancelled by staff" }) });
      await loadProgramData(programId);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to cancel booking"); }
  };
  const reloadAudience = async () => {
    const query = new URLSearchParams({ programId }); if (from) query.set("from", from); if (to) query.set("to", to);
    try { setAudience((await readJson<{ rows: AudienceRow[] }>(`/api/admin/audience?${query}`)).rows); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load audience"); }
  };
  const downloadReport = (format: "xlsx" | "pdf") => {
    const query = new URLSearchParams({ format, programId }); if (from) query.set("from", from); if (to) query.set("to", to);
    const link = document.createElement("a");
    link.href = `/api/admin/reports/export?${query}`;
    link.click();
  };

  if (loading) return <main className={styles.page}><p>Loading admin panel…</p></main>;
  return <main className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>KNF 2026 / STAFF</p><h1>Admin operations</h1><p>Monitor audience, release bookings, and block seats in real time.</p></div><button className={styles.secondary} onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); }}>Log out</button></header>
    {error && <div className={styles.error}>{error}</div>}
    <section className={styles.toolbar}><label>Program<select value={programId} onChange={(e) => setProgramId(e.target.value)}>{programs.map((program) => <option key={program.id} value={program.id}>{program.title} · {program.dayLabel ?? "No day"}</option>)}</select></label><span className={programs.find((p) => p.id === programId)?.bookingOpen ? styles.open : styles.closed}>{programs.find((p) => p.id === programId)?.bookingOpen ? "Booking open" : "Booking closed"}</span></section>
    <section className={styles.card}><div className={styles.sectionTitle}><div><p className={styles.eyebrow}>LIVE SEAT BLOCKER</p><h2>Seat map</h2></div><p>Click available seats to block or unblock them. Gray seats are fixed or unavailable.</p></div><div className={styles.seatGrid}>{rows.map((row) => <div className={styles.seatRow} key={row}><span className={styles.rowLabel}>{row}</span>{seats.filter((seat) => seat.rowName === row).sort((a,b) => a.number-b.number).map((seat) => <button key={seat.id} title={seat.blockedReason ?? seat.status} disabled={seat.fixedBlocked || ["held", "booked"].includes(seat.status)} className={`${styles.seat} ${styles[seat.status]} ${seat.fixedBlocked ? styles.fixed : ""}`} onClick={() => void toggleSeat(seat)}>{seat.number}</button>)}</div>)}</div><div className={styles.legend}><span><i className={styles.available} />Available</span><span><i className={styles.blocked} />Blocked</span><span><i className={styles.booked} />Booked/held</span></div></section>
    <section className={styles.card}><div className={styles.sectionTitle}><div><p className={styles.eyebrow}>AUDIENCE LIST</p><h2>{audience.length} bookings</h2></div><button className={styles.secondary} onClick={() => void reloadAudience()}>Refresh</button></div><div className={styles.filters}><label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label><button className={styles.primary} onClick={() => void reloadAudience()}>Apply filters</button><button className={styles.secondary} onClick={() => downloadReport("xlsx")}>Export Excel</button><button className={styles.secondary} onClick={() => downloadReport("pdf")}>Export PDF</button></div><div className={styles.tableWrap}><table><thead><tr><th>Name</th><th>Contact</th><th>Seat</th><th>Status</th><th>Created</th><th /></tr></thead><tbody>{audience.map((row) => <tr key={row.bookingId}><td>{row.fullName}</td><td>{row.contact}</td><td>{row.seatLabel ?? "—"}</td><td><span className={row.status === "booked" ? styles.statusBooked : styles.statusCancelled}>{row.status}</span></td><td>{new Date(row.createdAt).toLocaleString("id-ID")}</td><td><button className={styles.cancel} disabled={row.status === "cancelled"} onClick={() => void cancelBooking(row)}>Cancel</button></td></tr>)}</tbody></table>{audience.length === 0 && <p className={styles.empty}>No bookings for this program.</p>}</div></section>
  </main>;
}
