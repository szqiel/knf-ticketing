"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import styles from "./FilmDetailModal.module.css";
import type { Film } from "@/lib/data/mock-programs";

interface FilmDetailModalProps {
  film: Film | null;
  programTitle: string;
  onClose: () => void;
}

export function FilmDetailModal({
  film,
  programTitle,
  onClose,
}: FilmDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (film) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [film, onClose]);

  if (!film) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Tutup Detail Film"
          type="button"
        >
          ✕
        </button>

        {/* Modal Layout: 2 Columns */}
        <div className={styles.modalGrid}>
          {/* Left Column: Film Poster */}
          <div className={styles.posterColumn}>
            {film.posterUrl ? (
              <Image
                src={film.posterUrl}
                alt={film.title}
                fill
                sizes="280px"
                className={styles.posterImage}
              />
            ) : (
              <div className={styles.posterPlaceholder}>
                <div className={styles.crossLine1} />
                <div className={styles.crossLine2} />
                <div className={styles.posterBadge}>FILM POSTER</div>
              </div>
            )}
          </div>

          {/* Right Column: Film Information */}
          <div className={styles.infoColumn}>
            {/* Program Name Tag */}
            <div className={styles.programTag}>{programTitle}</div>

            {/* Film Title */}
            <h2 className={styles.filmTitle}>{film.title}</h2>

            {/* Metadata Table / Pill */}
            <div className={styles.metadataPill}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>SUTRADARA</span>
                <span className={styles.metaValue}>{film.director}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>DURASI</span>
                <span className={styles.metaValue}>{film.duration}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>ASAL</span>
                <span className={styles.metaValue}>{film.origin}</span>
              </div>
            </div>

            {/* Synopsis Section */}
            <div className={styles.synopsisArea}>
              <h3 className={styles.synopsisHeading}>Synopsis</h3>
              <p className={styles.synopsisText}>{film.synopsis}</p>
            </div>

            {/* Film Still Photo Placeholder */}
            <div className={styles.stillPhotoBox}>
              {film.stillUrl ? (
                <Image
                  src={film.stillUrl}
                  alt={`${film.title} still`}
                  fill
                  sizes="400px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <>
                  <div className={styles.crossLine1} />
                  <div className={styles.crossLine2} />
                  <div className={styles.stillBadge}>FILM STILL</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
