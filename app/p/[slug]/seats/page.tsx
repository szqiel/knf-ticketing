import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingExperience } from "@/components/booking/BookingExperience";
import { KioskHeader } from "@/components/common/KioskHeader";
import { SeatLegend } from "@/components/booking/SeatMap";
import { ProgramTitle } from "@/components/home/ProgramTitle";
import { createDemoSeats } from "@/lib/booking/mock-seats";
import { MOCK_PROGRAMS } from "@/lib/data/mock-programs";
import { getProgramWithLiveAvailability } from "@/lib/booking/service";
import styles from "./seats-page.module.css";

export function generateStaticParams() {
  return MOCK_PROGRAMS.map((program) => ({ slug: program.slug }));
}

type SeatMapPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ session?: string | string[] }>;
};

export default function SeatMapPage({ params, searchParams }: SeatMapPageProps) {
  return (
    <Suspense fallback={<SeatMapFallback />}>
      <SeatMapContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SeatMapContent({ params, searchParams }: SeatMapPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const program = (await getProgramWithLiveAvailability(slug)) ?? MOCK_PROGRAMS.find((item) => item.slug === slug);

  if (!program) notFound();

  const seats = createDemoSeats({ soldOut: program.isSoldOut });
  const sessionValue = resolvedSearchParams?.session;
  const sessionToken = Array.isArray(sessionValue) ? sessionValue[0] : sessionValue;

  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        {/* Unified Kiosk Header (Canonical Program Detail Back Button + Stepper + Mascot) */}
        <KioskHeader currentStep={2} backHref={`/p/${slug}`} />

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
          programSlug={slug}
          dayLabel={program.dayLabel}
          timeSlot={program.timeSlot}
          sessionToken={sessionToken}
          seatMapProps={{
            copy: {
              summaryLabel: "YOUR SEATS",
              emptySeatLabel: "None selected",
              confirmLabel: "Confirm Seats",
              swipeHint: "← Geser denah untuk memilih kursi →",
              legend: { available: "Available", selected: "Selected", booked: "Sold", blocked: "Sold" },
            },
            visuals: { canvasMinWidth: 0, seatMinSize: 20, seatGap: 3, canvasBottomPadding: 150 },
            layout: "cinema",
            showHeader: false,
            showLegend: false,
            showSwipeHint: true,
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
