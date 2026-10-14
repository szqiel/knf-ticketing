"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { Seat } from "@/lib/contracts";
import styles from "./SeatMap.module.css";

export type SeatMapLayout = "grid" | "cinema";

export type SeatMapLegend = {
  available: string;
  selected: string;
  booked: string;
  blocked: string;
};

export type SeatMapCopy = {
  eyebrow: string;
  title: string;
  availabilitySuffix: string;
  swipeHint: string;
  screenLabel: string;
  summaryLabel: string;
  emptySeatLabel: string;
  confirmLabel: string;
  legend: SeatMapLegend;
};

export type SeatMapVisuals = {
  canvasMinWidth: number;
  seatMinSize: number;
  seatGap: number;
  canvasBottomPadding: number;
};

export type SeatMapProps = {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: Seat) => void;
  onConfirm: () => void;
  copy?: Partial<SeatMapCopy>;
  visuals?: Partial<SeatMapVisuals>;
  layout?: SeatMapLayout;
  showHeader?: boolean;
  showLegend?: boolean;
  showSwipeHint?: boolean;
  showAvailability?: boolean;
  confirmButtonState?: "auto" | "active" | "disabled";
  summaryCountLabel?: string;
};

const defaultCopy: SeatMapCopy = {
  eyebrow: "DENAH KURSI",
  title: "Pilih tempat dudukmu",
  availabilitySuffix: "kursi tersedia",
  swipeHint: "← Geser denah →",
  screenLabel: "LAYAR",
  summaryLabel: "YOUR SEAT",
  emptySeatLabel: "—",
  confirmLabel: "Confirm Seats",
  legend: {
    available: "Tersedia",
    selected: "Pilihanmu",
    booked: "Terisi",
    blocked: "Ditutup",
  },
};

const defaultVisuals: SeatMapVisuals = {
  canvasMinWidth: 944,
  seatMinSize: 36,
  seatGap: 7,
  canvasBottomPadding: 128,
};

type SeatMapStyle = CSSProperties & {
  "--seat-map-min-width": string;
  "--seat-map-seat-size": string;
  "--seat-map-gap": string;
  "--seat-map-bottom-padding": string;
};

const cinemaSections = [
  { key: "topLeft", rows: [9, 9, 9, 9, 9, 9, 9, 9] },
  { key: "topCenter", rows: [11, 12, 13, 13, 14, 14, 14, 15] },
  { key: "topRight", rows: [9, 9, 9, 9, 9, 9, 9, 9] },
  { key: "bottomLeft", rows: [6, 6, 6, 6, 6, 6, 6, 6] },
  { key: "bottomCenterLeft", rows: [8, 8, 8, 8, 9, 9, 9, 9, 9] },
  { key: "bottomCenterRight", rows: [8, 8, 8, 8, 9, 9, 9, 9, 9] },
  { key: "bottomRight", rows: [6, 6, 6, 6, 6, 6, 6, 6] },
] as const;

function isUnavailable(seat: Seat) {
  return seat.status !== "available";
}

function getSeatClass(seat: Seat, selected: boolean, layout: SeatMapLayout) {
  if (layout === "cinema") {
    return [
      styles.seat,
      styles.cinemaSeat,
      isUnavailable(seat) ? styles.cinemaSold : styles.cinemaAvailable,
      selected ? styles.cinemaSelected : "",
    ].filter(Boolean).join(" ");
  }

  return [
    styles.seat,
    isUnavailable(seat) ? styles[seat.status] : styles.available,
    selected ? styles.selected : "",
  ].filter(Boolean).join(" ");
}

function SeatButton({ seat, selected, layout, onSelectSeat }: {
  seat: Seat;
  selected: boolean;
  layout: SeatMapLayout;
  onSelectSeat: (seat: Seat) => void;
}) {
  const unavailable = isUnavailable(seat);

  return (
    <button
      className={getSeatClass(seat, selected, layout)}
      disabled={unavailable}
      type="button"
      aria-label={`Seat ${seat.label}${unavailable ? `, ${seat.status}` : ""}`}
      aria-pressed={selected}
      onClick={() => onSelectSeat(seat)}
    >
      {layout === "grid" ? seat.label : ""}
    </button>
  );
}

export function SeatLegend({ labels = defaultCopy.legend, className = "" }: { labels?: Partial<SeatMapLegend>; className?: string }) {
  const legend = { ...defaultCopy.legend, ...labels };

  return (
    <div className={`${styles.legend} ${className}`} aria-label="Seat status legend">
      <span><i className={`${styles.legendDot} ${styles.legendAvailable}`} /> {legend.available}</span>
      <span><i className={`${styles.legendDot} ${styles.legendSelected}`} /> {legend.selected}</span>
      <span><i className={`${styles.legendDot} ${styles.legendSold}`} /> {legend.booked}</span>
    </div>
  );
}

function CinemaSeatLayout({ seats, selectedSeatId, onSelectSeat }: {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: Seat) => void;
}) {
  return (
    <div className={styles.cinemaGrid}>
      {cinemaSections.map((section, sectionIndex) => {
        const sectionCount = section.rows.reduce((total, rowCount) => total + rowCount, 0);
        const sectionStart = cinemaSections
          .slice(0, sectionIndex)
          .reduce((total, currentSection) => total + currentSection.rows.reduce((rowTotal, rowCount) => rowTotal + rowCount, 0), 0);
        const sectionSeats = seats.slice(sectionStart, sectionStart + sectionCount);
        const maxColumns = Math.max(...section.rows);

        return (
          <div
            className={`${styles.cinemaBlock} ${styles[section.key]}`}
            key={section.key}
            style={{ "--section-columns": maxColumns } as CSSProperties}
          >
            {section.rows.map((rowCount, rowIndex) => {
              const rowStart = section.rows
                .slice(0, rowIndex)
                .reduce((total, currentRowCount) => total + currentRowCount, 0);
              const rowSeats = sectionSeats.slice(rowStart, rowStart + rowCount);

              return (
                <div className={styles.cinemaRow} key={`${section.key}-${rowIndex}`} style={{ "--row-columns": rowCount } as CSSProperties}>
                  {rowSeats.map((seat) => (
                    <SeatButton
                      key={seat.id}
                      layout="cinema"
                      seat={seat}
                      selected={seat.id === selectedSeatId}
                      onSelectSeat={onSelectSeat}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function SeatMap({
  seats,
  selectedSeatId,
  onSelectSeat,
  onConfirm,
  copy: copyOverrides,
  visuals: visualOverrides,
  layout = "grid",
  showHeader = true,
  showLegend = true,
  showSwipeHint = true,
  showAvailability = true,
  confirmButtonState = "auto",
  summaryCountLabel = "1 seat",
}: SeatMapProps) {
  const copy = {
    ...defaultCopy,
    ...copyOverrides,
    legend: { ...defaultCopy.legend, ...copyOverrides?.legend },
  };
  const visuals = { ...defaultVisuals, ...visualOverrides };
  const availableCount = seats.filter((seat) => seat.status === "available").length;
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);
  const [summarySeat, setSummarySeat] = useState<Seat | null>(selectedSeat ?? null);
  const [summaryVisible, setSummaryVisible] = useState(Boolean(selectedSeat));

  useEffect(() => {
    if (selectedSeat) {
      setSummarySeat(selectedSeat);
      const showFrame = window.requestAnimationFrame(() => setSummaryVisible(true));

      return () => window.cancelAnimationFrame(showFrame);
    }

    setSummaryVisible(false);
    const hideTimer = window.setTimeout(() => setSummarySeat(null), 180);

    return () => window.clearTimeout(hideTimer);
  }, [selectedSeat]);

  const confirmActive = confirmButtonState === "active"
    || (confirmButtonState === "auto" && Boolean(selectedSeat));
  const style: SeatMapStyle = {
    "--seat-map-min-width": `${visuals.canvasMinWidth}px`,
    "--seat-map-seat-size": `${visuals.seatMinSize}px`,
    "--seat-map-gap": `${visuals.seatGap}px`,
    "--seat-map-bottom-padding": `${visuals.canvasBottomPadding}px`,
  };

  return (
    <section className={`${styles.shell} ${layout === "cinema" ? styles.cinemaShell : ""}`} aria-label="Interactive seat map" style={style}>
      {showHeader && (
        <div className={styles.headerRow}>
          <div>
            {copy.eyebrow && <p className={styles.eyebrow}>{copy.eyebrow}</p>}
            <h1 className={styles.title}>{copy.title}</h1>
          </div>
          {showAvailability && <p className={styles.availability}>{availableCount} {copy.availabilitySuffix}</p>}
        </div>
      )}

      {showSwipeHint && <p className={styles.swipeHint} aria-hidden="true">{copy.swipeHint}</p>}

      <div className={`${styles.mapViewport} ${layout === "cinema" ? styles.cinemaViewport : ""}`}>
        <div className={`${styles.mapCanvas} ${layout === "cinema" ? styles.cinemaCanvas : ""}`}>
          {layout === "cinema" ? (
            <>
              <div className={styles.cinemaScreen}>{copy.screenLabel}</div>
              <CinemaSeatLayout seats={seats} selectedSeatId={selectedSeatId} onSelectSeat={onSelectSeat} />
            </>
          ) : (
            <>
              <div className={styles.screen}>{copy.screenLabel}</div>
              <div className={styles.seatGrid}>
                {seats.map((seat) => (
                  <SeatButton
                    key={seat.id}
                    layout="grid"
                    seat={seat}
                    selected={seat.id === selectedSeatId}
                    onSelectSeat={onSelectSeat}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showLegend && <SeatLegend labels={copy.legend} />}

      {summarySeat && (
        <aside
          className={`${styles.summaryRail} ${summaryVisible ? styles.summaryRailVisible : styles.summaryRailHidden}`}
          aria-live="polite"
        >
          <div>
            <span className={styles.summaryLabel}>{copy.summaryLabel}</span>
            <strong className={styles.summarySeat}>{summarySeat.label}</strong>
          </div>
          <span className={styles.selectedCount}>{summaryCountLabel}</span>
          <button
            className={`${styles.confirmButton} ${confirmActive ? styles.confirmActive : ""}`}
            disabled={confirmButtonState === "disabled"}
            type="button"
            onClick={onConfirm}
          >
            {copy.confirmLabel} <span aria-hidden="true">→</span>
          </button>
        </aside>
      )}
    </section>
  );
}
