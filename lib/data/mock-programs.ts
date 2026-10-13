export interface Program {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  dayLabel: string;
  timeSlot: string;
  seatsLeft: number;
  isSoldOut: boolean;
  posterUrl?: string;
}

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    slug: "goresan-awal",
    title: "Goresan Awal",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
  },
  {
    id: "prog-2",
    slug: "layar-raya",
    title: "Layar Raya",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 0,
    isSoldOut: true,
  },
  {
    id: "prog-3",
    slug: "layar-sebelum-kemana-mana",
    title: "Layar Sebelum Kemana-mana",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 0,
    isSoldOut: true,
  },
  {
    id: "prog-4",
    slug: "layar-spesial",
    title: "Layar Spesial:",
    subtitle: "Minikino Indonesia Raja Jawa Tengah 2026",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
  },
  {
    id: "prog-5",
    slug: "layar-kronik",
    title: "Layar Kronik",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
  },
  {
    id: "prog-6",
    slug: "bincang-tanpa-batas",
    title: "Bincang Tanpa Batas",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
  },
  {
    id: "prog-7",
    slug: "bincang-tanpa-batas-2",
    title: "Bincang Tanpa Batas",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
  },
  {
    id: "prog-8",
    slug: "layar-penutup",
    title: "Layar Penutup",
    dayLabel: "Minggu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
  },
];
