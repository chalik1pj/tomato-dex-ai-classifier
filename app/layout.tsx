import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TomatoDex – Klasifikasi Kematangan Tomat",
  description:
    "Klasifikasi kematangan tomat berbasis CNN menggunakan transfer learning InceptionResNetV2. Mengklasifikasikan tomat sebagai Matang, Mentah, atau Tidak Layak.",
};

export const viewport: Viewport = {
  themeColor: "#b31b1b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" style={{ height: "100%" }}>
      <body className={`${inter.variable} font-sans`} style={{ minHeight: "100%", background: "#f3e5ab" }}>
        <Sidebar />
        {/* Top-bar — gives the hamburger button a visual home and prevents content hiding beneath it */}
        <header
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            height: 68,
            background: "#f3e5ab",
            borderBottom: "1px solid #d4be72",
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            paddingLeft: 72,
            paddingRight: 24,
            gap: 12,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a0808", letterSpacing: "-0.01em" }}>TomatoDex</span>
          <span style={{ fontSize: 12, color: "#9c7e3a", fontWeight: 500 }}>— Klasifikasi Kematangan Tomat</span>
        </header>
        {/* Main content pushed below the fixed top-bar */}
        <main
          style={{
            paddingTop: 68,
            minHeight: "100vh",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
