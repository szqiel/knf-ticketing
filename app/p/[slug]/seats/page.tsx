import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingExperience } from "@/components/booking/BookingExperience";
import { SeatLegend } from "@/components/booking/SeatMap";
import { ProgramTitle } from "@/components/home/ProgramTitle";
import { createDemoSeats } from "@/lib/booking/mock-seats";
import { MOCK_PROGRAMS } from "@/lib/data/mock-programs";
import styles from "./seats-page.module.css";

export function generateStaticParams() {
  return MOCK_PROGRAMS.map((program) => ({ slug: program.slug }));
}

type SeatMapPageProps = {
  params: Promise<{ slug: string }>;
};

export default function SeatMapPage({ params }: SeatMapPageProps) {
  return (
    <Suspense fallback={<SeatMapFallback />}>
      <SeatMapContent params={params} />
    </Suspense>
  );
}

async function SeatMapContent({ params }: SeatMapPageProps) {
  const { slug } = await params;
  const program = MOCK_PROGRAMS.find((item) => item.slug === slug);

  if (!program) notFound();

  const seats = createDemoSeats({ soldOut: program.isSoldOut });

  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        <header className={styles.topBar}>
          <Link className={styles.backButton} href={`/p/${slug}`}>
            <span aria-hidden="true">←</span> Back
          </Link>

          <div className={styles.stepper} aria-label="Booking progress">
            <span className={styles.stepActive}>1 PROGRAM</span>
            <i aria-hidden="true" />
            <span className={styles.stepActive}>2 SEATS</span>
            <i aria-hidden="true" />
            <span>3 DONE</span>
          </div>

          <Image
            className={styles.mascot}
            src="/assets/knf-logo.png"
            alt="KNF mascot"
            width={88}
            height={88}
          />
        </header>

        <section className={styles.screenHeader}>
          <div className={styles.programTitle}>
            <ProgramTitle title={program.title} isSoldOut={program.isSoldOut} />
          </div>
          <div className={styles.programMeta}>
            <strong>{program.dayLabel}</strong>
            <span>{program.timeSlot}</span>
          </div>
          <h1 className={styles.chooseTitle}>CHOOSE YOUR SEATS</h1>
          <SeatLegend className={styles.headerLegend} labels={{ available: "Available", selected: "Selected", booked: "Sold" }} />
        </section>

        <BookingExperience
          seats={seats}
          seatMapProps={{
            copy: {
              summaryLabel: "YOUR SEATS",
              emptySeatLabel: "None selected",
              confirmLabel: "Confirm Seats",
              legend: { available: "Available", selected: "Selected", booked: "Sold", blocked: "Sold" },
            },
            visuals: { canvasMinWidth: 0, seatMinSize: 20, seatGap: 3, canvasBottomPadding: 150 },
            layout: "cinema",
            showHeader: false,
            showLegend: false,
            showSwipeHint: false,
            showAvailability: false,
          }}
        />
      </div>
    </main>
  );
}

function SeatMapFallback() {
  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        <div className={styles.loadingCard} role="status" aria-label="Loading seat map">
          Loading seat map…
        </div>
      </div>
    </main>
  );
}
