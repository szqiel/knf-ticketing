"use client";

import React from "react";
import styles from "./TicketPreviewModal.module.css";

export interface TicketPreviewData {
  bookingId: string;
  programTitle: string;
  seatLabel: string | null;
  fullName: string;
  contact: string;
  status: "booked" | "cancelled";
  createdAt: string;
}

interface TicketPreviewModalProps {
  data: TicketPreviewData | null;
  onClose: () => void;
}

export function TicketPreviewModal({ data, onClose }: TicketPreviewModalProps) {
  if (!data) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.ticketHeader}>
          <span className={styles.ticketBadge}>KNF 2026 E-TICKET VERIFICATION</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close ticket preview">
            ×
          </button>
        </div>

        <div className={styles.ticketBody}>
          <h2 className={styles.programTitle}>{data.programTitle}</h2>
          <div className={styles.metaRow}>
            <span>TICKET ID: {data.bookingId.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className={styles.seatBox}>
            <div className={styles.seatLabel}>ALLOCATED SEAT</div>
            <div className={styles.seatNumber}>{data.seatLabel ?? "UNASSIGNED"}</div>
          </div>

          <div className={styles.attendeeInfo}>
            <div className={styles.attendeeRow}>
              <span className={styles.rowLabel}>Attendee:</span>
              <span className={styles.rowValue}>{data.fullName}</span>
            </div>
            <div className={styles.attendeeRow}>
              <span className={styles.rowLabel}>Contact / IG:</span>
              <span className={styles.rowValue}>{data.contact}</span>
            </div>
            <div className={styles.attendeeRow}>
              <span className={styles.rowLabel}>Status:</span>
              <span className={data.status === "booked" ? styles.statusPillBooked : styles.statusPillCancelled}>
                {data.status.toUpperCase()}
              </span>
            </div>
            <div className={styles.attendeeRow}>
              <span className={styles.rowLabel}>Booked At:</span>
              <span className={styles.rowValue}>{new Date(data.createdAt).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className={styles.ticketFooter}>
          <button className={styles.doneBtn} onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
