"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Armchair,
  Users,
  Film,
  QrCode,
  FileSpreadsheet,
  ExternalLink,
  LogOut,
} from "lucide-react";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch (e) {
      console.error("Logout failed:", e);
      router.replace("/admin/login");
    }
  };

  const navItems = [
    { href: "/admin", label: "Live Operations", icon: Armchair, exact: true },
    { href: "/admin/audience", label: "Audience & Door", icon: Users },
    { href: "/admin/programs", label: "Programs CMS", icon: Film },
    { href: "/admin/qr", label: "Staff Queue QR", icon: QrCode },
    { href: "/admin/reports", label: "Reports & Exports", icon: FileSpreadsheet },
  ];

  return (
    <div className={styles.layoutWrapper}>
      {/* Top Header */}
      <header className={styles.topHeader}>
        <div className={styles.brandGroup}>
          <Image
            src="/assets/knf-logo.png"
            alt="KNF 2026 Mascot"
            width={44}
            height={44}
            className={styles.mascotLogo}
          />
          <div className={styles.titleArea}>
            <p className={styles.eyebrow}>Festival Staff Portal</p>
            <h1 className={styles.mainTitle}>KNF 2026 NIRBATAS</h1>
            <span className={styles.festivalBadge}>17–18 OKTOBER 2026</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Link href="/" target="_blank" className={styles.publicSiteBtn}>
            <ExternalLink size={15} />
            <span>Public Kiosk</span>
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Sign out from admin">
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Navigation Pill Tabs */}
      <nav className={styles.navBar} aria-label="Admin Navigation Tabs">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navPill} ${isActive ? styles.navPillActive : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Page Content Body */}
      <div className={styles.contentContainer}>{children}</div>
    </div>
  );
}
