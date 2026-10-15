"use client";

import React, { useEffect, useId } from "react";
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
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  const tagYellowGradId = `tagYellowGrad-${uid}`;
  const tagShadowId = `tagShadow-${uid}`;
  const titleBlueGradId = `titleBlueGrad-${uid}`;
  const titleShadowId = `titleShadow-${uid}`;
  const synBlueGradId = `synBlueGrad-${uid}`;
  const synShadowId = `synShadow-${uid}`;

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
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`film-modal-title-${uid}`}
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button (Figma Node #132:477) */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Tutup Detail Film"
          type="button"
        >
          <span className={styles.closeIcon}>×</span>
        </button>

        {/* Modal 2-Column Layout (Figma Node #132:469) */}
        <div className={styles.modalGrid}>
          {/* Left Column: Film Poster (Figma Node #132:470) */}
          <div className={styles.posterColumn}>
            {film.posterUrl ? (
              <div className={styles.posterImageWrap}>
                <Image
                  src={film.posterUrl}
                  alt={film.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 336px"
                  className={styles.posterImage}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <div className={styles.posterPlaceholder}>
                <div className={styles.crossLine1} />
                <div className={styles.crossLine2} />
                <div className={styles.posterBadge}>FILM POSTER</div>
              </div>
            )}
          </div>

          {/* Right Column: Film Information (Figma Node #132:479) */}
          <div className={styles.infoColumn}>
            {/* 1. Header Tag "INFORMASI FILM" (Figma Node #132:481) */}
            <div className={styles.tagWrapper}>
              <svg
                viewBox="0 0 320 32"
                className={styles.tagSvg}
                role="img"
                aria-label="INFORMASI FILM"
              >
                <defs>
                  <linearGradient id={tagYellowGradId} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FFFF00" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                  <filter
                    id={tagShadowId}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="1"
                      dy="1"
                      stdDeviation="0.2"
                      floodColor="#000A69"
                      floodOpacity="1"
                    />
                  </filter>
                </defs>
                <text
                  x="2"
                  y="24"
                  fill={`url(#${tagYellowGradId})`}
                  stroke="#000A69"
                  strokeWidth="1"
                  paintOrder="stroke fill"
                  filter={`url(#${tagShadowId})`}
                  className={styles.tagText}
                >
                  INFORMASI FILM
                </text>
              </svg>
            </div>

            {/* 2. Film Title (Figma Node #132:483) */}
            <div className={styles.titleWrapper} id={`film-modal-title-${uid}`}>
              <svg
                viewBox="0 0 540 56"
                className={styles.titleSvg}
                role="img"
                aria-label={film.title}
              >
                <defs>
                  {/* Glossy blue chrome split at 50% (half of the text) */}
                  <linearGradient id={titleBlueGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0014CA" />
                    <stop offset="46%" stopColor="#8993EB" />
                    <stop offset="49%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#0015CF" />
                    <stop offset="100%" stopColor="#000A69" />
                  </linearGradient>
                  <filter
                    id={titleShadowId}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="0.2"
                      floodColor="#000A69"
                      floodOpacity="1"
                    />
                  </filter>
                </defs>
                <text
                  x="2"
                  y="44"
                  fill={`url(#${titleBlueGradId})`}
                  stroke="#000A69"
                  strokeWidth="1.2"
                  paintOrder="stroke fill"
                  filter={`url(#${titleShadowId})`}
                  className={styles.filmTitleText}
                >
                  {film.title}
                </text>
              </svg>
            </div>

            {/* 3. Metadata 3-Column Pill Container (Figma Node #132:485) */}
            <div className={styles.metadataPill}>
              {/* Col 1: Sutradara */}
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>SUTRADARA</span>
                <span className={styles.metaValue}>{film.director}</span>
              </div>
              {/* Col 2: Duration */}
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>DURATION</span>
                <span className={styles.metaValue}>{film.duration}</span>
              </div>
              {/* Col 3: Origin */}
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>ORIGIN</span>
                <span className={styles.metaValue}>{film.origin}</span>
              </div>
            </div>

            {/* 4. Synopsis Section (Figma Node #132:501 - #132:505) */}
            <div className={styles.synopsisArea}>
              <svg
                viewBox="0 0 200 36"
                className={styles.synopsisSvg}
                role="img"
                aria-label="Synopsis"
              >
                <defs>
                  <linearGradient id={synBlueGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0014CA" />
                    <stop offset="46%" stopColor="#8993EB" />
                    <stop offset="49%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#0015CF" />
                    <stop offset="100%" stopColor="#000A69" />
                  </linearGradient>
                  <filter
                    id={synShadowId}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="1"
                      stdDeviation="0.2"
                      floodColor="#000A69"
                      floodOpacity="1"
                    />
                  </filter>
                </defs>
                <text
                  x="2"
                  y="28"
                  fill={`url(#${synBlueGradId})`}
                  stroke="#000A69"
                  strokeWidth="1"
                  paintOrder="stroke fill"
                  filter={`url(#${synShadowId})`}
                  className={styles.synopsisHeadingText}
                >
                  Synopsis
                </text>
              </svg>

              <p className={styles.synopsisText}>{film.synopsis}</p>
            </div>

            {/* 5. Film Still Photo Box (Figma Node #132:507) */}
            <div className={styles.stillPhotoBox}>
              {film.stillUrl ? (
                <Image
                  src={film.stillUrl}
                  alt={`${film.title} still`}
                  fill
                  sizes="(max-width: 768px) 100vw, 568px"
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
