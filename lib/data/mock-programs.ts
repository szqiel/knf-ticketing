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
  bookingOpen?: boolean;
  posterUrl?: string;
  totalFilmsCount?: number;
  films?: Film[];
}

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-1",
    slug: "kardus-di-atas-lemari",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/kardus-di-atas-lemari.webp",
    title: "Layar SKM",
    subtitle: "Kardus di Atas Lemari",
    description:
      "Hampir setiap rumah pasti memiliki satu kardus di atas lemari. Isinya tidak pernah dibuang, tidak sering juga dilihat. Benda-benda di dalamnya diam menunggu, entah sampai kapan, hingga seseorang berdiri di atas kursi dan memberanikan diri menurunkannya. Meskipun sudah bertahun-tahun, isinya selalu mampu membuat seseorang pulang, marah, atau memaafkan. Kardus ini menjadi simbol bagi kenangan yang terus bertahan secara tanpa batas melintasi waktu. Kita diajak untuk menyapu debu dan menurunkan kardus itu kembali. Menurunkan kardus itu mungkin terasa berat, tetapi melaluinya kita disadarkan bahwa apa yang paling sering kita simpan di tempat paling tinggi, justru adalah hal yang paling membentuk siapa diri kita hari ini. Lantas, apakah kita cukup berani untuk membukanya kembali?",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "10:15:00",
    endsAt: "12:10:00",
    timeSlot: "10:15 — 12:10",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-1-1",
        title: "Dari Aku, Penyair Kecilmu",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/dari-aku-penyair-kecilmu.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/dari-aku-penyair-kecilmu.webp",
        director: "Muhammad Bintang Tasya",
        duration: "3 Menit",
        durationMin: 3,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Seorang penyair yang menghidupkan kembali istrinya melalui puisi. Sebuah kisah pendek dengan eksplorasi animasi mixed media tentang bagaimana seorang penyair merangkai kata demi mengungkapkan rasa dan merelakan kepergian mendiang istrinya.",
      },
      {
        id: "film-1-2",
        title: "The Qwerty Book",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/the-qwerty-book.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/the-qwerty-book.webp",
        director: "Davi Muh Azita Rifa'i",
        duration: "16 Menit",
        durationMin: 16,
        origin: "D.I. Yogyakarta, Indonesia",
        synopsis:
          "Di Panti Firdaus, Mojo dan Putri tumbuh bersama dalam dunia kecil yang tertib dengan satu larangan yang tak pernah dijelaskan: jangan sentuh Buku Qwerty. Saat larangan itu dilanggar, segalanya berubah. Bertahun-tahun kemudian, Mojo kembali sebagai seorang jurnalis. Di sanalah, masa lalu yang terkubur perlahan terbuka, bersamaan dengan kenyataan tentang siapa dirinya dan apa yang selama ini ditutupi.",
      },
      {
        id: "film-1-3",
        title: "Selaras",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/selaras.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/selaras.webp",
        director: "Beatrix Mega Cininta",
        duration: "25 Menit",
        durationMin: 25,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Di tengah maraknya demonstrasi dan ketegangan politik, Laras menemukan rekaman wawancara lama yang memicu pertanyaannya tentang keberadaan sang ayah kandung, Wiyatno. Namun, keinginannya mengungkap kebenaran masa lalu berbenturan dengan sikap sang Ibu dan Bapak sambungnya yang memilih melupakan dan menjaga ketenangan keluarga.",
      },
      {
        id: "film-1-4",
        title: "NARA",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/nara.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/nara.webp",
        director: "Dwimanto Arif Bagaskoro",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Di sebuah rumah yang asing, seorang jiwa kecil bernama Nara tiba-tiba muncul dalam keadaan bingung dan bertemu dengan Nara Dewasa, seorang penulis novel autobiografi. Melihat masa depannya yang penuh luka akibat sikap sang Ayah dan keraguannya sendiri, Jiwa Nara sempat bimbang untuk dilahirkan, hingga akhirnya menemukan alasan yang membuat Nara Dewasa tetap bertahan hidup.",
      },
    ],
  },
  {
    id: "prog-2",
    slug: "bincang-tanpa-batas",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/bincang-tanpa-batas.webp",
    title: "Bincang Tanpa Batas",
    subtitle: "Menghancurkan Eksklusifitas Dalam Ekosistem Film",
    description:
      "Ekosistem perfilman seringkali terjebak dalam batas-batas eksklusifitas dalam berbagai bentuk seperti keterbatasan akses secara fisik dan ekonomi, stigma dan struktur industri yang tertutup, dan juga minimnya keberpihakan.\n\nMahalnya biaya produksi, standar kualitas/peralatan yang dianggap harus sempurna sebelum berkarya menjadi hambatan yang sering dialami oleh penggiat film. Terbatasnya ruang pemutaran yang ramah bagi kelompok/kalangan tertentu juga menjadi hambatan bagi penikmat film.\n\nIndustri film sering dipandang eksklusif hanya bagi lingkaran tertentu, isu ini juga merangkap eksklusifnya ekosistem perfilman yang kota besar sentris. Banyak penggiat perfilman daerah yang aksesnya terbatas bahkan untuk membuat film itu sendiri.\n\nMaka dari itu, harapan dari “Bincang Tanpa Batas” ini adalah membedah bagaimana kita meruntuhkan tembok-tembok eksklusifitas yang ada di ekosistem perfilman menjadi ekosistem yang terbuka, setara, dan dapat diakses oleh siapa saja.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "13:10:00",
    endsAt: "14:40:00",
    timeSlot: "13:10 — 14:40",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 1,
    films: [
      {
        id: "film-2-1",
        title: "Perfected Grammar",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/perfected-grammar.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/perfected-grammar.webp",
        director: "Andrea Suwito",
        duration: "11 Menit",
        durationMin: 11,
        origin: "Indonesia / Hongaria",
        synopsis:
          "Di Budapest, seorang ibu lanjut usia mengajarkan putrinya yang berbahasa Hungaria tentang perbedaan kalimat aktif dan pasif dalam bahasa ibunya, bahasa Indonesia. Namun, pelajaran tersebut membuka kembali luka lama mengenai hubungan menyakitkan sang ibu dengan tanah airnya. Di tengah semaraknya kota Budapest, sang putri perlahan mengungkap kebenaran getir tentang sejarah kelam Indonesia dan kerinduan akan tempat yang dulu disebut 'rumah'.",
      },
    ],
  },
  {
    id: "prog-3",
    slug: "sepetak-sunyi",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/sepetak-sunyi.webp",
    title: "Layar Kronik",
    subtitle: "Sepetak Sunyi",
    description:
      "Kita selalu mengira sunyi adalah ketiadaan. Ruang kosong tanpa suara, tanpa gerak, tanpa siapa-siapa. Namun, kita mungkin cuman makhluk yang pandai bersandar pada asumsi. Sunyi yang kita temui sehari-hari justru petak yang paling bising. Tempat di mana bisikan-bisikan yang gagal disampaikan ke luar mendadak menggema dengan teramat keras. Cara untuk bertahan dari himpitan ekonomi, cara bertahan dari demoralisasi, cara untuk menanggung absurdnya pengkhianatan, atau bahkan cara untuk mengingat bahwa ada seseorang di rumah yang sedang menunggu dipeluk.\n\nSepetak Sunyi mengajak untuk duduk berdiam, bukan untuk melarikan diri dari riuh dunia, melainkan untuk menyadari bahwa di dalam ruang terisolasi sekalipun, kita tak pernah benar-benar bisa sembunyi dari diri kita sendiri.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "15:20:00",
    endsAt: "17:20:00",
    timeSlot: "15:20 — 17:20",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-3-1",
        title: "Lah Piye Maneh",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/lah-piye-maneh.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/lah-piye-maneh.webp",
        director: "Novrita Farihah Syakur",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Menyorot hubungan komplikatif antara Ratih dan Ibunya yang tercipta ketika keadaan menyudutkan mereka dalam masalah struktural di sepetak rumah yang terdesak oleh ekonomi serta stigma sosial. Hubungan yang memaksa mereka untuk selalu dekat dan terikat ini membawa keluar konflik-konflik batin yang selalu Ratih pendam—tentang standar ideal perempuan, rasa iri terhadap kakak laki-lakinya yang seolah bebas dari tanggung jawab, dan mimpinya berkuliah yang selalu terhalang.",
      },
      {
        id: "film-3-2",
        title: "Syukur",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/syukur.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/syukur.webp",
        director: "Riffat Zhafif",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Lima pejabat korup menghabiskan hari dengan berpesta, berjudi, dan mabuk di sebuah ruangan tertutup sembari merayakan penggusuran rakyat Kalimantan yang mereka dalangi. Ketegangan pecah ketika Harto menantang Prabu atas kecurangan dan kejahatan masa lalunya hingga berujung pertumpahan darah. Sendirian di antara jasad rekan-rekannya, Prabu dihadapkan pada ironi masa lalunya sendiri sebagai mantan aktivis.",
      },
      {
        id: "film-3-3",
        title: "Cublak Cublak Suweng",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/cublak-cublak-suweng.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/cublak-cublak-suweng.webp",
        director: "Khayrutha Zidanne Haydar Maulana",
        duration: "12 Menit",
        durationMin: 12,
        origin: "Semarang, Indonesia",
        synopsis:
          "Kematian Aura dilaporkan karena bunuh diri. Yasa, Pita, Jun, dan Angga sebagai sahabatnya mencoba mengungkap kasus kematiannya, namun salah satu dari mereka curiga bahwa pembunuhnya ada di antara mereka sendiri. Bersama-sama mereka memainkan permainan tradisional Cublak-Cublak Suweng sebagai media kejujuran hingga perlahan terungkap siapa pelaku sebenarnya.",
      },
      {
        id: "film-3-4",
        title: "Glimmer",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/glimmer.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/glimmer.webp",
        director: "Novrita Farihah Syakur",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Pendar rapuh dari sisa kesadaran terakhir seorang ayah yang putus asa meretas ilusinya demi sebuah penebusan sebelum akhirnya benar-benar padam ditelan realita kematian yang sunyi. Melalui tujuh menit sebelum kematian, sang ayah mendapatkan kesempatan untuk kembali hadir dan menemani anaknya, Raka, tanpa menyadari bahwa momen hangat itu adalah kesempatan terakhirnya.",
      },
    ],
  },
  {
    id: "prog-4",
    slug: "lapar-lebih-nyata-dari-dosa",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/lapar-lebih-nyata-dari-dosa.webp",
    title: "Layar Raya",
    subtitle: "Lapar Lebih Nyata dari Dosa",
    description:
      "Tidak semua orang punya kemewahan untuk memilih. Beberapa orang hanya sedang berusaha melewati hari, sementara dari kejauhan kita sibuk bermain Tuhan. Sejenak mendekati kehidupan yang mungkin tidak kita kenal, mengenai persoalan sosial yang tidak selalu datang sebagai sesuatu yang besar. Ia bisa hadir lewat meja makan yang kosong, rumah yang tak lagi utuh, pekerjaan yang tidak cukup untuk bertahan, atau keputusan kecil yang ternyata lahir dari keadaan yang panjang. Bahwa sebelum menyebut seseorang bersalah, mungkin ada sesuatu yang belum kita ketahui. Bahwa di balik apa yang tampak sebagai pilihan, selalu ada keadaan yang ikut memilihkan.",
    dayLabel: "Sabtu",
    showDate: "2026-10-17",
    startsAt: "18:00:00",
    endsAt: "19:45:00",
    timeSlot: "18:00 — 19:45",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-4-1",
        title: "OTW",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/otw.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/otw.webp",
        director: "Michael Juan Saptayada",
        duration: "8 Menit",
        durationMin: 8,
        origin: "Tangerang, Indonesia",
        synopsis:
          "Sebuah animasi pendek tentang perjuangan pengendara ojek online dalam menghadapi kerasnya jalanan kota, pelanggan yang sulit, serta tuntutan sistem layanan dan himpitan ekonomi demi menjaga harapan hidup.",
      },
      {
        id: "film-4-2",
        title: "Hegemoni Kejantanan",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/hegemoni-kejantanan.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/hegemoni-kejantanan.webp",
        director: "Reyhan Verdana",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Jakarta, Indonesia",
        synopsis:
          "Di sebuah dapur, Yuyun (35) menyiapkan racikan jamu kuat Tjap Otong, mencoba menggantikan posisi suaminya, Otong (42) yang baru saja tiada. Di kedainya, Yuyun dihadapi dengan pedagang obat kuat lain bernama Joko (47) yang menyusun rencana licik bersama Indah (45), seorang juru parkir setempat. Yuyun disudutkan dan dipertanyakan kehadirannya di dunia usaha jamu kuat hanya karena ia adalah seorang perempuan.",
      },
      {
        id: "film-4-3",
        title: "Tut Wuri Handayani",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/tut-wuri-handayani.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/tut-wuri-handayani.webp",
        director: "Rifqi Ardiyanto",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Surakarta, Indonesia",
        synopsis:
          "Pagi hari di ruang guru, Surya, seorang guru honorer, sedang mengerjakan kesibukan sehari-harinya. Tiba-tiba Kepala Sekolah, Mulyono, memanggilnya ke ruangan dan meminta Surya untuk mengubah nilai rapor anaknya yang begitu rendah. Di bawah tekanan kekuasaan, Surya harus menentukan pilihannya antara kejujuran atau tuntutan atasan.",
      },
      {
        id: "film-4-4",
        title: "Sometimes Nina so Confusing",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/sometimes-nina-so-confusing.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/sometimes-nina-so-confusing.webp",
        director: "Nessa Aristi Winardi",
        duration: "21 Menit",
        durationMin: 21,
        origin: "Bandung, Indonesia",
        synopsis:
          "Nina (19) baru diterima di kampus impiannya, namun kegembiraan itu sirna ketika dihadapkan pada masalah pembayaran UKT sebelum pengumuman beasiswa keluar. Dalam keputusasaan karena keterbatasan waktu dan biaya, Nina tergiur oleh unggahan viral tentang kolektor fetish yang menawar celana dalam bekas dengan harga fantastis, hingga mendorongnya mencuri celana dalam tetangga rusun yang sering meremehkan keinginannya kuliah.",
      },
    ],
  },
  {
    id: "prog-5",
    slug: "buku-saku-sang-pengutip",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/buku-saku-sang-pengutip.webp",
    title: "Layar Raya",
    subtitle: "Buku Saku Sang Pengutip",
    description:
      "Sejatinya, kita tidak pernah benar-benar menciptakan sesuatu. Kita cuman makhluk yang pandai mengutip. Mengutip informasi dari perkataan dan perbuatan orang lain atau bahkan makhluk lain, lantas menyusunnya menjadi catatan-catatan berisi kiat-kiat melakukan sesuatu. Cara untuk menjadi orang dewasa, untuk merelakan kepergian seseorang, atau bahkan untuk sekadar mengatakan kebenaran itu benar. Seiring perjalanan, catatan-catatan itu bertambah, beberapa kita revisi, beberapa tidak lagi relevan, beberapa yang lain dikutip oleh anak cucu kita, atau mungkin oleh adik hasil perselingkuhan orang tua kita, bahkan saat kita tidak berniat mewariskannya. Kadang kita bergantung padanya, kadang kita lupa, kadang kita merasa Ia tidak berguna, tapi kita tetap menyimpannya di saku baju kita, sebagai buku penuh coretan untuk segala hal-hal yang terkadang terlalu membingungkan bagi kita yang bukan seorang pencipta. Buku saku milik para pengutip.\n\nProgram ini hanyalah beberapa kalimat kutipannya. Selamat mengutip.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "09:10:00",
    endsAt: "11:00:00",
    timeSlot: "09:10 — 11:00",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-5-1",
        title: "Tumbuhlah!",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/tumbuhlah.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/tumbuhlah.webp",
        director: "Magung Budiman",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Parepare, Indonesia",
        synopsis:
          "Terinspirasi dari cerita masa kecil tentang uang yang bisa ditanam menjadi pohon uang, Calu' dan Ukka' mencoba menumbuhkan 'pohon uang' mereka sendiri. Ketika menyadari bahwa uang tidak bisa tumbuh dari tanah, mereka beralih menanam tomat dan kangkung, mempelajari makna kejujuran, kerja keras, dan harapan yang tumbuh dari proses yang bersih.",
      },
      {
        id: "film-5-2",
        title: "Time Brings Roses, and Its Thorns",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/time-brings-roses-and-its-thorns.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/time-brings-roses-and-its-thorns.webp",
        director: "Enrico Reynard Winoto",
        duration: "23 Menit",
        durationMin: 23,
        origin: "Tangerang, Indonesia",
        synopsis:
          "Di dunia di mana gadis menumbuhkan bunga mawar di tubuh saat pubertas sebagai simbol kedewasaan, Raisa terlambat mekar. Ketika adiknya mekar lebih dulu, Raisa memalsukan bunganya demi mendapatkan pengakuan sang ibu dan memenuhi ekspektasi masyarakat.",
      },
      {
        id: "film-5-3",
        title: "Jenaka",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/jenaka.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/jenaka.webp",
        director: "Bray Shakira Azalea",
        duration: "23 Menit",
        durationMin: 23,
        origin: "Jatinangor, Indonesia",
        synopsis:
          "Andra (23), seorang fresh graduate yang tengah menjalani hidup di dalam mobil miliknya setelah kabur dari rumah yang menyesakkan, tiba-tiba dihubungi ibunya untuk menjaga adik tirinya yang berusia 5 tahun bernama Jenaka selama sehari. Tanpa pengalaman sedikit pun, rutinitas Andra berubah saat ia berusaha menjaga Jenaka di tengah kecamuk perasaannya terhadap keluarganya.",
      },
      {
        id: "film-5-4",
        title: "Hari ini, untuk Bapak",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/hari-ini-untuk-bapak.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/hari-ini-untuk-bapak.webp",
        director: "Helga Miraclle Penta Putsanra",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Dalam perjalanan bus menuju ujian CPNS demi memenuhi tuntutan ibunya, Lea bertemu dengan seorang anak kecil ceria dan sopir bus yang ramah. Perjumpaan hangat di sepanjang perjalanan tersebut perlahan membangkitkan kenangan masa kecil dan kerinduan mendalam Lea yang belum sempat terucap kepada mendiang Bapaknya.",
      },
    ],
  },
  {
    id: "prog-6",
    slug: "indonesia-raja-jawa-tengah-2026",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/indonesia-raja-jawa-tengah-2026.webp",
    title: "Layar Spesial",
    subtitle: "Minikino Indonesia Raja Jawa Tengah 2026",
    description:
      "Bagaimana anak-anak berelasi dengan teman, orang tua hingga masyarakat? Karena pada akhirnya mereka tidak hanya membutuhkan makanan sehat bergizi tapi juga butuh lingkungan yang sehat untuk bertumbuh!",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "11:40:00",
    endsAt: "13:25:00",
    timeSlot: "11:40 — 13:25",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 5,
    films: [
      {
        id: "film-6-1",
        title: "Selamat Makan!",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/selamat-makan.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/selamat-makan.webp",
        director: "Andra Erwinendya",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Diejek oleh teman sekolahnya, Nadia menyiapkan bekal makanan estetik saat mesin cuci ibunya rusak.",
      },
      {
        id: "film-6-2",
        title: "Aku Tahu Bapak",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/aku-tahu-bapak.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/aku-tahu-bapak.webp",
        director: "Ardhian Virgi",
        duration: "16 Menit",
        durationMin: 16,
        origin: "Prambanan, Klaten, Indonesia",
        synopsis:
          "Seorang anak ngobrol dengan ayahnya di pabrik tahu dan sadar hidup mereka seperti tahu, pelan dan penuh perubahan.",
      },
      {
        id: "film-6-3",
        title: "Nyanyian di Angkringan",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/nyanyian-di-angkringan.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/nyanyian-di-angkringan.webp",
        director: "Shafiyyah Aida",
        duration: "6 Menit",
        durationMin: 6,
        origin: "Kudus, Indonesia",
        synopsis:
          "Di tengah riuh angkringan, seorang anak yang menikmati dunia melalui suara menyebabkan salah paham oleh orang-orang.",
      },
      {
        id: "film-6-4",
        title: "Kodok Ning Jero Batok",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/kodok-ning-jero-batok.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/kodok-ning-jero-batok.webp",
        director: "Ali Yafie Muzaki",
        duration: "13 Menit",
        durationMin: 13,
        origin: "Surakarta, Indonesia",
        synopsis:
          "Paijo berusia 9 tahun mulai mempertanyakan arti sebuah cita-cita ketika menyaksikan kerasnya hidup yang dijalani keluarganya.",
      },
      {
        id: "film-6-5",
        title: "38-The Last Swing",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/38-the-last-swing.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/38-the-last-swing.webp",
        director: "Fajar Boby Saputra",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Semarang, Indonesia",
        synopsis:
          "Arum mengumpulkan 38 bola golf bekas untuk membayar PLS. Pada bola ke-38, sebuah ironi tragis mengakhiri mimpinya.",
      },
    ],
  },
  {
    id: "prog-7",
    slug: "gradasi-pucat-pasi",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/gradasi-pucat-pasi.webp",
    title: "Layar SKM",
    subtitle: "Gradasi Pucat Pasi",
    description:
      "Rasa takut terkadang tidak selalu datang dengan cara yang sama. Seringnya ia datang seiring kau menatap ngerinya entitas yang melangkahi logika. Terkadang juga ia bisa menyusup perlahan melalui bayangan dan suara, membuatmu ragu antara ada dan tiada. Ada kalanya pula kau bisa mengiringi datangnya rasa takut itu dengan tawa. Apa pun jalan masuknya, pucat pasi adalah warna yang tertinggal di wajahmu ketika rasa takut itu datang. Tapi dengan beragamnya cara ia datang, apakah sama juga gradasi warnanya? Gradasi Pucat Pasi ditampilkan pada dirimu sebagai palet yang merangkum spektrum warna horor, rasa takut, dan ketegangan, yang tak selalu gelap mencekam atau merah berdarah. Sebab barangkali, rasa takut memang tidak pernah benar-benar memiliki satu warna.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "14:05:00",
    endsAt: "16:05:00",
    timeSlot: "14:05 — 16:05",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-7-1",
        title: "Malady",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/malady.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/malady.webp",
        director: "Muhammad Daffa",
        duration: "17 Menit",
        durationMin: 17,
        origin: "Bandung / Yogyakarta, Indonesia",
        synopsis:
          "Terinspirasi dari pengalaman merantau di tengah pandemi COVID-19, film ini mengeksplorasi perasaan keterasingan, kesendirian, dan paranoia yang begitu nyata dari sudut pandang subjektif seorang penghuni indekos yang terjebak bersama tetangga yang terjangkit penyakit menular. Setiap momen dipenuhi ketegangan dengan satu pertanyaan mendasar: apakah kita masih akan melihat hari esok?",
      },
      {
        id: "film-7-2",
        title: "Limbung",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/limbung.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/limbung.webp",
        director: "Ananda Afta Firstiarko",
        duration: "27 Menit",
        durationMin: 27,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Di masa tuanya, Lazuardi, mantan detektif yang merawat seorang anak vampir yatim piatu bernama Kirana sebagai penebusan dosa di tengah desakan masyarakat yang menuntut pemusnahan kaum vampir, dihadapkan pada kasus lamanya yang kembali terbuka bersamaan dengan sang anak vampir yang mulai tumbuh dengan jarak.",
      },
      {
        id: "film-7-3",
        title: "We're All Indigo in This Country",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/were-all-indigo-in-this-country.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/were-all-indigo-in-this-country.webp",
        director: "Steven Antonio",
        duration: "15 Menit",
        durationMin: 15,
        origin: "D.I. Yogyakarta, Indonesia",
        synopsis:
          "Ketika sebuah kasus kecelakaan tidak menemukan bukti kejadian, Dena (24), seorang anak indigo dengan kemampuan retrokognisi untuk melihat masa lalu, diminta membantu Rohani (35), seorang polisi penyelidik. Namun, setelah Dena menembus waktu ke malam kejadian dan mendapati bahwa insiden tersebut adalah tabrak lari, suara lonceng dan sepatu yang dikenakan Rohani justru mengungkap bahwa polisi di sampingnya adalah pelaku kriminal yang sedang ia cari.",
      },
      {
        id: "film-7-4",
        title: "Kagol",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/kagol.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/kagol.webp",
        director: "Rais Akbar",
        duration: "19 Menit",
        durationMin: 19,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Anton, seorang penjudi desa yang terlilit utang dan kehabisan uang, nekat melakukan ritual pesugihan di Kali Urip melalui arahan Mbah Djiwo, seorang dukun desa yang agak meragukan. Berbekal sesajen, meditasi, dan mantra aneh, ritual tersebut justru berujung pada teror demit perempuan bergamis putih yang absurd di rumahnya sendiri.",
      },
    ],
  },
  {
    id: "prog-8",
    slug: "melampaui-batas-batas-yang-ada",
    posterUrl:
      "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/posters/melampaui-batas-batas-yang-ada.webp",
    title: "Layar Raya",
    subtitle: "Melampaui Batas-batas yang Ada",
    description:
      "Pengalaman tidak pernah terwujud dalam satu warna yang seragam. Kadang ia datang sebagai duka yang mengasingkan, obsesi yang tak masuk akal, atau bahkan komedi absurd di tengah hiruk-pikuk keseharian. Bentuk dan suaranya berbeda-beda, seolah saling bertolak belakang dan menuntut ruangnya masing-masing. Namun, bagaimana jika segala perbedaan bentuk dan suara itu tidak dibiarkan berjarak, melainkan dileburkan ke dalam satu wadah eksplorasi yang sama?\n\nProgram ini hadir untuk meruntuhkan sekat-sekat tersebut dengan menyusun deretan cerita yang sekilas tampak berjalan di jalurnya masing-masing dan tak bersinggungan. Melalui layar ini, kita tidak lagi dibatasi oleh aturan baku tentang bagaimana sebuah cerita harus dituturkan. Batas antara kenyataan, khayalan yang liar, hingga kepingan ingatan perlahan menjadi kabur. Seberagam apa pun bentuk dan nada ceritanya, pada akhirnya mereka semua akan melebur. Menyisakan satu pemahaman, bahwa cerita yang jujur tidak pernah terikat oleh satu aturan baku. Ia akan selalu menemukan caranya sendiri untuk terhubung dengan penonton, melampaui batas-batas yang ada.",
    dayLabel: "Minggu",
    showDate: "2026-10-18",
    startsAt: "16:45:00",
    endsAt: "18:20:00",
    timeSlot: "16:45 — 18:20",
    seatsLeft: 201,
    isSoldOut: false,
    totalFilmsCount: 4,
    films: [
      {
        id: "film-8-1",
        title: "Lamun Omongan",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/lamun-omongan.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/lamun-omongan.webp",
        director: "Moh. Bayu Saputra",
        duration: "6 Menit",
        durationMin: 6,
        origin: "Surakarta, Indonesia",
        synopsis:
          "Di sebuah warung makan seafood Lamongan, Lele dan Ayam beradu omongan tentang keunggulan serta jasa diri mereka masing-masing. Tak lama, hewan-hewan lain juga ikut beradu keunggulannya. Lantas siapakah yang paling unggul untuk Lamongan?",
      },
      {
        id: "film-8-2",
        title: "Cacing Biru",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/cacing-biru.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/cacing-biru.webp",
        director: "Baithar Diansyah Rahmisafitra",
        duration: "17 Menit",
        durationMin: 17,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Obsesi Agung mencari cacing alien biru setelah melihatnya di dalam mimpi mendorong obsesi Bima untuk menjadi sutradara lewat tugas film dokumenter kelompoknya.",
      },
      {
        id: "film-8-3",
        title: "A Flower is Not a Flower",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/a-flower-is-not-a-flower.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/a-flower-is-not-a-flower.webp",
        director: "Galih Saesar Wicaksono",
        duration: "15 Menit",
        durationMin: 15,
        origin: "Yogyakarta, Indonesia",
        synopsis:
          "Pasca kematian adiknya, Bunga tenggelam dalam keterasingan diri di mana waktu terasa terhenti dan segala hal terasa biru, hingga ia ingin meninggalkan kemanusiaannya dan menjadi bunga seutuhnya.",
      },
      {
        id: "film-8-4",
        title: "Asmarandana",
        posterUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/films/asmarandana.webp",
        stillUrl:
          "https://rqnjekzgafyjstnqjgzf.supabase.co/storage/v1/object/public/knf-media/stills/asmarandana.webp",
        director: "Mochamad Misbachul Umam",
        duration: "11 Menit",
        durationMin: 11,
        origin: "Semarang, Indonesia",
        synopsis:
          "Anggapan orang-orang di sekitar bahwa sang Ibu tak peduli dengan dirinya setelah menjadi Tenaga Kerja Wanita membuat Umam (21) memberanikan diri menghubungi Astuti (42), ibunya. Mencoba meluruskan fakta, Astuti menyampaikan sudut pandang dan penderitaan yang ia alami selama 16 tahun merantau di Arab Saudi demi melunasi utang keluarga.",
      },
    ],
  },
];
