"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingResponse } from "@/lib/contracts";
import styles from "./SuccessTicket.module.css";

type SuccessTicketProps = {
  booking: BookingResponse;
  backHref: string;
  dayLabel: string;
  programTitle: string;
  timeSlot: string;
};

const TOTAL_COUNTDOWN_SECONDS = 10;

export function SuccessTicket({
  backHref,
  booking,
  dayLabel,
  programTitle,
  timeSlot,
}: SuccessTicketProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_COUNTDOWN_SECONDS);

  const resetKioskAndNavigate = (targetHref: string) => {
    try {
      window.sessionStorage.removeItem("knf26.seat-map.active");
      window.sessionStorage.removeItem("knf26.booking.session");
    } catch {
      // Ignore sessionStorage issues safely
    }
    router.replace(targetHref);
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      resetKioskAndNavigate("/");
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / TOTAL_COUNTDOWN_SECONDS) * 100));

  return (
    <main className={styles.page} aria-live="polite">
      <div className={styles.canvas}>
        {/* Top Header Row (#179:14516) */}
        <header className={styles.topBar}>
          <Link
            className={styles.backButton}
            href={backHref}
            onClick={(e) => {
              e.preventDefault();
              resetKioskAndNavigate(backHref);
            }}
          >
            <span aria-hidden="true">←</span> Back
          </Link>

          <div className={styles.stepper} aria-label="Booking progress">
            <span>1 PROGRAM</span>
            <i aria-hidden="true" />
            <span>2 SEATS</span>
            <i aria-hidden="true" />
            <span className={styles.stepActive}>3 DONE</span>
          </div>

          <div className={styles.logoWrapper}>
            <Image
              className={styles.logoImage}
              src="/assets/knf-logo.png"
              alt="KNF 26 Logo"
              width={46}
              height={46}
              priority
            />
          </div>
        </header>

        {/* Center Row: Selamat Bersinema + Button & Ticket Card (#102:1195) */}
        <section className={styles.confirmation} aria-label="Booking confirmed">
          <div className={styles.titleColumn}>
            <Image
              className={styles.titleGraphic}
              src="/assets/selamat-bersinema.svg"
              alt="Selamat Bersinema!"
              width={448}
              height={182}
              priority
            />
            <Link
              className={styles.returnButton}
              href="/"
              onClick={(e) => {
                e.preventDefault();
                resetKioskAndNavigate("/");
              }}
            >
              Return to Festival Programs
            </Link>
          </div>

          {/* Ticket Card (#102:1206) */}
          <section className={styles.ticket} aria-label="Your ticket">
            <header className={styles.ticketHeader}>
              <span>KNF 2026 / ADMIT</span>
              <span>CONFIRMED</span>
            </header>
            <div className={styles.ticketBody}>
              <div className={styles.programField}>
                <span>PROGRAM</span>
                <strong>{programTitle}</strong>
              </div>

              <div className={styles.ticketMiddleRow}>
                <div className={styles.dateField}>
                  <span>DATE</span>
                  <strong>{dayLabel}</strong>
                </div>
                <div className={styles.timeField}>
                  <span>TIME</span>
                  <strong>{timeSlot}</strong>
                </div>
              </div>

              <div className={styles.seatField}>
                <span>SEATS</span>
                <strong>{booking.seatLabel}</strong>
              </div>
            </div>
          </section>
        </section>

        {/* Bottom Bar: Auto Reset Countdown (#102:1238) */}
        <aside className={styles.bottomBar} aria-label="Kiosk auto reset countdown">
          <div className={styles.bottomBarInfo}>
            <span className={styles.bottomBarTitle}>
              Returning to Home in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}
            </span>
            <p className={styles.bottomBarSubtitle}>
              This kiosk will reset automatically
            </p>
          </div>
          <div
            className={styles.progressBarTrack}
            role="progressbar"
            aria-valuenow={secondsLeft}
            aria-valuemin={0}
            aria-valuemax={TOTAL_COUNTDOWN_SECONDS}
          >
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
