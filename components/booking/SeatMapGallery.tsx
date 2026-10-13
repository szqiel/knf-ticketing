"use client";

import Image from "next/image";
import { useState } from "react";
import { createDemoSeats } from "@/lib/booking/mock-seats";
import { ProgramTitle } from "@/components/home/ProgramTitle";
import { SeatLegend, SeatMap } from "./SeatMap";
import styles from "./SeatMapGallery.module.css";

const gallerySeats = createDemoSeats();

export function SeatMapGallery() {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  return (
    <main className={styles.screen}>
      <header className={styles.topBar}>
        <button className={styles.backButton} type="button">
          <span aria-hidden="true">←</span> Back
        </button>
        <div className={styles.stepper} aria-label="Booking progress">
          <span className={styles.stepActive}>1 PROGRAM</span>
          <i aria-hidden="true" />
          <span className={styles.stepActive}>2 SEATS</span>
          <i aria-hidden="true" />
          <span>3 DONE</span>
        </div>
        <Image className={styles.mascot} src="/assets/knf-logo.png" alt="KNF mascot" width={88} height={88} />
      </header>

      <section className={styles.screenHeader}>
        <ProgramTitle title="Judul Program" isSoldOut={false} />
        <div className={styles.programMeta}>
          <strong>Sabtu</strong>
          <span>01:23 — 01:23</span>
        </div>
        <h1>CHOOSE YOUR SEATS</h1>
        <SeatLegend className={styles.headerLegend} labels={{ available: "Available", selected: "Selected", booked: "Sold" }} />
      </section>

      <SeatMap
        seats={gallerySeats}
        selectedSeatId={selectedSeatId}
        onSelectSeat={(seat) => setSelectedSeatId(seat.id)}
        onConfirm={() => undefined}
        copy={{
          summaryLabel: "YOUR SEATS",
          emptySeatLabel: "None selected",
          confirmLabel: "Confirm Seats",
        }}
        visuals={{ canvasMinWidth: 0, seatMinSize: 20, seatGap: 3, canvasBottomPadding: 150 }}
        layout="cinema"
        confirmButtonState="active"
        showHeader={false}
        showLegend={false}
        showSwipeHint={false}
        showAvailability={false}
      />
    </main>
  );
}
