"use client";

import { useState } from "react";
import styles from "./BookingModal.module.css";

export type BookingDetails = {
  fullName: string;
  contact: string;
};

type YourDetailsModalProps = {
  open: boolean;
  seatLabel: string | null;
  onClose: () => void;
  onSubmit: (details: BookingDetails) => void | Promise<void>;
  expiresInSeconds?: number | null;
  error?: string | null;
  isSubmitting?: boolean;
};

export function YourDetailsModal({
  open,
  seatLabel,
  onClose,
  onSubmit,
  expiresInSeconds,
  error,
  isSubmitting = false,
}: YourDetailsModalProps) {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="details-title">
        <button className={styles.closeButton} type="button" aria-label="Close" onClick={onClose}>×</button>
        <p className={styles.eyebrow}>SEAT {seatLabel ?? "—"}</p>
        <h2 id="details-title" className={styles.title}>Your details</h2>
        <p className={styles.description}>Isi data ini untuk menyelesaikan reservasi gratis kamu.</p>
        {expiresInSeconds !== null && expiresInSeconds !== undefined && (
          <p className={styles.holdTimer} role="status">
            Seat held for {Math.floor(expiresInSeconds / 60)}:{String(expiresInSeconds % 60).padStart(2, "0")}
          </p>
        )}
        {error && <p className={styles.formError} role="alert">{error}</p>}

        <form className={styles.form} onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ fullName, contact });
        }}>
          <label>
            <span>FULL NAME *</span>
            <input required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label>
            <span>INSTAGRAM/PHONE NUMBER *</span>
            <input required minLength={3} maxLength={120} value={contact} onChange={(event) => setContact(event.target.value)} />
          </label>
          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Confirm Booking"} <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </div>
  );
}
