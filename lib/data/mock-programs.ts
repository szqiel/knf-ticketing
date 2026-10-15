export interface Film {
  id: string;
  title: string;
  director: string;
  duration: string;
  durationMin?: number;
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
  showDate?: string;
  startsAt?: string;
  endsAt?: string;
  timeSlot: string;
  seatsLeft: number;
  isSoldOut: boolean;
  posterUrl?: string;
  totalFilmsCount?: number;
  films?: Film[];
}

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    slug: "kardus-di-atas-lemari",
    title: "Layar Sebelum Kemana-mana",
    subtitle: "Kardus di Atas Lemari",
    description:
      "Kumpulan kisah tentang memori, benda masa lalu, dan sudut-sudut ruang yang menyimpan nostalgia serta pencarian diri.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "10:15:00",
    endsAt: "12:10:00",
    timeSlot: "10:15 — 12:10",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-1-1",
        title: "Dari Aku, Penyair Kecilmu",
        director: "Abiyyu Farell",
        duration: "5 Menit",
        durationMin: 5,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Sepotong perjalanan seorang anak yang mengekspresikan perasaannya melalui bait-bait puisi sederhana bagi orang terkasihnya.",
      },
      {
        id: "film-1-2",
        title: "The Qwerty Book",
        director: "Wahyuda Rahman",
        duration: "20 Menit",
        durationMin: 20,
        origin: "D.I. Yogyakarta, Indonesia",
        synopsis:
          "Refleksi tentang kata-kata, mesin tik, dan lembaran buku yang merekam dialog sunyi antara pemikiran dan realitas.",
      },
      {
        id: "film-1-3",
        title: "Selaras",
        director: "Alya Azalia Dida Saphira",
        duration: "30 Menit",
        durationMin: 30,
        origin: "Sleman, Indonesia",
        synopsis:
          "Harmoni kehidupan dan dinamika hubungan yang diuji dalam mencari keselarasan di tengah perbedaan.",
      },
      {
        id: "film-1-4",
        title: "NARA",
        director: "Mahesa Danu Wicaksono",
        duration: "20 Menit",
        durationMin: 20,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Kisah perjalanan personal Nara dalam menghadapi masa transisi dan menemukan kembali arah langkah hidupnya.",
      },
    ],
  },
  {
    id: "prog-2",
    slug: "bincang-tanpa-batas",
    title: "Talkshow",
    subtitle: "Bincang Tanpa Batas",
    description:
      "Sesi dialog interaktif dan apresiasi perfilman bersama kurator, sutradara, dan praktisi sinema independen mengupas ekosistem film alternatif.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "13:10:00",
    endsAt: "14:40:00",
    timeSlot: "13:10 — 14:40",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 1,
    films: [
      {
        id: "film-2-1",
        title: "Perfected Grammar",
        director: "Andrea Suwito",
        duration: "11 Menit",
        durationMin: 11,
        origin: "Indonesia / Hongaria",
        synopsis:
          "Di Budapest, seorang ibu lanjut usia mengajarkan putrinya yang berbahasa Hungaria tentang perbedaan kalimat aktif dan pasif dalam bahasa Indonesia. Dari pelajaran bahasa keluarga yang intim, terungkap kisah mendalam tentang pengasingan, trauma sejarah, dan perjalanan hidup di negeri orang.",
      },
    ],
  },
  {
    id: "prog-3",
    slug: "sepetak-sunyi",
    title: "Layar Kronik",
    subtitle: "Sepetak Sunyi",
    description:
      "Kurasi film istimewa karya pegiat UKM Kronik Filmedia Universitas Diponegoro yang menelusuri keheningan, pergulatan batin, dan ruang keluarga.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "15:20:00",
    endsAt: "17:20:00",
    timeSlot: "15:20 — 17:20",
    seatsLeft: 0,
    isSoldOut: true,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-3-1",
        title: "Lah Piye Maneh",
        director: "Novrita Farihah",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Dinamika hubungan emosional antara Ratih dan Ibu Minah mengenai ekspektasi keluarga, bakti anak, dan tuntutan sosial yang tak terelakkan.",
      },
      {
        id: "film-3-2",
        title: "Syukur",
        director: "Happy Wahyu / Kronik Filmedia",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Kisah pergulatan batin Prabu dan Harto dalam memaknai penerimaan, takdir, dan rasa syukur di tengah keterbatasan hidup.",
      },
      {
        id: "film-3-3",
        title: "Cublak Cublak Suweng",
        director: "Kronik Filmedia",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Menyelami filosofi dolanan tradisional Jawa tentang pencarian nurani sejati dan teguran terhadap keserakahan manusia.",
      },
      {
        id: "film-3-4",
        title: "Glimmer",
        director: "Kronik Filmedia",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Pertemuan memori masa kecil Raka bersama sang Ayah yang kembali hadir bagai kerlip cahaya di tengah kegelapan.",
      },
    ],
  },
  {
    id: "prog-4",
    slug: "lapar-lebih-nyata-dari-dosa",
    title: "Layar Raya",
    subtitle: "Lapar Lebih Nyata dari Dosa",
    description:
      "Potret realitas sosial yang menggigit, tekanan ekonomi, relasi kuasa, dan bagaimana desakan kebutuhan hidup menantang batas-batas moralitas.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "18:00:00",
    endsAt: "19:45:00",
    timeSlot: "18:00 — 19:45",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-4-1",
        title: "OTW",
        director: "Fransiska Thalia Sadikin",
        duration: "10 Menit",
        durationMin: 10,
        origin: "Tangerang, Indonesia",
        synopsis:
          "Kisah perlombaan dengan waktu di jalanan metropolitan yang mempertemukan kepanikan, janji, dan dinamika kehidupan kota.",
      },
      {
        id: "film-4-2",
        title: "Hegemoni Kejantanan",
        director: "Rafif Bahanan",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Jakarta, Indonesia",
        synopsis:
          "Dekonstruksi tajam terhadap ekspektasi maskulinitas toksik dan beban sosial yang dipikul laki-laki dalam struktur masyarakat modern.",
      },
      {
        id: "film-4-3",
        title: "Tut Wuri Handayani",
        director: "Abill Ar Rafiq",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Surakarta, Indonesia",
        synopsis:
          "Kritik sosial tajam terhadap sistem pendidikan dan kenyataan pahit yang dihadapi para pengajar serta murid di akar rumput.",
      },
      {
        id: "film-4-4",
        title: "Sometimes Nina so Confusing",
        director: "Reyhan Maulana Yanuardi",
        duration: "25 Menit",
        durationMin: 25,
        origin: "Bandung, Indonesia",
        synopsis:
          "Pergulatan psikologis dan labirin pikiran Nina yang membingungkan orang-orang di sekitarnya dalam mencari validasi dan kedamaian.",
      },
    ],
  },
  {
    id: "prog-5",
    slug: "buku-saku-sang-pengutip",
    title: "Layar Raya",
    subtitle: "Buku Saku Sang Pengutip",
    description:
      "Catatan-catatan intim tentang perjalanan generasi, petuah hidup, memori masa kecil, serta relasi hangat sekaligus getir dengan figur ayah.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "09:10:00",
    endsAt: "11:00:00",
    timeSlot: "09:10 — 11:00",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-5-1",
        title: "Tumbuhlah!",
        director: "Daviraja Tajibarani",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Parepare, Indonesia",
        synopsis:
          "Refleksi puitis tentang masa pertumbuhan, luka-luka kedewasaan, dan keberanian mekar di tanah yang tandus.",
      },
      {
        id: "film-5-2",
        title: "Time Brings Roses, and Its Thorns",
        director: "Clauren Christiawan",
        duration: "23 Menit",
        durationMin: 23,
        origin: "Tangerang, Indonesia",
        synopsis:
          "Di dunia di mana gadis menumbuhkan bunga mawar di tubuh saat pubertas, Raisa terlambat mekar. Ketika adiknya mekar lebih dulu, Raisa memalsukan bunganya demi pengakuan sang ibu.",
      },
      {
        id: "film-5-3",
        title: "Jenaka",
        director: "Alfian Yudha Pratama",
        duration: "14 Menit",
        durationMin: 14,
        origin: "Jatinangor, Indonesia",
        synopsis:
          "Ironi dan tawa getir di balik panggung kehidupan seorang penghibur yang berusaha menutupi kesedihan pribadinya.",
      },
      {
        id: "film-5-4",
        title: "Hari ini, untuk Bapak",
        director: "Lourdes Arzetta Mumpuni P. M.",
        duration: "18 Menit",
        durationMin: 18,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Sebuah penghormatan personal dan percakapan tulus seorang anak kepada sosok bapak sebelum waktu memisahkan mereka.",
      },
    ],
  },
  {
    id: "prog-6",
    slug: "indonesia-raja-jawa-tengah-2026",
    title: "Layar Spesial",
    subtitle: "Minikino Indonesia Raja Jawa Tengah 2026",
    description:
      "Kolaborasi istimewa bersama Minikino Indonesia Raja 2026 menghadirkan 5 film pendek pilihan terbaik karya sineas lokal se-Jawa Tengah.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "11:40:00",
    endsAt: "13:25:00",
    timeSlot: "11:40 — 13:25",
    seatsLeft: 0,
    isSoldOut: true,
    totalFilmsCount: 5,
    films: [
      {
        id: "film-6-1",
        title: "Selamat Makan!",
        director: "Andra Erwinendya",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Diejek di sekolah, Nadia berusaha membuat bekal makan siang yang estetik sambil menghadapi kerumitan ekonomi keluarganya.",
      },
      {
        id: "film-6-2",
        title: "Aku Tahu Bapak",
        director: "Ardhian Virgi",
        duration: "16 Menit",
        durationMin: 16,
        origin: "Prambanan, Klaten, Indonesia",
        synopsis:
          "Berbincang di pabrik tahu tradisional, seorang anak menyadari bahwa hidup berjalan lambat dan rapuh, persis seperti pembuatan tahu.",
      },
      {
        id: "film-6-3",
        title: "Nyanyian di Angkringan",
        director: "Shafiyyah Aida",
        duration: "6 Menit",
        durationMin: 6,
        origin: "Kudus, Indonesia",
        synopsis:
          "Di tengah riuh angkringan malam, seorang anak yang menikmati dunia melalui suara dan ketukan ritmis disalahpahami oleh orang-orang sekitarnya.",
      },
      {
        id: "film-6-4",
        title: "Kodok Ning Jero Batok",
        director: "Ali Yafie Muzaki",
        duration: "13 Menit",
        durationMin: 13,
        origin: "Surakarta, Indonesia",
        synopsis:
          "Paijo yang berusia 9 tahun mulai mempertanyakan makna mimpi dan cita-cita ketika melihat kenyataan hidup pahit yang dihadapi keluarganya.",
      },
      {
        id: "film-6-5",
        title: "38-The Last Swing",
        director: "Fajar Boby Saputra",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Arum gigih mengumpulkan 38 bola golf bekas di padang golf demi membiayai masa pengenalan lingkungan sekolahnya.",
      },
    ],
  },
  {
    id: "prog-7",
    slug: "gradasi-pucat-pasi",
    title: "Layar Sebelum Kemana-mana",
    subtitle: "Gradasi Pucat Pasi",
    description:
      "Perjalanan sinematik melintasi rasa keterasingan, ketakutan, kegelisahan batin, dan misteri yang membayangi batas realitas.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "14:05:00",
    endsAt: "16:05:00",
    timeSlot: "14:05 — 16:05",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-7-1",
        title: "Malady",
        director: "Naufal Mahawira",
        duration: "17 Menit",
        durationMin: 17,
        origin: "Bandung, Indonesia",
        synopsis:
          "Eksplorasi misterius mengenai penyakit, keterasingan fisik, dan paranoia yang merayap di dalam kesunyian.",
      },
      {
        id: "film-7-2",
        title: "Limbung",
        director: "Putri Salsabila",
        duration: "28 Menit",
        durationMin: 28,
        origin: "Bantul, Yogyakarta, Indonesia",
        synopsis:
          "Di masa tuanya, Lazuardi, mantan detektif yang merawat seorang anak vampir sebagai penebusan dosa, dihadapkan pada kasus lama yang kembali terbuka.",
      },
      {
        id: "film-7-3",
        title: "We're All Indigo in This Country",
        director: "Aliyya Faiturrohmah",
        duration: "15 Menit",
        durationMin: 15,
        origin: "D.I. Yogyakarta, Indonesia",
        synopsis:
          "Dena, seorang anak indigo yang mampu melihat masa lalu, membantu polisi menyelidiki kasus tabrak lari hingga mendapati fakta mengejutkan tentang sang mitra.",
      },
      {
        id: "film-7-4",
        title: "Kagol",
        director: "Rais Akbar",
        duration: "20 Menit",
        durationMin: 20,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Anton yang terlilit utang nekat melakukan pesugihan di Kali Urip melalui arahan dukun meragukan, berujung pada teror absurd di rumahnya.",
      },
    ],
  },
  {
    id: "prog-8",
    slug: "melampaui-batas-batas-yang-ada",
    title: "Layar Raya",
    subtitle: "Melampaui Batas-batas yang Ada",
    description:
      "Kompilasi pemungkas yang mendobrak pakem konvensional; mengeksplorasi absurditas, metafora visual, satir sosial, dan batas kebebasan berekspresi.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "16:45:00",
    endsAt: "18:20:00",
    timeSlot: "16:45 — 18:20",
    seatsLeft: 20,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-8-1",
        title: "Lamun Omongan",
        director: "Moh Bayu Saputra",
        duration: "8 Menit",
        durationMin: 8,
        origin: "Surakarta, Indonesia",
        synopsis:
          "Di sebuah warung makan seafood Lamongan, lele dan ayam beradu omongan tentang keunggulan masing-masing dalam satir sosial yang kocak nan filosofis.",
      },
      {
        id: "film-8-2",
        title: "Cacing Biru",
        director: "Farhan Kurniawan",
        duration: "18 Menit",
        durationMin: 18,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Obsesi tak berkesudahan Agung mencari cacing alien biru setelah melihatnya di mimpi mendorong Bima mengangkatnya sebagai tugas kelompok dokumenter.",
      },
      {
        id: "film-8-3",
        title: "A Flower is Not a Flower",
        director: "Farhan Kurniawan",
        duration: "17 Menit",
        durationMin: 17,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Bunga mengalami keterasingan diri pasca-kematian sang adik, mencurahkan kerinduan dengan menulis puisi di sticky notes hingga ingin melepas jati dirinya sebagai manusia.",
      },
      {
        id: "film-8-4",
        title: "Asmarandana",
        director: "Ivan Valentinus",
        duration: "12 Menit",
        durationMin: 12,
        origin: "Semarang, Indonesia",
        synopsis:
          "Seorang Tenaga Kerja Wanita mencoba meluruskan kesalahpahaman dengan anaknya mengenai anggapan bahwa sang Ibu tak peduli setelah merantau selama 16 tahun.",
      },
    ],
  },
];
