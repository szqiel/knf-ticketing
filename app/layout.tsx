import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNF26 - Festival Programs & Ticketing",
  description:
    "Official ticketing and festival program showcase for KNF26 film festival",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full m-0 p-0">{children}</body>
    </html>
  );
}
