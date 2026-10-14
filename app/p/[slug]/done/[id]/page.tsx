import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SuccessTicketRoute } from "@/components/booking/SuccessTicketRoute";
import { MOCK_PROGRAMS } from "@/lib/data/mock-programs";

type SuccessPageProps = {
  params: Promise<{ slug: string; id: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function SuccessPage({ params }: SuccessPageProps) {
  return (
    <Suspense fallback={<SuccessPageFallback />}>
      <SuccessPageContent params={params} />
    </Suspense>
  );
}

async function SuccessPageContent({ params }: SuccessPageProps) {
  const { slug, id } = await params;
  const program = MOCK_PROGRAMS.find((item) => item.slug === slug);

  if (!program || !uuidPattern.test(id)) notFound();

  return (
    <SuccessTicketRoute
      bookingId={id}
      dayLabel={program.dayLabel}
      programTitle={program.title}
      slug={slug}
      timeSlot={program.timeSlot}
    />
  );
}

function SuccessPageFallback() {
  return (
    <main
      style={{
        alignItems: "center",
        background: "linear-gradient(145deg, #a6e5ff, #5379d8 55%, #b770d5)",
        display: "flex",
        justifyContent: "center",
        minHeight: "100svh",
        padding: "1rem",
      }}
    >
      <p style={{ color: "#fff", fontWeight: 800 }}>Loading your ticket…</p>
    </main>
  );
}
