"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import styles from "./StaffQrView.module.css";
import QRCode from "qrcode";
import { RefreshCw, Copy, Check } from "lucide-react";

type QrSessionData = {
  sessionToken: string;
  qrUrl: string;
  expiresAt: string;
};

export function StaffQrView() {
  const [sessionData, setSessionData] = useState<QrSessionData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchNewSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/qr/session", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to issue QR session");

      setSessionData(data);
      const remaining = Math.max(
        0,
        Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining || 300);

      // Render to canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, data.qrUrl, {
          width: 240,
          margin: 1,
          color: {
            dark: "#0b1933",
            light: "#ffffff",
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate QR code");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNewSession();
  }, [fetchNewSession]);

  // Redraw canvas if sessionData changes or canvas mounts
  useEffect(() => {
    if (sessionData && canvasRef.current) {
      void QRCode.toCanvas(canvasRef.current, sessionData.qrUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: "#0b1933",
          light: "#ffffff",
        },
      });
    }
  }, [sessionData]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          void fetchNewSession();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchNewSession]);

  const handleCopyLink = () => {
    if (!sessionData) return;
    void navigator.clipboard.writeText(sessionData.qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / 300) * 100));

  return (
    <AdminLayout>
      <div className={styles.qrWrapper}>
        <div className={styles.qrCard}>
          <span className={styles.badge}>STAFF QUEUE GATE</span>

          <div className={styles.titleArea}>
            <h2>Scan to Book Seat</h2>
            <p>Show this screen to attendees in line. Scanning unlocks a 5-minute booking session on their phone.</p>
          </div>

          {error && <div style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</div>}

          {/* QR Code Canvas */}
          <div className={styles.qrContainer}>
            <canvas ref={canvasRef} className={styles.qrCanvas} />
          </div>

          {/* Expiration Progress Timer */}
          <div className={styles.timerGroup}>
            <div className={styles.timerLabelRow}>
              <span>Dynamic QR Rotation:</span>
              <span className={styles.timerValue}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionsGroup}>
            <button
              onClick={() => void fetchNewSession()}
              disabled={loading}
              className={styles.rotateBtn}
            >
              <RefreshCw size={16} />
              <span>{loading ? "Generating..." : "Generate New QR Now"}</span>
            </button>

            <button onClick={handleCopyLink} className={styles.copyBtn}>
              {copied ? <Check size={15} color="#4ade80" /> : <Copy size={15} />}
              <span>{copied ? "Link Copied to Clipboard!" : "Copy Direct Session Link"}</span>
            </button>

            {copied && (
              <p className={styles.copiedNotice}>
                Attendees can paste this link into their phone browser directly.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
