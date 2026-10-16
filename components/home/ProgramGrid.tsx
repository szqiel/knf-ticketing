"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/app/home.module.css";
import { ProgramTitle } from "./ProgramTitle";
import { NoSeatsModal } from "@/components/booking/NoSeatsModal";
import type { Program } from "@/lib/data/mock-programs";

interface ProgramGridProps {
  programs: Program[];
}

export function ProgramGrid({ programs }: ProgramGridProps) {
  const [selectedUnavailableProgram, setSelectedUnavailableProgram] =
    useState<Program | null>(null);

  return (
    <>
      <section
        className={styles.gridContainer}
        aria-label="Festival Programs Lineup"
      >
        {programs.map((program) => {
          const isUnavailable = program.isSoldOut;

          if (isUnavailable) {
            return (
              <div
                key={program.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedUnavailableProgram(program)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedUnavailableProgram(program);
                  }
                }}
                className={`${styles.programCard} ${styles.cardSoldOut}`}
                aria-label={`${program.title} - Unavailable (Sold Out)`}
              >
                {/* Left: Poster Box */}
                <div className={styles.posterBox}>
                  {program.posterUrl ? (
                    <Image
                      src={program.posterUrl}
                      alt={program.title}
                      fill
                      sizes="(max-width: 640px) 140px, 200px"
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
                    <ProgramTitle
                      title={program.title}
                      subtitle={program.subtitle}
                      isSoldOut={true}
                    />
                  </div>

                  <div className={styles.timePillSoldOut}>
                    <span className={styles.dayLabel}>{program.dayLabel}</span>
                    <span className={styles.timeLabel}>{program.timeSlot}</span>
                  </div>

                  <div className={styles.badgeSoldOut}>
                    SOLD OUT
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={program.id}
              href={`/p/${program.slug}`}
              className={`${styles.programCard} ${styles.cardActive}`}
            >
              {/* Left: Poster Box */}
              <div className={styles.posterBox}>
                {program.posterUrl ? (
                  <Image
                    src={program.posterUrl}
                    alt={program.title}
                    fill
                    sizes="(max-width: 640px) 140px, 200px"
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
                  <ProgramTitle
                    title={program.title}
                    subtitle={program.subtitle}
                    isSoldOut={false}
                  />
                </div>

                <div className={styles.timePillActive}>
                  <span className={styles.dayLabel}>{program.dayLabel}</span>
                  <span className={styles.timeLabel}>{program.timeSlot}</span>
                </div>

                <div className={styles.badgeActive}>
                  {`${program.seatsLeft} SEATS LEFT`}
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* No Seats Available Modal when clicking unavailable program */}
      <NoSeatsModal
        open={Boolean(selectedUnavailableProgram)}
        onClose={() => setSelectedUnavailableProgram(null)}
        dayLabel={selectedUnavailableProgram?.dayLabel}
        timeSlot={selectedUnavailableProgram?.timeSlot}
        onChooseAnother={() => setSelectedUnavailableProgram(null)}
      />
    </>
  );
}
