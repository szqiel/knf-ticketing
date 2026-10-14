"use client";

import React, { useId } from "react";
import styles from "./LineupHeader.module.css";

interface LineupHeaderProps {
  filmCount: number;
}

export function LineupHeader({ filmCount }: LineupHeaderProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  const yellowGradId = `yellowGrad-${uid}`;
  const dropShadowId = `extrudedShadow-${uid}`;

  return (
    <div className={styles.headerWrapper}>
      {/* 1. "Film line-up" SVG (Node #102:254) */}
      <div className={styles.titleContainer}>
        <svg
          viewBox="0 0 280 52"
          className={styles.titleSvg}
          role="img"
          aria-label="Film line-up"
        >
          <defs>
            <linearGradient id={yellowGradId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FFFF00" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            <filter id={dropShadowId} x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow
                dx="-3"
                dy="1"
                stdDeviation="0.2"
                floodColor="#000A69"
                floodOpacity="1"
              />
            </filter>
          </defs>

          <text
            x="4"
            y="38"
            fill={`url(#${yellowGradId})`}
            stroke="#000A69"
            strokeWidth="1.2"
            paintOrder="stroke fill"
            filter={`url(#${dropShadowId})`}
            className={styles.titleText}
          >
            Film line-up
          </text>
        </svg>
      </div>

      {/* 2. "10 SHORT FILMS" SVG (Node #102:256) */}
      <div className={styles.badgeContainer}>
        <svg
          viewBox="0 0 280 52"
          className={styles.badgeSvg}
          role="img"
          aria-label={`${filmCount} SHORT FILMS`}
        >
          <text
            x="276"
            y="38"
            textAnchor="end"
            fill={`url(#${yellowGradId})`}
            stroke="#000A69"
            strokeWidth="1.2"
            paintOrder="stroke fill"
            filter={`url(#${dropShadowId})`}
            className={styles.badgeText}
          >
            {filmCount} SHORT FILMS
          </text>
        </svg>
      </div>
    </div>
  );
}
