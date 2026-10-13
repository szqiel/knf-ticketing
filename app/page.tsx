import Image from "next/image";
import Link from "next/link";
import styles from "./home.module.css";
import { MOCK_PROGRAMS } from "@/lib/data/mock-programs";

export default function HomePage() {
  return (
    <main className={styles.pageWrapper}>
      <div className={styles.overlay}>
        <div className={styles.kioskContainer}>
          {/* Header with Mascot */}
          <header className={styles.header}>
            <Image
              src="/assets/knf-logo.png"
              alt="KNF 2026 Mascot Logo"
              width={88}
              height={88}
              priority
              className={styles.mascotLogo}
            />
          </header>

          {/* Hero Section */}
          <section className={styles.heroSection}>
            <div className={styles.schedulePill}>PROGRAM SCHEDULE</div>
            <Image
              src="/assets/festival-programs-vector.svg"
              alt="Festival Programs"
              width={408}
              height={171}
              priority
              style={{ height: "auto" }}
              className={styles.wordmarkImage}
            />
          </section>

          {/* 2-Column Program Cards Grid */}
          <section
            className={styles.gridContainer}
            aria-label="Festival Programs Lineup"
          >
            {MOCK_PROGRAMS.map((program) => (
              <Link
                key={program.id}
                href={`/p/${program.slug}`}
                className={`${styles.programCard} ${
                  program.isSoldOut ? styles.cardSoldOut : styles.cardActive
                }`}
              >
                {/* Left: Poster Box */}
                <div className={styles.posterBox}>
                  {program.posterUrl ? (
                    <Image
                      src={program.posterUrl}
                      alt={program.title}
                      fill
                      sizes="200px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <div className={styles.crossLine1} />
                      <div className={styles.crossLine2} />
                      <div className={styles.posterBadge}>PROGRAM POSTER</div>
                    </>
                  )}
                </div>

                {/* Right: Content Area */}
                <div className={styles.contentBox}>
                  <div className={styles.titleArea}>
                    <h2
                      className={
                        program.isSoldOut
                          ? styles.titleSoldOut
                          : styles.titleActive
                      }
                    >
                      {program.title}
                    </h2>
                    {program.subtitle && (
                      <p className={styles.subtitle}>{program.subtitle}</p>
                    )}
                  </div>

                  <div
                    className={
                      program.isSoldOut
                        ? styles.timePillSoldOut
                        : styles.timePillActive
                    }
                  >
                    <span className={styles.dayLabel}>{program.dayLabel}</span>
                    <span className={styles.timeLabel}>{program.timeSlot}</span>
                  </div>

                  <div
                    className={
                      program.isSoldOut
                        ? styles.badgeSoldOut
                        : styles.badgeActive
                    }
                  >
                    {program.isSoldOut
                      ? "SOLD OUT"
                      : `${program.seatsLeft} SEATS LEFT`}
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {/* Footer */}
          <footer className={styles.footer}>
            <span className={styles.footerText}>KNF 2026</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
