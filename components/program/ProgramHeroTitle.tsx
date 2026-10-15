"use client";

import React, { useId } from "react";
import styles from "./ProgramHeroTitle.module.css";

interface ProgramHeroTitleProps {
  title: string;
  subtitle?: string;
  isSoldOut?: boolean;
}

/**
 * Intelligently splits a long program title into 2 balanced lines
 * at natural word boundaries so it never overflows or collides with buttons.
 */
function getTitleLines(title: string): string[] {
  const cleanTitle = title.trim();
  if (cleanTitle.length <= 15) {
    return [cleanTitle];
  }

  const words = cleanTitle.split(/\s+/);
  if (words.length <= 1) {
    return [cleanTitle];
  }

  // Find optimal split point near the middle of character length
  const halfLength = cleanTitle.length / 2;
  let bestSplitIndex = 1;
  let minDiff = Infinity;
  let accumulated = 0;

  for (let i = 0; i < words.length - 1; i++) {
    accumulated += words[i].length + (i > 0 ? 1 : 0);
    const diff = Math.abs(accumulated - halfLength);
    if (diff < minDiff) {
      minDiff = diff;
      bestSplitIndex = i + 1;
    }
  }

  const line1 = words.slice(0, bestSplitIndex).join(" ");
  const line2 = words.slice(bestSplitIndex).join(" ");

  return [line1, line2];
}

export function ProgramHeroTitle({
  title,
  subtitle,
  isSoldOut = false,
}: ProgramHeroTitleProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  const fillId = `heroBlueFill-${uid}`;
  const strokeId = `heroBlueStroke-${uid}`;
  const shadowId = `heroBlueShadow-${uid}`;
  const festShadowId = `festShadow-${uid}`;

  const hasSubtitle = Boolean(subtitle);
  const titleLines = getTitleLines(title);
  const isMultiLine = titleLines.length > 1;

  // Calculate SVG height and coordinates dynamically
  let svgHeight = 88;
  if (isMultiLine) {
    svgHeight = hasSubtitle ? 168 : 130;
  } else if (hasSubtitle) {
    svgHeight = 120;
  }

  const viewBox = `0 0 460 ${svgHeight}`;

  return (
    <div className={styles.container}>
      <svg
        viewBox={viewBox}
        className={styles.titleSvg}
        role="img"
        aria-label={`Festival Programs - ${title}${subtitle ? ` - ${subtitle}` : ""}`}
      >
        <defs>
          {/* Blue chrome gradient fill matching Figma */}
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0015CF" />
            <stop offset="16%" stopColor="#0015CF" />
            <stop offset="38%" stopColor="#8793FF" />
            <stop offset="41%" stopColor="#EFF1FF" />
            <stop offset="44%" stopColor="#0418CE" />
            <stop offset="100%" stopColor="#0015CF" />
          </linearGradient>

          {/* Multi-stop outline matching Figma */}
          <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0011AD" />
            <stop offset="21%" stopColor="#CFD4FD" />
            <stop offset="27%" stopColor="#0216CF" />
            <stop offset="51%" stopColor="#0116CF" />
            <stop offset="62%" stopColor="#EFF1FF" />
            <stop offset="74%" stopColor="#0015CF" />
            <stop offset="100%" stopColor="#0011AD" />
          </linearGradient>

          {/* Drop Shadow for Main Title */}
          <filter id={shadowId} x="-10%" y="-30%" width="125%" height="160%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="0.2"
              floodColor="#0015CF"
              floodOpacity="1"
            />
            <feDropShadow
              dx="0"
              dy="3.5"
              stdDeviation="2.5"
              floodColor="#8DB9FF"
              floodOpacity="0.85"
            />
          </filter>

          {/* Drop Shadow for Festival Programs */}
          <filter id={festShadowId} x="-10%" y="-30%" width="125%" height="160%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="1.5"
              floodColor="#000A69"
              floodOpacity="1"
            />
          </filter>
        </defs>

        {/* 1. "Festival Programs" Header */}
        <text
          x="2"
          y="26"
          className={styles.festivalText}
          fill="#FFFFFF"
          stroke={`url(#${strokeId})`}
          strokeWidth="1.2"
          paintOrder="stroke fill"
          filter={`url(#${festShadowId})`}
        >
          Festival Programs
        </text>

        {/* 2. Program Title (Single or Multi-line) */}
        {isMultiLine ? (
          <>
            <text
              x="2"
              y="68"
              className={styles.programTitleMultiLine}
              fill={isSoldOut ? "#A5A5A5" : `url(#${fillId})`}
              stroke={isSoldOut ? "none" : `url(#${strokeId})`}
              strokeWidth={isSoldOut ? "0" : "1.6"}
              paintOrder="stroke fill"
              filter={isSoldOut ? "none" : `url(#${shadowId})`}
            >
              {titleLines[0]}
            </text>
            <text
              x="2"
              y="110"
              className={styles.programTitleMultiLine}
              fill={isSoldOut ? "#A5A5A5" : `url(#${fillId})`}
              stroke={isSoldOut ? "none" : `url(#${strokeId})`}
              strokeWidth={isSoldOut ? "0" : "1.6"}
              paintOrder="stroke fill"
              filter={isSoldOut ? "none" : `url(#${shadowId})`}
            >
              {titleLines[1]}
            </text>
          </>
        ) : (
          <text
            x="2"
            y="68"
            className={title.length > 12 ? styles.programTitleMedium : styles.programTitleLarge}
            fill={isSoldOut ? "#A5A5A5" : `url(#${fillId})`}
            stroke={isSoldOut ? "none" : `url(#${strokeId})`}
            strokeWidth={isSoldOut ? "0" : "1.8"}
            paintOrder="stroke fill"
            filter={isSoldOut ? "none" : `url(#${shadowId})`}
          >
            {title}
          </text>
        )}

        {/* 3. Subtitle (if available) */}
        {subtitle && (
          <text
            x="2"
            y={isMultiLine ? 144 : 102}
            className={styles.subtitleText}
            fill={isSoldOut ? "#8C8C8C" : `url(#${fillId})`}
          >
            {subtitle}
          </text>
        )}
      </svg>
    </div>
  );
}
