"use client";

import Image from "next/image";
import Link from "next/link";
import type { BookingResponse } from "@/lib/contracts";
import styles from "./SuccessTicket.module.css";

type SuccessTicketProps = {
  booking: BookingResponse;
  backHref: string;
  dayLabel: string;
  programTitle: string;
  timeSlot: string;
};

export function SuccessTicket({
  backHref,
  booking,
  dayLabel,
  programTitle,
  timeSlot,
}: SuccessTicketProps) {
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

      </div>
    </main>
  );
}
