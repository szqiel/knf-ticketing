"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BookingResponse } from "@/lib/contracts";
import styles from "./SuccessTicket.module.css";

type SuccessTicketProps = {
  booking: BookingResponse;
  backHref: string;
  dayLabel: string;
  programTitle: string;
  timeSlot: string;
  onReset?: () => void;
};

export function SuccessTicket({
  backHref,
  booking,
  dayLabel,
  onReset,
  programTitle,
  timeSlot,
}: SuccessTicketProps) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          onReset?.();
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onReset]);

  return (
    <main className={styles.page} aria-live="polite">
      <div className={styles.canvas}>
        <header className={styles.topBar}>
          <Link className={styles.backButton} href={backHref}>
            <span aria-hidden="true">←</span> Back
          </Link>

          <div className={styles.stepper} aria-label="Booking progress">
            <span>1 PROGRAM</span>
            <i aria-hidden="true" />
            <span>2 SEATS</span>
            <i aria-hidden="true" />
            <span className={styles.stepActive}>3 DONE</span>
          </div>

          <Image
            className={styles.mascot}
            src="/assets/knf-logo.png"
            alt="KNF mascot"
            width={88}
            height={88}
            priority
          />
        </header>

        <section className={styles.confirmation} aria-label="Booking confirmed">
          <div className={styles.titleColumn}>
            <Image
              className={styles.titleGraphic}
              src="/assets/selamat-bersinema.svg"
              alt="Selamat Bersinema!"
              width={470}
              height={165}
              priority
            />
            <Link className={styles.returnButton} href="/">
              Return to Festival Programs
            </Link>
          </div>

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
              <div className={styles.ticketRule} />
              <div className={styles.detailsGrid}>
                <div>
                  <span>DATE</span>
                  <strong>{dayLabel}</strong>
                </div>
                <div>
                  <span>TIME</span>
                  <strong>{timeSlot}</strong>
                </div>
              </div>
              <div className={styles.ticketRule} />
              <div className={styles.seatField}>
                <span>SEATS</span>
                <strong>{booking.seatLabel}</strong>
              </div>
            </div>
          </section>
        </section>

        <section className={styles.resetBar} aria-label={`${secondsLeft} seconds remaining`}>
          <div className={styles.resetCopy}>
            <strong>Returning to Home in {secondsLeft} seconds</strong>
            <span>This kiosk will reset automatically</span>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${(secondsLeft / 10) * 100}%` }} />
          </div>
        </section>
      </div>
    </main>
  );
}
