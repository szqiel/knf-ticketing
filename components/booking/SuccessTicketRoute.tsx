"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  bookingResponseSchema,
  bookingTicketStorageKey,
  type BookingResponse,
} from "@/lib/contracts";
import { SuccessTicket } from "./SuccessTicket";
import styles from "./SuccessTicketRoute.module.css";

type SuccessTicketRouteProps = {
  bookingId: string;
  slug: string;
  programTitle: string;
  dayLabel: string;
  timeSlot: string;
};

export function SuccessTicketRoute({ bookingId, dayLabel, programTitle, slug, timeSlot }: SuccessTicketRouteProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(bookingTicketStorageKey(bookingId));
      const parsed = stored ? bookingResponseSchema.safeParse(JSON.parse(stored)) : null;

      if (parsed?.success && parsed.data.bookingId === bookingId) {
        setBooking(parsed.data);
      }
    } catch {
      // A missing or malformed client-side ticket is handled by the fallback below.
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  const resetToHome = () => {
    window.sessionStorage.removeItem(bookingTicketStorageKey(bookingId));
    router.replace("/");
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.statusCard} role="status">Loading your ticket…</section>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className={styles.page}>
        <section className={styles.statusCard} role="alert">
          <p className={styles.eyebrow}>TICKET NOT FOUND</p>
          <h1>Your ticket is no longer available on this device.</h1>
          <p>Silakan kembali ke program dan lakukan reservasi dari perangkat ini.</p>
          <Link className={styles.backLink} href={`/p/${slug}`}>Back to Program</Link>
        </section>
      </main>
    );
  }

  return (
    <SuccessTicket
      backHref={`/p/${slug}`}
      booking={booking}
      dayLabel={dayLabel}
      onReset={resetToHome}
      programTitle={programTitle}
      timeSlot={timeSlot}
    />
  );
}
