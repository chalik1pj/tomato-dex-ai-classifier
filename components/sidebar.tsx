"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Scan, BarChart3, ClipboardList, Menu, X } from "lucide-react";

const NAV = [
  { href: "/",              label: "Dasbor",            icon: LayoutDashboard },
  { href: "/dataset",       label: "Dataset",           icon: Database },
  { href: "/detection",     label: "Deteksi AI",        icon: Scan },
  { href: "/visualization", label: "Visualisasi Model", icon: BarChart3 },
  { href: "/results",       label: "Hasil Pengujian",   icon: ClipboardList },
];

const SIDEBAR_W = 268;

export function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [path]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Hamburger toggle button ── */}
      <button
        aria-label={open ? "Tutup navigasi" : "Buka navigasi"}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 14,
          left: 16,
          zIndex: 120,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: open ? "#1a0606" : "#b31b1b",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          transition: "background 0.15s",
        }}
      >
        {open
          ? <X     style={{ width: 18, height: 18, color: "#f3e5ab" }} />
          : <Menu  style={{ width: 18, height: 18, color: "#f3e5ab" }} />
        }
      </button>

      {/* ── Backdrop overlay ── */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(10,0,0,0.45)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside
        aria-label="Navigasi utama"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: SIDEBAR_W,
          height: "100dvh",
          background: "#120505",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          borderRight: "1px solid #1e0808",
          transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      >
        {/* Merek */}
        <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid #1e0808", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "#b31b1b",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 3C12 3 10 1.5 8.5 2.5C8.5 2.5 9.5 4 12 4C14.5 4 15.5 2.5 15.5 2.5C14 1.5 12 3 12 3Z" fill="#fdf8ee"/>
                <circle cx="12" cy="14" r="9" fill="#fdf8ee"/>
                <circle cx="12" cy="14" r="7.5" fill="#c42020"/>
                <ellipse cx="12" cy="13" rx="3" ry="5" fill="#e03535" opacity="0.35"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f3e5ab", lineHeight: 1.2 }}>TomatoDex</p>
              <p style={{ fontSize: 11, color: "#6b3a3a", marginTop: 1 }}>Klasifikasi Kematangan</p>
            </div>
          </div>
          {/* Close button inside drawer (secondary) */}
          <button
            aria-label="Tutup navigasi"
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#4a2020", display: "flex", alignItems: "center" }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Navigasi */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4a2020", padding: "0 8px 8px" }}>
            Navigasi
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? path === "/" : path.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 10px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? "#ffffff" : "#a07060",
                      background: active ? "#b31b1b" : "transparent",
                      textDecoration: "none",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#1e0808";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#f3e5ab";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#a07060";
                      }
                    }}
                  >
                    <Icon style={{ width: 15, height: 15, flexShrink: 0, color: active ? "#fff" : "#6b3a3a" }} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Info Model */}
          <div style={{ borderTop: "1px solid #1e0808", marginTop: 20, paddingTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4a2020", padding: "0 8px 10px" }}>
              Info Model
            </p>
            <div style={{ background: "#1a0606", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                ["Arsitektur",  "InceptionResNetV2"],
                ["Akurasi Uji", "83,9%"],
                ["Akurasi Val", "93,5%"],
                ["Kelas",       "3"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#5a3030" }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: k === "Akurasi Uji" || k === "Akurasi Val" ? "#b31b1b" : "#f3e5ab" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #1e0808" }}>
          <p style={{ fontSize: 11, color: "#3a1818" }}>syafwanchalik/tomatodex</p>
          <p style={{ fontSize: 11, color: "#3a1818", marginTop: 2 }}>2.400 gambar · Kaggle</p>
        </div>
      </aside>
    </>
  );
}
