"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

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
        <p className={styles.eyebrow}>KNF26 STAFF</p>
        <h1>Admin login</h1>
        <p>Masuk untuk mengelola kursi dan audience booking.</p>
        <label htmlFor="admin-password">Shared password</label>
        <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in →"}</button>
      </form>
    </main>
  );
}
