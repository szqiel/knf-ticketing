"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { BookingResponse } from "@/lib/contracts";
import styles from "./SuccessTicket.module.css";

type SuccessTicketProps = {
  booking: BookingResponse;
  onReset?: () => void;
};

export function SuccessTicket({ booking, onReset }: SuccessTicketProps) {
  const [secondsLeft, setSecondsLeft] = useState(30);

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
      <Image
        className={styles.titleGraphic}
        src="/assets/selamat-bersinema.svg"
        alt="Selamat Bersinema!"
        width={470}
        height={165}
        priority
      />
      <section className={styles.ticket} aria-label="Your ticket">
        <p className={styles.ticketEyebrow}>KNF26 TICKETING</p>
        <div className={styles.ticketGrid}>
          <div><span>NAME</span><strong>{booking.fullName}</strong></div>
          <div><span>SEAT</span><strong>{booking.seatLabel}</strong></div>
          <div><span>CONTACT</span><strong>{booking.contact}</strong></div>
          <div><span>BOOKING ID</span><strong>{booking.bookingId.slice(0, 8).toUpperCase()}</strong></div>
        </div>
      </section>
      <p className={styles.instruction}>Screenshot tiket ini sebelum halaman kembali ke Home.</p>
      <div className={styles.progressTrack} aria-label={`${secondsLeft} seconds remaining`}>
        <span style={{ width: `${(secondsLeft / 30) * 100}%` }} />
      </div>
      <p className={styles.countdown}>{secondsLeft}s</p>
    </main>
  );
}
