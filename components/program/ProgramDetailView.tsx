"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProgramDetailView.module.css";
import type { Film, Program } from "@/lib/data/mock-programs";
import { FilmDetailModal } from "./FilmDetailModal";
import { NoSeatsModal } from "@/components/booking/NoSeatsModal";
import { ProgramHeroTitle } from "./ProgramHeroTitle";
import { LineupHeader } from "./LineupHeader";
import { KioskHeader } from "@/components/common/KioskHeader";

interface ProgramDetailViewProps {
  program: Program;
}

export function ProgramDetailView({ program }: ProgramDetailViewProps) {
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [noSeatsModalOpen, setNoSeatsModalOpen] = useState(false);

  const films = program.films ?? [];
  const filmCount = program.totalFilmsCount ?? films.length;

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.kioskCard}>
        {/* Header Bar */}
        <KioskHeader currentStep={1} backHref="/" />

        {/* Hero Program Banner Card */}
        <section className={styles.heroBanner} aria-label="Detail Program">
          {/* Left Poster */}
          <div className={styles.bannerPoster}>
            {program.posterUrl ? (
              <Image
                src={program.posterUrl}
                alt={program.title}
                fill
                sizes="(max-width: 768px) 100vw, 266px"
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

          {/* Center Info */}
          <div className={styles.bannerInfo}>
            <ProgramHeroTitle
              title={program.title}
              subtitle={program.subtitle}
              isSoldOut={program.isSoldOut}
            />

            <p className={styles.programDescription}>
              {program.description ??
                "Program pemutaran film-film pendek pilihan karya sineas muda berbakat yang menghadirkan ragam perspektif dan kepekaan visual yang segar."}
            </p>

            <div className={styles.timePill}>
              <span className={styles.dayLabel}>{program.dayLabel}</span>
              <span className={styles.timeLabel}>{program.timeSlot}</span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className={styles.bannerAction}>
            <div className={styles.statusBadge}>
              {program.isSoldOut ? "SOLD OUT" : `${program.seatsLeft} SEATS LEFT`}
            </div>

            {program.isSoldOut ? (
              <button
                type="button"
                onClick={() => setNoSeatsModalOpen(true)}
                className={styles.chooseSeatDisabled}
                aria-haspopup="dialog"
              >
                Sold Out
              </button>
            ) : (
              <Link
                href={`/p/${program.slug}/seats`}
                className={styles.chooseSeatButton}
              >
                Choose Seat →
              </Link>
            )}
          </div>
        </section>

        {/* Section Divider / Line-up Header */}
        <LineupHeader filmCount={filmCount} />

        {/* 3-Column Movie Cards Grid */}
        <section className={styles.movieGrid} aria-label="Daftar Film Pendek">
          {films.map((film) => (
            <article key={film.id} className={styles.movieCard}>
              {/* Poster Box */}
              <div className={styles.moviePoster}>
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt={film.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 360px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <>
                    <div className={styles.crossLine1} />
                    <div className={styles.crossLine2} />
                    <div className={styles.moviePosterBadge}>FILM POSTER</div>
                  </>
                )}
              </div>

              {/* Card Content */}
              <div className={styles.movieContent}>
                <h3 className={styles.movieTitle}>{film.title}</h3>

                <div className={styles.directorPill}>
                  <span className={styles.directorName}>{film.director}</span>
                  <span className={styles.filmDuration}>{film.duration}</span>
                </div>

                <button
                  type="button"
                  className={styles.detailButton}
                  onClick={() => setSelectedFilm(film)}
                >
                  Detail film
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Film Detail Modal (Frame 5) */}
      <FilmDetailModal
        film={selectedFilm}
        programTitle={program.title}
        onClose={() => setSelectedFilm(null)}
      />

      {/* No Seats Available Modal (Frame 7) */}
      <NoSeatsModal
        open={noSeatsModalOpen}
        onClose={() => setNoSeatsModalOpen(false)}
        dayLabel={program.dayLabel}
        timeSlot={program.timeSlot}
      />
    </main>
  );
}
