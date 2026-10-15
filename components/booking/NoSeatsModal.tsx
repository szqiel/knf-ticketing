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

  const fillGradId = `text-fill-grad-${uid}`;
  const strokeGradId = `text-stroke-grad-${uid}`;
  const shadowId = `text-shadow-${uid}`;

  // Keyboard Escape listener
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
      {/* Modal Dialog Container (#171:256) */}
      <div
        className={styles.dialogCard}
        role="dialog"
        aria-labelledby={`dialog-title-${uid}`}
        aria-modal="true"
      >
        <div className={styles.dialogInner}>
          {/* Close Button (#171:258, #171:259, #171:260) */}
          <div className={styles.closeButtonWrapper}>
            <button
              className={styles.closeBtn}
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* Title: "No Seats Available" (#171:261, #171:262) */}
          <div className={styles.titleContainer}>
            <svg
              className={styles.svgTitle}
              viewBox="0 0 389 160"
              aria-label="No Seats Available"
            >
              <defs>
                {/* Fill Gradient: #FFFFFF -> #F6FF00 */}
                <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
                  <stop offset="100%" stopColor="rgba(246, 255, 0, 1)" />
                </linearGradient>

                {/* Multi-stop Stroke Gradient */}
                <linearGradient id={strokeGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0, 17, 173, 1)" />
                  <stop offset="21%" stopColor="rgba(207, 212, 253, 1)" />
                  <stop offset="27%" stopColor="rgba(2, 22, 207, 1)" />
                  <stop offset="51%" stopColor="rgba(1, 22, 207, 1)" />
                  <stop offset="62%" stopColor="rgba(239, 241, 255, 1)" />
                  <stop offset="74%" stopColor="rgba(0, 21, 207, 1)" />
                </linearGradient>

                {/* Text Shadow: 0px 4px 0px 0px rgba(0, 10, 105, 1) */}
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
                    stdDeviation="0"
                    floodColor="rgba(0, 10, 105, 1)"
                  />
                </filter>
              </defs>

              <text
                id={`dialog-title-${uid}`}
                x="194.5"
                y="55"
                className={styles.svgTitleText}
                fill={`url(#${fillGradId})`}
                stroke={`url(#${strokeGradId})`}
                filter={`url(#${shadowId})`}
              >
                No Seats
              </text>
              <text
                x="194.5"
                y="118"
                className={styles.svgTitleText}
                fill={`url(#${fillGradId})`}
                stroke={`url(#${strokeGradId})`}
                filter={`url(#${shadowId})`}
              >
                Available
              </text>
            </svg>
          </div>

          {/* Schedule Badge (#171:263, #171:264, #171:266, #171:268) */}
          <div className={styles.scheduleBadgeContainer}>
            <div className={styles.scheduleBadge}>
              <div className={styles.scheduleDay}>{dayLabel}</div>
              <div className={styles.scheduleTime}>{timeSlot}</div>
            </div>
          </div>

          {/* Primary Action Button (#171:269, #171:270) */}
          <div className={styles.primaryBtnWrapper}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={handleChooseAnother}
            >
              Choose Another Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
