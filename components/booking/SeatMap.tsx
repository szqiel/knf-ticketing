"use client";

import type { CSSProperties } from "react";
import type { Seat } from "@/lib/contracts";
import { CANONICAL_SEATS } from "@/lib/booking/canonical-seats";
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
  screenLabel: "S C R E E N",
  summaryLabel: "YOUR SEATS",
  emptySeatLabel: "None selected",
  confirmLabel: "Confirm Seats",
  legend: {
    available: "Available",
    selected: "Selected",
    booked: "Sold",
    blocked: "Sold",
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

function isUnavailable(seat: Seat) {
  return seat.status !== "available";
}

/**
 * Exact SVG glyph extracted from Figma node 179:18142 (viewBox 0 0 25 23).
 * Oriented with backrest towards screen and cushion tab towards back/bottom.
 */
function ChairGlyph() {
  return (
    <svg className={styles.chairSvg} viewBox="0 0 25 23" fill="none" aria-hidden="true">
      {/* Bottom cushion tab */}
      <path
        d="M22.5212 19.9765V20.4708C22.5212 21.4727 21.6521 22.2848 20.5798 22.2848H4.42492C3.35266 22.2848 2.48351 21.4727 2.48351 20.4708V19.9765C2.48351 18.9746 3.35266 18.1625 4.42492 18.1625H20.5798C21.6521 18.1625 22.5212 18.9746 22.5212 19.9765Z"
        className={styles.chairPart}
      />
      {/* Left armrest */}
      <path
        d="M2.7386 18.5197H2.21901C1.11368 18.5197 0.220916 17.6856 0.220916 16.6528L0.220916 2.08776C0.220916 1.05497 1.11368 0.2208 2.21901 0.2208H2.7386C3.84393 0.2208 4.73669 1.05497 4.73669 2.08776L4.73669 16.6528C4.73669 17.6856 3.84393 18.5197 2.7386 18.5197Z"
        className={styles.chairPart}
      />
      {/* Right armrest */}
      <path
        d="M22.7809 18.5197H22.2614C21.156 18.5197 20.2633 17.6856 20.2633 16.6528V2.08776C20.2633 1.05497 21.156 0.2208 22.2614 0.2208H22.7809C23.8863 0.2208 24.7791 1.05497 24.7791 2.08776V16.6528C24.7838 17.6856 23.8863 18.5197 22.7809 18.5197Z"
        className={styles.chairPart}
      />
      {/* Backrest / main seat body */}
      <path
        d="M22.5212 2.71893V16.0261C22.5212 17.306 21.4112 18.3432 20.0413 18.3432H4.9587C3.58884 18.3432 2.47878 17.306 2.47878 16.0261V2.71893C2.47878 1.43897 3.58884 0.401765 4.9587 0.401765H20.0413C21.4112 0.401765 22.5212 1.43897 22.5212 2.71893Z"
        className={styles.chairPart}
      />
    </svg>
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

function CinemaSeatLayout({
  seats,
  selectedSeatId,
  onSelectSeat,
}: {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: Seat) => void;
}) {
  // Use canonical layout geometry coordinates (x, y, rotation)
  // Ensure we fall back to canonical positions if seat items lack layout coordinates.
  const canonicalMap = new Map(CANONICAL_SEATS.map((s) => [s.id, s]));

  return (
    <div className={styles.cinemaStage}>
      {seats.map((seat) => {
        const canonical = canonicalMap.get(seat.id) ?? canonicalMap.get(`seat-${seat.rowName}-${seat.number}`);
        const x = seat.x || canonical?.x || 0;
        const y = seat.y || canonical?.y || 0;
        const rotation = seat.rotation !== undefined ? seat.rotation : canonical?.rotation || 0;
        const selected = seat.id === selectedSeatId;
        const unavailable = isUnavailable(seat);

        // Compute percentage in 2371 x 1344 auditorium coordinate frame
        const leftPct = (x / 2371) * 100;
        const topPct = (y / 1344) * 100;

        let statusClass = styles.cinemaAvailable;
        if (unavailable) {
          statusClass = seat.status === "blocked" ? styles.cinemaBlocked : styles.cinemaSold;
        }

        return (
          <button
            key={seat.id}
            type="button"
            className={`${styles.cinemaSeatButton} ${statusClass} ${selected ? styles.cinemaSelected : ""}`}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
            disabled={unavailable}
            aria-label={`Seat ${seat.label}${unavailable ? `, ${seat.status}` : ""}`}
            aria-pressed={selected}
            title={`Seat ${seat.label}`}
            onClick={() => onSelectSeat(seat)}
          >
            <ChairGlyph />
          </button>
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
  summaryCountLabel,
}: SeatMapProps) {
  const copy = {
    ...defaultCopy,
    ...copyOverrides,
    legend: { ...defaultCopy.legend, ...copyOverrides?.legend },
  };
  const visuals = { ...defaultVisuals, ...visualOverrides };
  const availableCount = seats.filter((seat) => seat.status === "available").length;
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);
  const confirmActive = confirmButtonState === "active"
    || (confirmButtonState === "auto" && Boolean(selectedSeat));

  const countDisplay = summaryCountLabel
    ?? (selectedSeat ? "1 seat" : "0 seats");

  const style: SeatMapStyle = {
    "--seat-map-min-width": `${visuals.canvasMinWidth}px`,
    "--seat-map-seat-size": `${visuals.seatMinSize}px`,
    "--seat-map-gap": `${visuals.seatGap}px`,
    "--seat-map-bottom-padding": `${visuals.canvasBottomPadding}px`,
  };

  return (
    <section
      className={`${styles.shell} ${layout === "cinema" ? styles.cinemaShell : ""}`}
      aria-label="Interactive seat map"
      style={style}
    >
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
              <div className={styles.cinemaScreenHeader}>
                <div className={styles.cinemaScreenBar} />
                <span className={styles.cinemaScreenText}>{copy.screenLabel}</span>
              </div>
              <CinemaSeatLayout seats={seats} selectedSeatId={selectedSeatId} onSelectSeat={onSelectSeat} />
            </>
          ) : (
            <>
              <div className={styles.screen}>{copy.screenLabel}</div>
              <div className={styles.seatGrid}>
                {seats.map((seat) => {
                  const selected = seat.id === selectedSeatId;
                  const unavailable = isUnavailable(seat);
                  return (
                    <button
                      key={seat.id}
                      className={`${styles.seat} ${unavailable ? styles[seat.status] : styles.available} ${selected ? styles.selected : ""}`}
                      disabled={unavailable}
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
            </>
          )}
        </div>
      </div>

      {showLegend && <SeatLegend labels={copy.legend} />}

      {/* Floating Bottom Summary Rail (1:1 Figma match node 102:962 & 174:14496) */}
      <aside className={styles.bottomRail} aria-live="polite">
        <div className={styles.bottomRailLeft}>
          <span className={styles.bottomRailEyebrow}>{copy.summaryLabel}</span>
          <strong className={styles.bottomRailSeat}>
            {selectedSeat ? selectedSeat.label : copy.emptySeatLabel}
          </strong>
        </div>
        <span className={styles.bottomRailCount}>{countDisplay}</span>
        <button
          className={`${styles.bottomRailButton} ${confirmActive ? styles.bottomRailButtonActive : styles.bottomRailButtonIdle} ${confirmButtonState === "disabled" ? styles.bottomRailButtonDisabled : ""}`}
          disabled={confirmButtonState === "disabled"}
          type="button"
          onClick={onConfirm}
        >
          <span className={styles.buttonText}>
            {copy.confirmLabel} <span aria-hidden="true">→</span>
          </span>
        </button>
      </aside>
      <div className={styles.bottomRailSpacer} aria-hidden="true" />
    </section>
  );
}
