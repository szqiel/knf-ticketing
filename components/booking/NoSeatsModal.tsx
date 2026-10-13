"use client";

import styles from "./BookingModal.module.css";

type NoSeatsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NoSeatsModal({ open, onClose }: NoSeatsModalProps) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`${styles.dialog} ${styles.soldOutDialog}`} role="dialog" aria-modal="true" aria-labelledby="sold-out-title">
        <button className={styles.closeButton} type="button" aria-label="Close" onClick={onClose}>×</button>
        <p className={styles.eyebrow}>NO SEATS AVAILABLE</p>
        <h2 id="sold-out-title" className={styles.title}>Yah, kursinya sudah habis.</h2>
        <p className={styles.description}>Kamu tetap bisa kembali untuk melihat program dan film lainnya.</p>
        <button className={styles.submitButton} type="button" onClick={onClose}>Back to Program</button>
      </section>
    </div>
  );
}
