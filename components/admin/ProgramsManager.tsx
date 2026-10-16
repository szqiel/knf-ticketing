"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import styles from "./ProgramsManager.module.css";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Upload, RefreshCw } from "lucide-react";

type Program = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  dayLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  posterPath: string | null;
  bookingOpen: boolean;
  isPublished: boolean;
  sortOrder: number;
};

type Film = {
  id: string;
  programId: string;
  title: string;
  director: string | null;
  durationMin: number | null;
  origin: string | null;
  synopsis: string | null;
  posterPath: string | null;
  stillPath: string | null;
  sortOrder: number;
};

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}

export function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [editProgramModal, setEditProgramModal] = useState<Program | null>(null);
  const [filmModal, setFilmModal] = useState<{ mode: "create" | "edit"; film?: Film } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadPrograms = useCallback(async () => {
    try {
      const data = await readJson<{ programs?: Program[] }>("/api/admin/programs");
      const list = Array.isArray(data?.programs) ? data.programs : [];
      setPrograms(list);
      if (!selectedProgramId && list.length > 0) {
        setSelectedProgramId(list[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId]);

  const loadFilms = useCallback(async (progId: string) => {
    if (!progId) return;
    try {
      const data = await readJson<{ films?: Film[] }>(`/api/admin/programs/${progId}/films`);
      setFilms(Array.isArray(data?.films) ? data.films : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load films");
      setFilms([]);
    }
  }, []);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (selectedProgramId) void loadFilms(selectedProgramId);
  }, [selectedProgramId, loadFilms]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  const handleToggleBooking = async (p: Program, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await readJson<{ program: Program }>(`/api/admin/programs/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ bookingOpen: !p.bookingOpen }),
      });
      setPrograms((prev) => prev.map((item) => (item.id === p.id ? updated.program : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle booking");
    }
  };

  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      return data.url as string;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editProgramModal) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      dayLabel: formData.get("dayLabel") as string,
      startsAt: formData.get("startsAt") as string,
      endsAt: formData.get("endsAt") as string,
      posterPath: formData.get("posterPath") as string,
    };

    try {
      const res = await readJson<{ program: Program }>(`/api/admin/programs/${editProgramModal.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setPrograms((prev) => prev.map((p) => (p.id === res.program.id ? res.program : p)));
      setEditProgramModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update program");
    }
  };

  const handleSaveFilm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!filmModal || !selectedProgramId) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      director: formData.get("director") as string,
      durationMin: Number(formData.get("durationMin")) || null,
      origin: formData.get("origin") as string,
      synopsis: formData.get("synopsis") as string,
      stillPath: formData.get("stillPath") as string,
    };

    try {
      if (filmModal.mode === "create") {
        await readJson(`/api/admin/programs/${selectedProgramId}/films`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else if (filmModal.film) {
        await readJson(`/api/admin/films/${filmModal.film.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      setFilmModal(null);
      await loadFilms(selectedProgramId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save film");
    }
  };

  const handleDeleteFilm = async (film: Film) => {
    if (!confirm(`Delete film "${film.title}"?`)) return;
    try {
      await readJson(`/api/admin/films/${film.id}`, { method: "DELETE" });
      await loadFilms(selectedProgramId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete film");
    }
  };

  const handleMoveFilm = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= films.length) return;

    const reordered = [...films];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setFilms(reordered);
    try {
      await readJson(`/api/admin/programs/${selectedProgramId}/films/reorder`, {
        method: "PUT",
        body: JSON.stringify({ filmIds: reordered.map((f) => f.id) }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder films");
      await loadFilms(selectedProgramId);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.pageWrapper}>
        {error && <div style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", padding: 12, borderRadius: 8 }}>{error}</div>}

        {/* Top Title */}
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <h2>Programs & Film Lineup CMS</h2>
            <p>Manage program descriptions, screening times, 1-click booking open/close, and film lineups.</p>
          </div>
          <button
            onClick={() => void loadPrograms()}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#e2e8f0",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* 8 Programs Grid */}
        <div className={styles.programsGrid}>
          {programs.map((p) => {
            const isSelected = p.id === selectedProgramId;
            return (
              <div
                key={p.id}
                className={`${styles.programCard} ${isSelected ? styles.cardActive : ""}`}
                onClick={() => setSelectedProgramId(p.id)}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.programTitle}>{p.title}</h3>
                    {p.subtitle && <p className={styles.programSubtitle}>{p.subtitle}</p>}
                  </div>
                  <span
                    className={`${styles.statusPill} ${p.bookingOpen ? styles.statusOpen : styles.statusClosed}`}
                    onClick={(e) => handleToggleBooking(p, e)}
                    title="Click to toggle booking state"
                  >
                    {p.bookingOpen ? "OPEN" : "CLOSED"}
                  </span>
                </div>

                <div className={styles.programMeta}>
                  <span>{p.dayLabel ?? "Festival"}</span>
                  <span>•</span>
                  <span>
                    {p.startsAt ? p.startsAt.slice(0, 5) : "--:--"} — {p.endsAt ? p.endsAt.slice(0, 5) : "--:--"}
                  </span>
                </div>

                <div className={styles.cardFooter}>
                  <span>{isSelected ? "● Viewing Lineup" : "Click to view films"}</span>
                  <button
                    className={styles.editProgramBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditProgramModal(p);
                    }}
                  >
                    <Edit2 size={12} style={{ display: "inline", marginRight: 3 }} /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Program Film Lineup */}
        {selectedProgram && (
          <section className={styles.detailSection}>
            <div className={styles.detailHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#ffffff" }}>
                  Film Lineup: {selectedProgram.title} {selectedProgram.subtitle ? `(${selectedProgram.subtitle})` : ""}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
                  {films.length} short film{films.length === 1 ? "" : "s"} scheduled in this session.
                </p>
              </div>
              <button
                className={styles.addFilmBtn}
                onClick={() => setFilmModal({ mode: "create" })}
              >
                <Plus size={16} /> Add Film
              </button>
            </div>

            <div className={styles.filmList}>
              {films.map((film, index) => (
                <div key={film.id} className={styles.filmCard}>
                  <div className={styles.filmInfo}>
                    <div className={styles.filmOrderBadge}>{index + 1}</div>
                    <div className={styles.filmText}>
                      <h4>{film.title}</h4>
                      <p>
                        {film.director ? `Dir: ${film.director}` : "Director unlisted"} •{" "}
                        {film.durationMin ? `${film.durationMin} mins` : "Duration unlisted"}
                        {film.origin ? ` • ${film.origin}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className={styles.filmActions}>
                    <button
                      className={styles.actionIconBtn}
                      disabled={index === 0}
                      onClick={() => void handleMoveFilm(index, "up")}
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      className={styles.actionIconBtn}
                      disabled={index === films.length - 1}
                      onClick={() => void handleMoveFilm(index, "down")}
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      className={styles.actionIconBtn}
                      onClick={() => setFilmModal({ mode: "edit", film })}
                      title="Edit film"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={styles.actionIconBtn}
                      style={{ color: "#f87171" }}
                      onClick={() => void handleDeleteFilm(film)}
                      title="Delete film"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {films.length === 0 && (
                <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>
                  No films added to this program yet. Click "+ Add Film" to create one.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Edit Program Modal */}
        {editProgramModal && (
          <div className={styles.modalBackdrop} onClick={() => setEditProgramModal(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>Edit Program Details</h3>
              <form onSubmit={handleSaveProgram} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className={styles.formGroup}>
                  <label>Program Title:</label>
                  <input
                    name="title"
                    defaultValue={editProgramModal.title}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Subtitle / Curatorial Theme:</label>
                  <input
                    name="subtitle"
                    defaultValue={editProgramModal.subtitle ?? ""}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Day Label (e.g. Sabtu / Minggu):</label>
                  <input
                    name="dayLabel"
                    defaultValue={editProgramModal.dayLabel ?? "Sabtu"}
                    className={styles.formInput}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label>Starts At (HH:MM:SS):</label>
                    <input
                      name="startsAt"
                      defaultValue={editProgramModal.startsAt ?? "10:00:00"}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ends At (HH:MM:SS):</label>
                    <input
                      name="endsAt"
                      defaultValue={editProgramModal.endsAt ?? "12:00:00"}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description:</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editProgramModal.description ?? ""}
                    className={styles.formTextarea}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Poster Image URL:</label>
                  <input
                    name="posterPath"
                    id="program-poster-input"
                    defaultValue={editProgramModal.posterPath ?? ""}
                    className={styles.formInput}
                  />
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.78rem",
                      color: "#38bdf8",
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    <Upload size={13} /> {isUploading ? "Uploading..." : "Upload New Poster (WebP)"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await handleUploadImage(file);
                        const input = document.getElementById("program-poster-input") as HTMLInputElement;
                        if (input) input.value = url;
                      }}
                    />
                  </label>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setEditProgramModal(null)}
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.addFilmBtn}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Film Modal */}
        {filmModal && (
          <div className={styles.modalBackdrop} onClick={() => setFilmModal(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>{filmModal.mode === "create" ? "Add Film to Lineup" : "Edit Film"}</h3>
              <form onSubmit={handleSaveFilm} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className={styles.formGroup}>
                  <label>Film Title:</label>
                  <input
                    name="title"
                    defaultValue={filmModal.film?.title ?? ""}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label>Director:</label>
                    <input
                      name="director"
                      defaultValue={filmModal.film?.director ?? ""}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Duration (mins):</label>
                    <input
                      name="durationMin"
                      type="number"
                      defaultValue={filmModal.film?.durationMin ?? 15}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Origin / Production:</label>
                  <input
                    name="origin"
                    defaultValue={filmModal.film?.origin ?? "Indonesia"}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Synopsis:</label>
                  <textarea
                    name="synopsis"
                    rows={3}
                    defaultValue={filmModal.film?.synopsis ?? ""}
                    className={styles.formTextarea}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Film Still URL:</label>
                  <input
                    name="stillPath"
                    id="film-still-input"
                    defaultValue={filmModal.film?.stillPath ?? ""}
                    className={styles.formInput}
                  />
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.78rem",
                      color: "#38bdf8",
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    <Upload size={13} /> {isUploading ? "Uploading..." : "Upload Still Image (WebP)"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await handleUploadImage(file);
                        const input = document.getElementById("film-still-input") as HTMLInputElement;
                        if (input) input.value = url;
                      }}
                    />
                  </label>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setFilmModal(null)}
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.addFilmBtn}
                  >
                    {filmModal.mode === "create" ? "Add to Lineup" : "Update Film"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
