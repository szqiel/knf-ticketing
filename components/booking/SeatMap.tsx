"use client";

import type { Seat } from "@/lib/contracts";
import styles from "./SeatMap.module.css";

type SeatMapProps = {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: Seat) => void;
  onConfirm: () => void;
};

function isUnavailable(seat: Seat) {
  return seat.status !== "available";
}

export function SeatMap({ seats, selectedSeatId, onSelectSeat, onConfirm }: SeatMapProps) {
  const availableCount = seats.filter((seat) => seat.status === "available").length;
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);

  return (
    <section className={styles.shell} aria-label="Interactive seat map">
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>DENAH KURSI</p>
          <h1 className={styles.title}>Pilih tempat dudukmu</h1>
        </div>
        <p className={styles.availability}>{availableCount} kursi tersedia</p>
      </div>

      <p className={styles.swipeHint} aria-hidden="true">← Geser denah →</p>

      <div className={styles.mapViewport}>
        <div className={styles.mapCanvas}>
          <div className={styles.screen}>LAYAR</div>
          <div className={styles.seatGrid}>
            {seats.map((seat) => {
              const unavailable = isUnavailable(seat);
              const selected = seat.id === selectedSeatId;
              const seatClass = [
                styles.seat,
                unavailable ? styles[seat.status] : styles.available,
                selected ? styles.selected : "",
              ].filter(Boolean).join(" ");

              return (
                <button
                  className={seatClass}
                  disabled={unavailable}
                  key={seat.id}
                  type="button"
                  aria-label={`Seat ${seat.label}${unavailable ? `, ${seat.status}` : ""}`}
                  aria-pressed={selected}
                  onClick={() => onSelectSeat(seat)}
                >
                  {seat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.legend} aria-label="Seat status legend">
        <span><i className={`${styles.legendDot} ${styles.available}`} /> Tersedia</span>
        <span><i className={`${styles.legendDot} ${styles.selected}`} /> Pilihanmu</span>
        <span><i className={`${styles.legendDot} ${styles.booked}`} /> Terisi</span>
        <span><i className={`${styles.legendDot} ${styles.blocked}`} /> Ditutup</span>
      </div>

      <aside className={styles.summaryRail} aria-live="polite">
        <div>
          <span className={styles.summaryLabel}>YOUR SEAT</span>
          <strong className={styles.summarySeat}>{selectedSeat?.label ?? "—"}</strong>
        </div>
        <button
          className={`${styles.confirmButton} ${selectedSeat ? styles.confirmActive : ""}`}
          disabled={!selectedSeat}
          type="button"
          onClick={onConfirm}
        >
          Confirm Seats <span aria-hidden="true">→</span>
        </button>
      </aside>
    </section>
  );
}
