import Image from "next/image";
import styles from "./home.module.css";
import { getProgramsWithLiveAvailability } from "@/lib/booking/service";
import { ProgramGrid } from "@/components/home/ProgramGrid";

export const instant = false;

export default async function HomePage() {
  const programsList = await getProgramsWithLiveAvailability();

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
              src="/assets/festival-programs.png"
              alt="Festival Programs"
              width={408}
              height={171}
              priority
              className={styles.wordmarkImage}
            />
          </section>

          {/* 2-Column Program Cards Grid */}
          <ProgramGrid programs={programsList} />
        </div>
      </div>
    </main>
  );
}
