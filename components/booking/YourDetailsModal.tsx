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
  error?: string | null;
  isSubmitting?: boolean;
};

export function YourDetailsModal({
  open,
  seatLabel,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: YourDetailsModalProps) {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="details-title">
        <h2 id="details-title" className={styles.title}>Your Details</h2>

        <form className={styles.form} onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ fullName, contact });
        }}>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.fields}>
            <label>
              <span>FULL NAME *</span>
              <input required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <label>
              <span>INSTAGRAM/PHONE NUMBER *</span>
              <input required minLength={3} maxLength={120} value={contact} onChange={(event) => setContact(event.target.value)} />
            </label>
          </div>

          <div className={styles.seatSummary} aria-label={`Selected seat ${seatLabel ?? "—"}`}>
            <span>YOUR SEAT</span>
            <strong>{seatLabel ?? "—"}</strong>
          </div>

          <div className={styles.actions}>
            <button className={styles.backButton} type="button" onClick={onClose}>
              <span aria-hidden="true">←</span> Back
            </button>
            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Confirm Booking"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
