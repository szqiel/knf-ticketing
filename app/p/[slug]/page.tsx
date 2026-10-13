import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MOCK_PROGRAMS } from "@/lib/data/mock-programs";
import { ProgramDetailView } from "@/components/program/ProgramDetailView";

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PROGRAMS.map((program) => ({
    slug: program.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = MOCK_PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan — KNF 2026",
    };
  }

  return {
    title: `${program.title} — KNF 2026 Festival Program`,
    description:
      program.description ??
      `Jadwal pemutaran dan line-up film untuk ${program.title} di KNF 2026.`,
  };
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = MOCK_PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    notFound();
  }

  return <ProgramDetailView program={program} />;
}
