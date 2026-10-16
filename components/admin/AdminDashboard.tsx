"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import styles from "./AdminDashboard.module.css";
import { RefreshCw } from "lucide-react";

type Program = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  dayLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  bookingOpen: boolean;
};

type AdminSeat = {
  id: string;
  label: string;
  rowName: string;
  number: number;
  status: "available" | "held" | "booked" | "blocked";
  fixedBlocked: boolean;
  blockedReason: string | null;
};

type FestivalKpis = {
  totalPrograms: number;
  openProgramsCount: number;
  totalBookings: number;
  validBookings: number;
  cancelledBookings: number;
};

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = { error: `Server returned ${response.status} (${text.slice(0, 100) || response.statusText})` };
  }
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : `Request failed with status ${response.status}`);
  }
  return body as T;
}

export default function AdminDashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [seats, setSeats] = useState<AdminSeat[]>([]);
  const [kpis, setKpis] = useState<FestivalKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [busySeat, setBusySeat] = useState<string | null>(null);
  const [isTogglingBooking, setIsTogglingBooking] = useState(false);
  const [error, setError] = useState("");

  const loadInitialData = useCallback(async () => {
    try {
      const [progData, kpiData] = await Promise.all([
        readJson<{ programs: Program[] }>("/api/admin/programs"),
        readJson<FestivalKpis>("/api/admin/kpis"),
      ]);
      setPrograms(progData.programs);
      setKpis(kpiData);
      setProgramId((curr) => curr || progData.programs[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSeatMap = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const seatData = await readJson<{ seats: AdminSeat[] }>(`/api/admin/programs/${id}/seats`);
      setSeats(seatData.seats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load seat map");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadInitialData();
    return () => {
      active = false;
    };
  }, [loadInitialData]);

  useEffect(() => {
    if (programId) void loadSeatMap(programId);
  }, [programId, loadSeatMap]);

  // Real-time SSE stream & fallback sync
  useEffect(() => {
    if (!programId) return;
    let source: EventSource | null = null;
    const refresh = () => {
      void loadSeatMap(programId);
      void readJson<FestivalKpis>("/api/admin/kpis").then(setKpis).catch(() => {});
    };

    try {
      source = new EventSource(`/api/programs/${programId}/stream`);
      source.addEventListener("seats_changed", refresh);
      source.onerror = () => {
        // SSE disconnected or unsupported on pooler; fallback polling guarantees fresh data
      };
    } catch {
      // EventSource not supported
    }

    // Polling fallback every 4s while admin is looking at the dashboard
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }, 4000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (source) {
        source.removeEventListener("seats_changed", refresh);
        source.close();
      }
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [programId, loadSeatMap]);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === programId),
    [programs, programId],
  );

  const rows = useMemo(
    () => [...new Set(seats.map((seat) => seat.rowName))].sort(),
    [seats],
  );

  const availableCount = useMemo(
    () => seats.filter((s) => s.status === "available").length,
    [seats],
  );
  const bookedCount = useMemo(
    () => seats.filter((s) => s.status === "booked").length,
    [seats],
  );
  const heldCount = useMemo(
    () => seats.filter((s) => s.status === "held").length,
    [seats],
  );
  const blockedCount = useMemo(
    () => seats.filter((s) => s.status === "blocked").length,
    [seats],
  );

  const toggleSeat = async (seat: AdminSeat) => {
    if (seat.fixedBlocked || busySeat || ["held", "booked"].includes(seat.status)) return;
    setBusySeat(seat.id);
    setError("");
    try {
      const data = await readJson<{ seats: AdminSeat[] }>(
        `/api/admin/programs/${programId}/seats`,
        {
          method: "PATCH",
          body: JSON.stringify({
            seatId: seat.id,
            blocked: seat.status !== "blocked",
          }),
        },
      );
      setSeats(data.seats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update seat");
    } finally {
      setBusySeat(null);
    }
  };

  const handleToggleBooking = async () => {
    if (!selectedProgram || isTogglingBooking) return;
    setIsTogglingBooking(true);
    setError("");
    const newStatus = !selectedProgram.bookingOpen;
    try {
      const res = await readJson<{ program: Program }>(`/api/admin/programs/${programId}`, {
        method: "PATCH",
        body: JSON.stringify({ bookingOpen: newStatus }),
      });
      setPrograms((prev) =>
        prev.map((p) => (p.id === programId ? { ...p, bookingOpen: res.program.bookingOpen } : p)),
      );
      void readJson<FestivalKpis>("/api/admin/kpis").then(setKpis).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle booking status");
    } finally {
      setIsTogglingBooking(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          Loading festival operations center…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.pageWrapper}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Festival KPI Cards */}
        <section className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Total Festival Bookings</p>
            <p className={styles.kpiValue}>{kpis?.validBookings ?? 0}</p>
            <p className={styles.kpiSub}>{kpis?.cancelledBookings ?? 0} tickets cancelled</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Selected Program Available</p>
            <p className={styles.kpiValue} style={{ color: "#38bdf8" }}>
              {availableCount}
            </p>
            <p className={styles.kpiSub}>Seats ready for booking</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Selected Program Booked</p>
            <p className={styles.kpiValue} style={{ color: "#f43f5e" }}>
              {bookedCount}
            </p>
            <p className={styles.kpiSub}>{heldCount} seats currently on hold</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Open Screenings</p>
            <p className={styles.kpiValue} style={{ color: "#4ade80" }}>
              {kpis?.openProgramsCount ?? 0} / {kpis?.totalPrograms ?? 8}
            </p>
            <p className={styles.kpiSub}>Programs accepting reservations</p>
          </div>
        </section>

        {/* Program Control Toolbar */}
        <section className={styles.controlCard}>
          <div className={styles.programSelectGroup}>
            <label htmlFor="prog-select" className={styles.selectLabel}>
              Active Program:
            </label>
            <select
              id="prog-select"
              className={styles.programSelect}
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.subtitle ? `· ${p.subtitle}` : ""} ({p.dayLabel ?? "Festival"})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.statusToggleGroup}>
            <span className={selectedProgram?.bookingOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed}>
              {selectedProgram?.bookingOpen ? "● BOOKING OPEN" : "○ BOOKING CLOSED"}
            </span>
            <button
              onClick={handleToggleBooking}
              disabled={isTogglingBooking}
              className={`${styles.toggleBtn} ${selectedProgram?.bookingOpen ? styles.btnOpen : styles.btnClose}`}
            >
              {isTogglingBooking
                ? "Updating..."
                : selectedProgram?.bookingOpen
                ? "Close Bookings Now"
                : "Open Bookings Now"}
            </button>
            <button
              onClick={() => {
                void loadSeatMap(programId);
                void readJson<FestivalKpis>("/api/admin/kpis").then(setKpis).catch(() => {});
              }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#94a3b8",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Refresh seat grid"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </section>

        {/* Live Cinema Hall Seat Blocker Grid */}
        <section className={styles.seatMapCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>LIVE HALL SEAT BLOCKER</p>
              <h2 className={styles.sectionTitle}>
                {selectedProgram?.title}: {seats.length} Total Physical Seats
              </h2>
            </div>
            <div className={styles.legendBar}>
              <span className={styles.legendItem}>
                <i className={`${styles.legendDot} ${styles.dotAvailable}`} /> Available ({availableCount})
              </span>
              <span className={styles.legendItem}>
                <i className={`${styles.legendDot} ${styles.dotHeld}`} /> On Hold ({heldCount})
              </span>
              <span className={styles.legendItem}>
                <i className={`${styles.legendDot} ${styles.dotBooked}`} /> Booked ({bookedCount})
              </span>
              <span className={styles.legendItem}>
                <i className={`${styles.legendDot} ${styles.dotBlocked}`} /> Blocked ({blockedCount})
              </span>
              <span className={styles.legendItem}>
                <i className={`${styles.legendDot} ${styles.dotFixed}`} /> Fixed VIP / Sound Booth
              </span>
            </div>
          </div>

          <div className={styles.seatScrollArea}>
            {rows.map((row) => (
              <div className={styles.seatRow} key={row}>
                <span className={styles.rowLabel}>{row}</span>
                {seats
                  .filter((seat) => seat.rowName === row)
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    let seatClass = styles.seatAvailable;
                    if (seat.fixedBlocked) seatClass = styles.seatFixed;
                    else if (seat.status === "held") seatClass = styles.seatHeld;
                    else if (seat.status === "booked") seatClass = styles.seatBooked;
                    else if (seat.status === "blocked") seatClass = styles.seatBlocked;

                    return (
                      <button
                        key={seat.id}
                        title={`Seat ${seat.label} - ${seat.blockedReason ?? seat.status.toUpperCase()}`}
                        disabled={seat.fixedBlocked || ["held", "booked"].includes(seat.status)}
                        className={`${styles.seatBtn} ${seatClass}`}
                        onClick={() => void toggleSeat(seat)}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
