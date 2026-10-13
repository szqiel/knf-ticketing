export interface Film {
  id: string;
  title: string;
  director: string;
  duration: string;
  origin: string;
  synopsis: string;
  posterUrl?: string;
  stillUrl?: string;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  dayLabel: string;
  timeSlot: string;
  seatsLeft: number;
  isSoldOut: boolean;
  posterUrl?: string;
  totalFilmsCount?: number;
  films?: Film[];
}

const DEFAULT_FILMS: Film[] = [
  {
    id: "film-1",
    title: "Goresan Semesta",
    director: "Raditya Pratama",
    duration: "15 Menit",
    origin: "Indonesia",
    synopsis: "Kisah seorang pelukis muda yang menelusuri kenangan masa kecil di tengah gemuruh kota metropolitan, mencari kembali goresan pertama yang mendefinisikan jati dirinya.",
  },
  {
    id: "film-2",
    title: "Kala Sang Mentari",
    director: "Anisa Rahmawati",
    duration: "12 Menit",
    origin: "Indonesia",
    synopsis: "Pertemuan singkat antara dua insan di persimpangan jalan kota tua saat fajar menjelang, menyisakan percakapan tak terucap tentang waktu dan kehilangan.",
  },
  {
    id: "film-3",
    title: "Suara di Balik Kabut",
    director: "Bayu Wicaksono",
    duration: "18 Menit",
    origin: "Indonesia",
    synopsis: "Di lereng pegunungan yang sunyi, seorang anak laki-laki mendengar dengung gamelan purba yang membimbingnya menemukan rahasia leluhur keluarganya.",
  },
  {
    id: "film-4",
    title: "Jejak Langkah Sunyi",
    director: "Dina Kartika",
    duration: "14 Menit",
    origin: "Indonesia",
    synopsis: "Potret puitis tentang seorang pengrajin batik tua di pesisir utara Jawa yang terus membatik meski penglihatannya perlahan memudar.",
  },
  {
    id: "film-5",
    title: "Bisikan Arus Senja",
    director: "Fajar Nugraha",
    duration: "16 Menit",
    origin: "Indonesia",
    synopsis: "Nelayan muda menghadapi dilema antara menjaga tradisi melaut turun-temurun atau merantau mengejar modernitas ke kota pelabuhan seberang.",
  },
  {
    id: "film-6",
    title: "Cakrawala Terakhir",
    director: "Maya Salsabila",
    duration: "11 Menit",
    origin: "Indonesia",
    synopsis: "Dua sahabat kecil menghabiskan sore terakhir di atas bukit sebelum salah satu dari mereka harus pindah ke pulau lain.",
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    slug: "goresan-awal",
    title: "Goresan Awal",
    description: "Program pembuka yang merayakan keberanian eksplorasi visual generasi baru sineas Indonesia. Ragam cerita pendek dengan perspektif sinematik yang segar, jujur, dan menggugah imajinasi.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 10,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-2",
    slug: "layar-raya",
    title: "Layar Raya",
    description: "Sorotan karya sinematik berdurasi pendek dengan skala visual megah dan kedalaman naratif tentang dinamika sosial masyarakat kontemporer.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 0,
    isSoldOut: true,
    totalFilmsCount: 8,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-3",
    slug: "layar-sebelum-kemana-mana",
    title: "Layar Sebelum Kemana-mana",
    description: "Kumpulan kisah perjalanan, pencarian arah, dan momen perpisahan yang intim dan menyentuh hati sebelum melangkah ke babak baru kehidupan.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 0,
    isSoldOut: true,
    totalFilmsCount: 7,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-4",
    slug: "layar-spesial",
    title: "Layar Spesial:",
    subtitle: "Minikino Indonesia Raja Jawa Tengah 2026",
    description: "Kurasi program eksklusif bekerjasama dengan Minikino Indonesia Raja, menampilkan ragam film pendek terbaik karya pembuat film independen se-Jawa Tengah.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 6,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-5",
    slug: "layar-kronik",
    title: "Layar Kronik",
    description: "Rangkaian arsip sinema dan rekaman memori kultural yang menghubungkan masa lalu dengan realitas hari ini.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 8,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-6",
    slug: "bincang-tanpa-batas",
    title: "Bincang Tanpa Batas",
    description: "Sesi apresiasi dan dialog interaktif bersama para sutradara, kurator, dan pegiat perfilman independen.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 5,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-7",
    slug: "bincang-tanpa-batas-2",
    title: "Bincang Tanpa Batas",
    description: "Bagian kedua dari seri diskusi perfilman mendalam mengupas proses kreatif di balik layar film-film festival.",
    dayLabel: "Sabtu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 5,
    films: DEFAULT_FILMS,
  },
  {
    id: "prog-8",
    slug: "layar-penutup",
    title: "Layar Penutup",
    description: "Program pamungkas penutup festival KNF 2026, menyajikan kompilasi karya istimewa yang merayakan kecintaan kita pada layar sinema.",
    dayLabel: "Minggu",
    timeSlot: "01:23 — 01:23",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 6,
    films: DEFAULT_FILMS,
  },
];
