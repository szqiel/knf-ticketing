"use client";

import { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import styles from "./NoSeatsModal.module.css";

export interface NoSeatsModalProps {
  open: boolean;
  onClose: () => void;
  dayLabel?: string;
  timeSlot?: string;
  onChooseAnother?: () => void;
}

export function NoSeatsModal({
  open,
  onClose,
  dayLabel = "Sabtu",
  timeSlot = "01:23 — 01:23",
  onChooseAnother,
}: NoSeatsModalProps) {
  const router = useRouter();
  const uid = useId().replace(/:/g, "");

  const blueGradId = `nsBlueGrad-${uid}`;
  const yellowGradId = `nsYellowGrad-${uid}`;
  const shadowId = `nsShadow-${uid}`;
  const redGradId = `nsRedGrad-${uid}`;

  // Keyboard escape listener
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleChooseAnother = () => {
    if (onChooseAnother) {
      onChooseAnother();
    } else {
      onClose();
      router.push("/");
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`no-seats-title-${uid}`}
      >
        {/* 1. Close / Status Button (Figma Node #171:259 - #171:260) */}
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Tutup dialog kursi habis"
          onClick={onClose}
        >
          <svg
            viewBox="0 0 48 48"
            className={styles.closeSvg}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={redGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#790000" />
                <stop offset="53%" stopColor="#FF4646" />
                <stop offset="100%" stopColor="#DF0000" />
              </linearGradient>
            </defs>
            <path
              d="M12 12L36 36M36 12L12 36"
              stroke={`url(#${redGradId})`}
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* 2. Display Title: "No Seats Available" (Figma Node #171:261 - #171:262) */}
        <svg
          viewBox="0 0 380 144"
          className={styles.titleSvg}
          role="img"
          aria-labelledby={`no-seats-title-${uid}`}
        >
          <title id={`no-seats-title-${uid}`}>No Seats Available</title>
          <defs>
            {/* White-to-sky-blue gradient for "No Seats" */}
            <linearGradient id={blueGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#D5E8FF" />
              <stop offset="65%" stopColor="#6DA7FF" />
              <stop offset="100%" stopColor="#2565F6" />
            </linearGradient>

            {/* White-to-yellow gradient for "Available" */}
            <linearGradient id={yellowGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FFFF78" />
              <stop offset="100%" stopColor="#F6FF00" />
            </linearGradient>

            {/* Deep navy 3D drop shadow */}
            <filter
              id={shadowId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="0.1"
                floodColor="#000A69"
                floodOpacity="1"
              />
            </filter>
          </defs>

          {/* Line 1: No Seats */}
          <text
            x="190"
            y="56"
            textAnchor="middle"
            fill={`url(#${blueGradId})`}
            stroke="#000A69"
            strokeWidth="5"
            paintOrder="stroke fill"
            filter={`url(#${shadowId})`}
            className={styles.headingText}
          >
            No Seats
          </text>

          {/* Line 2: Available */}
          <text
            x="190"
            y="126"
            textAnchor="middle"
            fill={`url(#${yellowGradId})`}
            stroke="#000A69"
            strokeWidth="5"
            paintOrder="stroke fill"
            filter={`url(#${shadowId})`}
            className={styles.headingText}
          >
            Available
          </text>
        </svg>

        {/* 3. Schedule Pill (Figma Node #171:263 - #171:268) */}
        <div className={styles.schedulePill}>
          <span className={styles.dayText}>{dayLabel}</span>
          <span className={styles.timeText}>{timeSlot}</span>
        </div>

        {/* 4. Action Button: "Choose Another Program" (Figma Node #171:269 - #171:270) */}
        <button
          className={styles.primaryButton}
          type="button"
          onClick={handleChooseAnother}
        >
          Choose Another Program
        </button>
      </section>
    </div>
  );
}
