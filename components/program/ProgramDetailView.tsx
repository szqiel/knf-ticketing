"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProgramDetailView.module.css";
import type { Film, Program } from "@/lib/data/mock-programs";
import { FilmDetailModal } from "./FilmDetailModal";
import { ProgramHeroTitle } from "./ProgramHeroTitle";
import { LineupHeader } from "./LineupHeader";

interface ProgramDetailViewProps {
  program: Program;
}

export function ProgramDetailView({ program }: ProgramDetailViewProps) {
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  const films = program.films ?? [];
  const filmCount = program.totalFilmsCount ?? films.length;

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.kioskCard}>
        {/* Header Bar */}
        <header className={styles.header}>
          {/* Back Button */}
          <Link href="/" className={styles.backButton} aria-label="Kembali ke Beranda">
            <span className={styles.backArrow}>←</span>
            <span>Back</span>
          </Link>

          {/* Stepper Pill */}
          <div className={styles.progressStepper} aria-label="Booking progress">
            <span className={styles.stepActive}>1 Program</span>
            <div className={styles.stepDivider} />
            <span className={styles.stepInactive}>2 Seats</span>
            <div className={styles.stepDivider} />
            <span className={styles.stepInactive}>3 Done</span>
          </div>

          {/* Mascot Logo */}
          <Image
            src="/assets/knf-logo.png"
            alt="KNF 2026 Mascot"
            width={46}
            height={46}
            priority
            className={styles.mascotLogo}
          />
        </header>

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
              <button disabled className={styles.chooseSeatDisabled}>
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
    </main>
  );
}
