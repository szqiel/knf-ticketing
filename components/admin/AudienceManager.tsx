"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { TicketPreviewModal, TicketPreviewData } from "./TicketPreviewModal";
import { PurgeConfirmModal } from "./PurgeConfirmModal";
import styles from "./AudienceManager.module.css";
import { Search, RefreshCw, Trash2, Eye, Ban } from "lucide-react";

type Program = {
  id: string;
  title: string;
  dayLabel: string | null;
};

type AudienceRow = {
  bookingId: string;
  programId: string;
  programTitle: string;
  seatLabel: string | null;
  fullName: string;
  contact: string;
  status: "booked" | "cancelled";
  source: string;
  createdAt: string;
  cancelledAt: string | null;
  cancelledReason: string | null;
};

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}

export function AudienceManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all");
  const [audience, setAudience] = useState<AudienceRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewTicket, setPreviewTicket] = useState<TicketPreviewData | null>(null);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const progData = await readJson<{ programs?: Program[] }>("/api/admin/programs");
      setPrograms(Array.isArray(progData?.programs) ? progData.programs : []);

      const query = new URLSearchParams();
      if (selectedProgramId && selectedProgramId !== "all") query.set("programId", selectedProgramId);
      if (fromDate) query.set("from", fromDate);
      if (toDate) query.set("to", toDate);

      const audienceData = await readJson<{ rows?: AudienceRow[]; audience?: AudienceRow[] }>(
        `/api/admin/audience?${query.toString()}`,
      );
      const rows = audienceData?.rows ?? audienceData?.audience ?? [];
      setAudience(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audience data");
      setAudience([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId, fromDate, toDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Client-side instant fuzzy search across name, contact/IG, and seat label
  const filteredAudience = useMemo(() => {
    const list = Array.isArray(audience) ? audience : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (row) =>
        (row.fullName || "").toLowerCase().includes(q) ||
        (row.contact || "").toLowerCase().includes(q) ||
        (row.seatLabel || "").toLowerCase().includes(q) ||
        (row.programTitle || "").toLowerCase().includes(q),
    );
  }, [audience, searchQuery]);

  const handleCancelBooking = async (row: AudienceRow) => {
    if (row.status === "cancelled") return;
    if (!confirm(`Cancel ticket for ${row.fullName} (${row.seatLabel ?? "No seat"})?`)) return;

    try {
      await readJson(`/api/admin/audience/${row.bookingId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ programId: row.programId, reason: "Cancelled by staff at door check" }),
      });
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel booking");
    }
  };

  const handleDeleteBooking = async (row: AudienceRow) => {
    if (
      !confirm(
        `PERMANENTLY DELETE booking for ${row.fullName}? Seat ${row.seatLabel} will be released immediately.`,
      )
    )
      return;

    try {
      await readJson(`/api/admin/audience/${row.bookingId}/delete?programId=${row.programId}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete booking");
    }
  };

  const handlePurge = async (targetProgramId?: string) => {
    try {
      await readJson("/api/admin/audience/purge", {
        method: "POST",
        body: JSON.stringify({
          programId: targetProgramId,
          confirmationKey: "PURGE_DEMO_DATA",
        }),
      });
      await loadData();
    } catch (e) {
      throw e;
    }
  };

  return (
    <AdminLayout>
      <div className={styles.pageWrapper}>
        {error && <div style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", padding: 12, borderRadius: 8 }}>{error}</div>}

        {/* Top Header & Actions */}
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <h2>Audience & Door Check</h2>
            <p>Search attendee names or IG handles to retrieve lost screenshot tickets, cancel, or delete test records.</p>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.purgeBtn} onClick={() => setPurgeModalOpen(true)}>
              <Trash2 size={15} />
              <span>Purge Test Bookings</span>
            </button>
            <button className={styles.refreshBtn} onClick={() => void loadData()}>
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Instant Search & Filter Bar */}
        <section className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label htmlFor="search-input">Instant Search (Name / IG / Seat):</label>
            <input
              id="search-input"
              type="text"
              placeholder="e.g. Budi, @filmfan, or C12..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="prog-filter">Filter by Program:</label>
            <select
              id="prog-filter"
              className={styles.selectInput}
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="all">⚡ All Programs ({audience?.length ?? 0} bookings)</option>
              {(programs ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="date-from">From:</label>
            <input
              id="date-from"
              type="date"
              className={styles.dateInput}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="date-to">To:</label>
            <input
              id="date-to"
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </section>

        {/* Audience Table */}
        <section className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Attendee Name</th>
                  <th>Contact / IG</th>
                  <th>Seat</th>
                  <th>Program Title</th>
                  <th>Status</th>
                  <th>Booked Time</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudience.map((row) => (
                  <tr key={row.bookingId}>
                    <td>
                      <strong style={{ color: "#ffffff" }}>{row.fullName}</strong>
                    </td>
                    <td style={{ color: "#7dd3fc" }}>{row.contact}</td>
                    <td>
                      <span className={styles.seatBadge}>{row.seatLabel ?? "—"}</span>
                    </td>
                    <td>{row.programTitle}</td>
                    <td>
                      <span className={row.status === "booked" ? styles.statusBooked : styles.statusCancelled}>
                        ● {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(row.createdAt).toLocaleString("id-ID")}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => setPreviewTicket(row)}
                          title="View attendee's ticket"
                        >
                          <Eye size={13} style={{ display: "inline", marginRight: 3 }} /> View
                        </button>
                        <button
                          className={styles.cancelBtn}
                          disabled={row.status === "cancelled"}
                          onClick={() => void handleCancelBooking(row)}
                          title="Cancel booking"
                        >
                          <Ban size={13} style={{ display: "inline", marginRight: 3 }} /> Cancel
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => void handleDeleteBooking(row)}
                          title="Permanently delete booking"
                        >
                          <Trash2 size={13} style={{ display: "inline", marginRight: 3 }} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAudience.length === 0 && !loading && (
              <div className={styles.emptyState}>No matching bookings found.</div>
            )}
            {loading && <div className={styles.emptyState}>Loading audience database…</div>}
          </div>
        </section>
      </div>

      {/* Ticket Preview Modal */}
      <TicketPreviewModal data={previewTicket} onClose={() => setPreviewTicket(null)} />

      {/* Purge Demo Data Modal */}
      <PurgeConfirmModal
        isOpen={purgeModalOpen}
        programs={programs}
        onClose={() => setPurgeModalOpen(false)}
        onConfirm={handlePurge}
      />
    </AdminLayout>
  );
}
