"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./PurgeConfirmModal.module.css";

interface ProgramOption {
  id: string;
  title: string;
}

interface PurgeConfirmModalProps {
  isOpen: boolean;
  programs: ProgramOption[];
  onClose: () => void;
  onConfirm: (programId?: string) => Promise<void>;
}

export function PurgeConfirmModal({ isOpen, programs, onClose, onConfirm }: PurgeConfirmModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("all");
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isConfirmed = typedConfirmation.trim().toUpperCase() === "DELETE";

  const handleExecute = async () => {
    if (!isConfirmed) return;
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(selectedTarget === "all" ? undefined : selectedTarget);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to purge bookings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <AlertTriangle size={20} color="#ef4444" />
          <h3>Purge Demo / Test Bookings</h3>
        </div>

        <div className={styles.body}>
          <div className={styles.warningBox}>
            <strong>Warning:</strong> This permanently deletes booking and reservation records from the PostgreSQL
            database. Seats will be reset to available immediately.
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="purge-scope">Select Purge Scope:</label>
            <select
              id="purge-scope"
              className={styles.select}
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="all">⚡ All Programs (Entire Festival Reset)</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (Selected Program Only)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirm-input">Type "DELETE" to confirm:</label>
            <input
              id="confirm-input"
              type="text"
              placeholder="DELETE"
              className={styles.input}
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && <p style={{ color: "#f87171", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className={styles.dangerBtn}
            onClick={handleExecute}
            disabled={!isConfirmed || isSubmitting}
          >
            {isSubmitting ? "Purging..." : "Permanently Purge Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
