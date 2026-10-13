"use client";

import React, { useId } from "react";
import styles from "./ProgramTitle.module.css";

interface ProgramTitleProps {
  title: string;
  subtitle?: string;
  isSoldOut: boolean;
}

export function ProgramTitle({ title, subtitle, isSoldOut }: ProgramTitleProps) {
  const rawId = useId();
  // Sanitize id for SVG url references (strip colons)
  const uid = rawId.replace(/:/g, "");
  const fillId = `blueTitleFill-${uid}`;
  const strokeId = `blueTitleStroke-${uid}`;
  const filterId = `titleDropShadow-${uid}`;

  if (isSoldOut) {
    return (
      <div className={styles.soldOutContainer}>
        <h2 className={styles.soldOutTitle}>{title}</h2>
        {subtitle && <p className={styles.soldOutSubtitle}>{subtitle}</p>}
      </div>
    );
  }

  // Active program title with 1:1 Figma gradients, outline, and drop shadows
  const hasSubtitle = Boolean(subtitle);
  const svgHeight = hasSubtitle ? 56 : 42;
  const viewBox = `0 0 340 ${svgHeight}`;

  return (
    <div className={styles.activeContainer}>
      <svg
        viewBox={viewBox}
        className={styles.titleSvg}
        style={{ height: hasSubtitle ? "56px" : "42px" }}
        aria-label={subtitle ? `${title} - ${subtitle}` : title}
        role="img"
      >
        <defs>
          {/* Exact fill from Figma node #113:286 */}
          <linearGradient
            id={fillId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#0015CF" />
            <stop offset="16%" stopColor="#0015CF" />
            <stop offset="38%" stopColor="#8793FF" />
            <stop offset="41%" stopColor="#EFF1FF" />
            <stop offset="44%" stopColor="#0418CE" />
            <stop offset="100%" stopColor="#0015CF" />
          </linearGradient>

          {/* Exact multi-stop outline from Figma node #113:286 */}
          <linearGradient
            id={strokeId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#0011AD" />
            <stop offset="21%" stopColor="#CFD4FD" />
            <stop offset="27%" stopColor="#0216CF" />
            <stop offset="51%" stopColor="#0116CF" />
            <stop offset="62%" stopColor="#EFF1FF" />
            <stop offset="74%" stopColor="#0015CF" />
            <stop offset="100%" stopColor="#0011AD" />
          </linearGradient>

          {/* Exact textShadow effects from Figma node #113:286 */}
          <filter
            id={filterId}
            x="-10%"
            y="-30%"
            width="125%"
            height="160%"
          >
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
        </defs>

        {/* Main Title */}
        <text
          x="1"
          y={hasSubtitle ? "29" : "33"}
          className={styles.svgTitleText}
          fill={`url(#${fillId})`}
          stroke={`url(#${strokeId})`}
          strokeWidth="1.6"
          paintOrder="stroke fill"
          filter={`url(#${filterId})`}
        >
          {title}
        </text>

        {/* Subtitle (e.g. Minikino Indonesia Raja...) */}
        {subtitle && (
          <text
            x="1"
            y="50"
            className={styles.svgSubtitleText}
            fill={`url(#${fillId})`}
          >
            {subtitle}
          </text>
        )}
      </svg>
    </div>
  );
}
