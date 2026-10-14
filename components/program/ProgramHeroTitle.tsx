"use client";

import React, { useId } from "react";
import styles from "./ProgramHeroTitle.module.css";

interface ProgramHeroTitleProps {
  title: string;
  subtitle?: string;
  isSoldOut?: boolean;
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
  const svgHeight = hasSubtitle ? 120 : 95;
  const viewBox = `0 0 540 ${svgHeight}`;

  return (
    <div className={styles.container}>
      <svg
        viewBox={viewBox}
        className={styles.titleSvg}
        style={{ height: hasSubtitle ? "120px" : "95px" }}
        role="img"
        aria-label={`Festival Programs - ${title}${subtitle ? ` - ${subtitle}` : ""}`}
      >
        <defs>
          {/* Exact blue chrome gradient fill from Figma */}
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0015CF" />
            <stop offset="16%" stopColor="#0015CF" />
            <stop offset="38%" stopColor="#8793FF" />
            <stop offset="41%" stopColor="#EFF1FF" />
            <stop offset="44%" stopColor="#0418CE" />
            <stop offset="100%" stopColor="#0015CF" />
          </linearGradient>

          {/* Exact multi-stop outline from Figma node #113:286 & #104:369 */}
          <linearGradient id={strokeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0011AD" />
            <stop offset="21%" stopColor="#CFD4FD" />
            <stop offset="27%" stopColor="#0216CF" />
            <stop offset="51%" stopColor="#0116CF" />
            <stop offset="62%" stopColor="#EFF1FF" />
            <stop offset="74%" stopColor="#0015CF" />
            <stop offset="100%" stopColor="#0011AD" />
          </linearGradient>

          {/* Dual Drop Shadow for Main Title */}
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

          {/* Drop Shadow for Festival Programs node #104:373 */}
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

        {/* 1. "Festival Programs" (Node #104:373) */}
        <text
          x="2"
          y="30"
          className={styles.festivalText}
          fill="#FFFFFF"
          stroke={`url(#${strokeId})`}
          strokeWidth="1.2"
          paintOrder="stroke fill"
          filter={`url(#${festShadowId})`}
        >
          Festival Programs
        </text>

        {/* 2. Program Title (Node #104:369, e.g. "Goresan Awal") */}
        <text
          x="2"
          y="76"
          className={styles.programTitleText}
          fill={isSoldOut ? "#A5A5A5" : `url(#${fillId})`}
          stroke={isSoldOut ? "none" : `url(#${strokeId})`}
          strokeWidth={isSoldOut ? "0" : "1.8"}
          paintOrder="stroke fill"
          filter={isSoldOut ? "none" : `url(#${shadowId})`}
        >
          {title}
        </text>

        {/* 3. Subtitle (if available) */}
        {subtitle && (
          <text
            x="2"
            y="104"
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
