"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import styles from "./ReportsManager.module.css";
import { FileSpreadsheet, FileText, Download } from "lucide-react";

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

type AudienceRow = {
  bookingId: string;
  programId: string;
  programTitle: string;
  seatLabel: string | null;
  fullName: string;
  contact: string;
  status: "booked" | "cancelled";
  createdAt: string;
};

async function readJson<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed");
  return (await res.json()) as T;
}

export function ReportsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [audience, setAudience] = useState<AudienceRow[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [progData, audData] = await Promise.all([
        readJson<{ programs?: Program[] }>("/api/admin/programs"),
        readJson<{ rows?: AudienceRow[]; audience?: AudienceRow[] }>("/api/admin/audience"),
      ]);
      setPrograms(Array.isArray(progData?.programs) ? progData.programs : []);
      const audRows = audData?.rows ?? audData?.audience ?? [];
      setAudience(Array.isArray(audRows) ? audRows : []);
    } catch (e) {
      console.error(e);
      setPrograms([]);
      setAudience([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleExport = (format: "xlsx" | "pdf") => {
    const params = new URLSearchParams({ format });
    if (selectedProgramId && selectedProgramId !== "all") params.set("programId", selectedProgramId);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    window.open(`/api/admin/reports/export?${params.toString()}`, "_blank");
  };

  const safeAudience = Array.isArray(audience) ? audience : [];
  const safePrograms = Array.isArray(programs) ? programs : [];
  const totalBookings = safeAudience.length;
  const validBookings = safeAudience.filter((a) => a.status === "booked").length;
  const cancelledBookings = safeAudience.filter((a) => a.status === "cancelled").length;

  // Breakdown per program
  const programBreakdown = safePrograms.map((p) => {
    const progsBookings = safeAudience.filter((a) => a.programId === p.id);
    const valid = progsBookings.filter((a) => a.status === "booked").length;
    const cancelled = progsBookings.filter((a) => a.status === "cancelled").length;
    // Capacity: 506 physical seats in cinema hall
    const capacity = 506;
    const occupancyRate = Math.round((valid / capacity) * 100);

    return {
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      dayLabel: p.dayLabel,
      timeSlot: p.startsAt && p.endsAt ? `${p.startsAt.slice(0, 5)} - ${p.endsAt.slice(0, 5)}` : "—",
      capacity,
      valid,
      cancelled,
      occupancyRate,
      bookingOpen: p.bookingOpen,
    };
  });

  return (
    <AdminLayout>
      <div className={styles.pageWrapper}>
        {/* Top Header & Export Actions */}
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <h2>Festival Reports & Exports</h2>
            <p>Download branded Excel spreadsheets and A4 PDF summaries for festival archives.</p>
          </div>
          <div className={styles.exportButtons}>
            <button className={styles.excelBtn} onClick={() => handleExport("xlsx")}>
              <FileSpreadsheet size={16} />
              <span>Export Excel (.xlsx)</span>
            </button>
            <button className={styles.pdfBtn} onClick={() => handleExport("pdf")}>
              <FileText size={16} />
              <span>Export PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <section className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Total Audience Records</p>
            <p className={styles.kpiValue}>{totalBookings}</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Confirmed Active Tickets</p>
            <p className={styles.kpiValue} style={{ color: "#38bdf8" }}>
              {validBookings}
            </p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Cancelled Tickets</p>
            <p className={styles.kpiValue} style={{ color: "#f87171" }}>
              {cancelledBookings}
            </p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Total Hall Capacity</p>
            <p className={styles.kpiValue} style={{ color: "#4ade80" }}>
              {programs.length * 506} Seats
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label htmlFor="rep-prog">Program Filter:</label>
            <select
              id="rep-prog"
              className={styles.select}
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="all">⚡ All Programs Combined</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="rep-from">From:</label>
            <input
              id="rep-from"
              type="date"
              className={styles.dateInput}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="rep-to">To:</label>
            <input
              id="rep-to"
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </section>

        {/* Program Breakdown Table */}
        <section className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Program / Session</th>
                  <th>Schedule</th>
                  <th>Hall Capacity</th>
                  <th>Confirmed</th>
                  <th>Cancelled</th>
                  <th>Occupancy Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {programBreakdown.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong style={{ color: "#ffffff" }}>{row.title}</strong>
                      {row.subtitle && (
                        <div style={{ color: "#93c5fd", fontSize: "0.78rem" }}>{row.subtitle}</div>
                      )}
                    </td>
                    <td>
                      {row.dayLabel} • {row.timeSlot}
                    </td>
                    <td>{row.capacity} seats</td>
                    <td style={{ color: "#38bdf8", fontWeight: 800 }}>{row.valid}</td>
                    <td style={{ color: "#f87171" }}>{row.cancelled}</td>
                    <td>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${Math.min(100, row.occupancyRate)}%` }}
                        />
                      </div>
                      <span>{row.occupancyRate}%</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "9999px",
                          background: row.bookingOpen ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: row.bookingOpen ? "#4ade80" : "#f87171",
                          border: `1px solid ${row.bookingOpen ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                        }}
                      >
                        {row.bookingOpen ? "OPEN" : "CLOSED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <p style={{ textAlign: "center", color: "#64748b", padding: 30 }}>Loading reports…</p>}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
