"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./KioskHeader.module.css";

export interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function BackButton({
  href = "/",
  onClick,
  className = "",
  ariaLabel = "Kembali",
  disabled = false,
}: BackButtonProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${styles.backButton} ${className}`}
        aria-label={ariaLabel}
      >
        <span className={styles.backArrow} aria-hidden="true">←</span>
        <span>Back</span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.backButton} ${className}`}
      aria-label={ariaLabel}
    >
      <span className={styles.backArrow} aria-hidden="true">←</span>
      <span>Back</span>
    </Link>
  );
}

export interface KioskHeaderProps {
  currentStep: 1 | 2 | 3;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export function KioskHeader({
  currentStep,
  backHref = "/",
  onBack,
  className = "",
}: KioskHeaderProps) {
  return (
    <header className={`${styles.header} ${className}`}>
      {/* Canonical Back Button */}
      <BackButton href={backHref} onClick={onBack} />

      {/* Booking Progress Stepper */}
      <div className={styles.progressStepper} aria-label="Booking progress">
        <span className={currentStep === 1 ? styles.stepActive : styles.stepInactive}>
          1 Program
        </span>
        <div className={styles.stepDivider} />
        <span className={currentStep === 2 ? styles.stepActive : styles.stepInactive}>
          2 Seats
        </span>
        <div className={styles.stepDivider} />
        <span className={currentStep === 3 ? styles.stepActive : styles.stepInactive}>
          3 Done
        </span>
      </div>

      {/* Mascot Logo */}
      <Image
        src="/assets/knf-logo.png"
        alt="KNF 2026 Logo"
        width={46}
        height={46}
        priority
        className={styles.mascotLogo}
      />
    </header>
  );
}
