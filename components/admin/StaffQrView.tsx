"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import styles from "./StaffQrView.module.css";
import QRCode from "qrcode";
import { RefreshCw, Copy, Check, Globe, Edit3 } from "lucide-react";

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

  // Resolved public base domain: never defaults to localhost
  const [baseDomain, setBaseDomain] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return origin;
      }
    }
    return (
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://tomatoes-established-separated-spencer.trycloudflare.com"
    );
  });
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState("");

  const fetchNewSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/qr/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: baseDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to issue QR session");

      // Ensure the QR URL is strictly on the public domain, never localhost
      const finalOrigin = baseDomain.startsWith("http") ? baseDomain : `https://${baseDomain}`;
      const finalQrUrl = `${finalOrigin}/?session=${data.sessionToken}`;

      setSessionData({
        ...data,
        qrUrl: finalQrUrl,
      });

      const remaining = Math.max(
        0,
        Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining || 300);

      // Render to canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, finalQrUrl, {
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
  }, [baseDomain]);

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

  const handleApplyCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainInput.trim()) return;
    let formatted = customDomainInput.trim();
    if (!formatted.startsWith("http")) formatted = `https://${formatted}`;
    setBaseDomain(formatted);
    setIsEditingDomain(false);
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

          {/* Active Public URL Display & Domain Customizer */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "10px",
              padding: "10px 14px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <Globe size={12} color="#38bdf8" /> Target Audience Domain:
              </span>
              <button
                onClick={() => {
                  setCustomDomainInput(baseDomain);
                  setIsEditingDomain(!isEditingDomain);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38bdf8",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Edit3 size={11} /> {isEditingDomain ? "Cancel" : "Change Domain"}
              </button>
            </div>

            {isEditingDomain ? (
              <form onSubmit={handleApplyCustomDomain} style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="https://your-domain.trycloudflare.com"
                  style={{
                    flex: 1,
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid #38bdf8",
                    color: "#fff",
                    fontSize: "0.78rem",
                    padding: "6px 8px",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Set
                </button>
              </form>
            ) : (
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#38bdf8",
                  fontWeight: 700,
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                }}
              >
                {baseDomain}
              </span>
            )}
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
              <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
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
