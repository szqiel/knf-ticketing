"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Login failed.");
      router.replace("/admin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Image src="/assets/knf-logo.png" alt="KNF 2026 Mascot" width={48} height={48} priority />
          <div>
            <p className={styles.eyebrow}>KNF 2026 STAFF</p>
            <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Portal Login</h1>
          </div>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#475569" }}>Masuk untuk mengelola tiket, denah kursi, dan CMS festival.</p>
        <label htmlFor="admin-password">Staff Password</label>
        <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in →"}</button>
      </form>
    </main>
  );
}
