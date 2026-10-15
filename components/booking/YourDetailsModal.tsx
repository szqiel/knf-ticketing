"use client";

import { useState } from "react";
import Image from "next/image";
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

  const isFormValid = fullName.trim().length >= 2 && contact.trim().length >= 3;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div className={styles.titleWrapper}>
          <Image
            id="details-title"
            src="/assets/Your Details.png"
            alt="Your Details"
            width={286}
            height={50}
            priority
            className={styles.titleImage}
          />
        </div>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (!isFormValid || isSubmitting) return;
            onSubmit({ fullName: fullName.trim(), contact: contact.trim() });
          }}
        >
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <div className={styles.fields}>
            <label>
              <span>FULL NAME *</span>
              <input
                required
                minLength={2}
                maxLength={120}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>
            <label>
              <span>INSTAGRAM/PHONE NUMBER *</span>
              <input
                required
                minLength={3}
                maxLength={120}
                placeholder="@username or 08xxxxxxxxxx"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.seatSummary} aria-label={`Selected seat ${seatLabel ?? "—"}`}>
            <span>YOUR SEAT</span>
            <strong>{seatLabel ?? "—"}</strong>
          </div>

          <div className={styles.actions}>
            <button className={styles.backButton} type="button" onClick={onClose} disabled={isSubmitting}>
              <span aria-hidden="true">←</span> Back
            </button>
            <button
              className={`${styles.submitButton} ${isFormValid ? styles.submitButtonActive : styles.submitButtonIdle}`}
              type="submit"
              disabled={!isFormValid || isSubmitting}
            >
              <span className={styles.submitButtonText}>
                {isSubmitting ? "Saving…" : "Confirm Booking"} <span aria-hidden="true">→</span>
              </span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
