import type { ReactNode, ComponentType } from "react";

// ─── Page shell ────────────────────────────────────────────────────────────────
// Wraps all page content with consistent padding and max-width

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: "clamp(20px, 3vw, 36px) clamp(16px, 3vw, 40px) 56px", width: "100%" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Page header ───────────────────────────────────────────────────────────────

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: "1px solid #d4be72" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 3, height: 16, borderRadius: 99, background: "#b31b1b", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b31b1b" }}>
          {eyebrow}
        </span>
      </div>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1a0808", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
        {title}
      </h1>
      {description && (
        <p style={{ marginTop: 10, fontSize: 13.5, color: "#6b4f1e", lineHeight: 1.65, maxWidth: 640 }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  noPad,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        background: "#fffef8",
        border: "1px solid #e0cc7a",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        padding: noPad ? 0 : 24,
        overflow: noPad ? "hidden" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Card header ───────────────────────────────────────────────────────────────

export function CardHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "#b31b1b",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
        )}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a0808", lineHeight: 1.2 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 11, color: "#9c7e3a", marginTop: 3 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  accent = "red",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "red" | "amber" | "green" | "neutral";
}) {
  const colors = {
    red:     "#b31b1b",
    amber:   "#a05c00",
    green:   "#1a6020",
    neutral: "#1a0808",
  };
  return (
    <div style={{
      background: "#fffef8",
      border: "1px solid #e0cc7a",
      borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      padding: "20px 22px",
    }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.11em", color: "#9c7e3a", marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: colors[accent], letterSpacing: "-0.02em" }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: "#9c7e3a", marginTop: 6 }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9c7e3a", marginBottom: 12 }}>
      {children}
    </p>
  );
}
