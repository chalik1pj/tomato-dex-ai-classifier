"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TRAINING_HISTORY, MODEL_ARCHITECTURE, MODEL_CONFIG } from "@/lib/model-data";
import { BarChart3, Layers, Settings } from "lucide-react";
import { PageShell, PageHeader, Card, CardHeader, StatCard } from "@/components/ui-kit";

const TOOLTIP_STYLE = {
  background: "#fffef8",
  border: "1px solid #e0cc7a",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string; name: string }[]; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fffef8", border: "1px solid #e0cc7a", borderRadius: 8, padding: "10px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
      <p style={{ fontWeight: 700, color: "#1a0808", marginBottom: 6 }}>Epoch {label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#1a0808" }}>{p.value.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

const X_TICKS = [1, 10, 20, 30, 40, 50];

export default function VisualizationPage() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const final = TRAINING_HISTORY[TRAINING_HISTORY.length - 1];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Analisis Pelatihan"
        title="Visualisasi Model"
        description={
          <>
            Riwayat pelatihan selama <strong>50 epoch</strong> dengan Adam (lr = 0,0001) dan batch size 32.
            Basis InceptionResNetV2 dibekukan — hanya kepala kustom yang dilatih.
          </>
        }
      />

      {/* Statistik epoch */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="Akurasi Latih Akhir" value={`${(final.accuracy * 100).toFixed(2)}%`}     sub="Epoch 50 / 50"        accent="red" />
        <StatCard label="Akurasi Val Akhir"   value={`${(final.val_accuracy * 100).toFixed(2)}%`} sub="Epoch 50 / 50"        accent="amber" />
        <StatCard label="Loss Latih Akhir"    value={final.loss.toFixed(4)}                        sub="Cat. Cross-Entropy"   accent="green" />
        <StatCard label="Loss Val Akhir"      value={final.val_loss.toFixed(4)}                    sub="Epoch 50 / 50"        accent="neutral" />
      </div>

      {/* Grafik akurasi */}
      <Card>
        <CardHeader icon={BarChart3} title="Akurasi Pelatihan & Validasi" subtitle="50 epoch · Adam lr = 0,0001" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={TRAINING_HISTORY} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ede5c0" vertical={false} />
            <XAxis dataKey="epoch" ticks={X_TICKS} tick={{ fontSize: 11, fill: "#9c7e3a" }} axisLine={false} tickLine={false}
              label={{ value: "Epoch", position: "insideBottom", offset: -12, fontSize: 11, fill: "#9c7e3a" }} />
            <YAxis domain={[0.55, 1.0]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "#9c7e3a" }} axisLine={false} tickLine={false} width={46} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="accuracy"     name="Akurasi Latih" stroke="#b31b1b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#b31b1b" }} />
            <Line type="monotone" dataKey="val_accuracy" name="Akurasi Val"   stroke="#c17c14" strokeWidth={2} dot={false} strokeDasharray="6 3" activeDot={{ r: 4, fill: "#c17c14" }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, fontSize: 11, color: "#9c7e3a", marginTop: 4 }}>
          <span>Latih: 61,1% &rarr; 93,5%</span>
          <span>Val: 63,1% &rarr; 84,7%</span>
        </div>
      </Card>

      {/* Grafik loss */}
      <Card>
        <CardHeader icon={BarChart3} title="Loss Pelatihan & Validasi" subtitle="Categorical Cross-Entropy · 50 epoch" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={TRAINING_HISTORY} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ede5c0" vertical={false} />
            <XAxis dataKey="epoch" ticks={X_TICKS} tick={{ fontSize: 11, fill: "#9c7e3a" }} axisLine={false} tickLine={false}
              label={{ value: "Epoch", position: "insideBottom", offset: -12, fontSize: 11, fill: "#9c7e3a" }} />
            <YAxis domain={[0.1, 1.0]} tick={{ fontSize: 11, fill: "#9c7e3a" }} axisLine={false} tickLine={false} width={46} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="loss"     name="Loss Latih" stroke="#b31b1b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#b31b1b" }} />
            <Line type="monotone" dataKey="val_loss" name="Loss Val"   stroke="#c17c14" strokeWidth={2} dot={false} strokeDasharray="6 3" activeDot={{ r: 4, fill: "#c17c14" }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, fontSize: 11, color: "#9c7e3a", marginTop: 4 }}>
          <span>Latih: 0,8617 &rarr; 0,1776</span>
          <span>Val: 0,7624 &rarr; 0,3527</span>
        </div>
      </Card>

      {/* Lapisan arsitektur */}
      <Card>
        <CardHeader icon={Layers} title="Arsitektur Model" subtitle="InceptionResNetV2 + Kepala Klasifikasi Kustom" />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {MODEL_ARCHITECTURE.map((layer, i) => {
            const isActive = hoveredLayer === i;
            const isFrozen = layer.trainable === false;
            return (
              <div key={layer.layer}>
                {i > 0 && (
                  <div style={{ paddingLeft: 20 }}>
                    <div style={{ width: 1, height: 10, background: "#d4be72", marginLeft: 10 }} />
                  </div>
                )}
                <div
                  onMouseEnter={() => setHoveredLayer(i)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  style={{
                    borderRadius: 10, border: `1px solid ${isActive ? "#b31b1b" : "#e0cc7a"}`,
                    padding: "14px 16px",
                    background: isActive ? "#fff8f0" : isFrozen ? "#fdf8ee" : "#fffef8",
                    cursor: "default",
                    transition: "border-color 0.1s, background 0.1s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: isFrozen ? "#f0e8c4" : "#b31b1b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        color: isFrozen ? "#9c7e3a" : "#fff",
                        flexShrink: 0,
                      }}>{i + 1}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1a0808", lineHeight: 1.2 }}>{layer.layer}</p>
                        <p style={{ fontSize: 11, color: "#9c7e3a", marginTop: 2 }}>{layer.type}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      <div>
                        <p style={{ fontSize: 10, color: "#b8a058", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Bentuk Output</p>
                        <p style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#1a0808" }}>{layer.outputShape}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: "#b8a058", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Parameter</p>
                        <p style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#1a0808" }}>{layer.params.toLocaleString("id-ID")}</p>
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700,
                        padding: "3px 10px", borderRadius: 99,
                        background: isFrozen ? "#f0e8c4" : "#b31b1b",
                        color: isFrozen ? "#9c7e3a" : "#fff",
                      }}>{isFrozen ? "Dibekukan" : layer.layer !== "Input" ? "Dapat Dilatih" : ""}</span>
                    </div>
                  </div>
                  {isActive && (
                    <p style={{ fontSize: 12, color: "#6b4f1e", marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0e5be", lineHeight: 1.5 }}>
                      {layer.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ringkasan parameter */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            { label: "Total Parameter", value: "55,9 Juta", note: "213,3 MB", color: "#1a0808" },
            { label: "Dapat Dilatih",   value: "1,58 Juta", note: "6,02 MB",  color: "#b31b1b" },
            { label: "Tidak Dilatih",   value: "54,3 Juta", note: "207,3 MB", color: "#6b4f1e" },
          ].map(({ label, value, note, color }) => (
            <div key={label} style={{ textAlign: "center", background: "#fdf5e4", border: "1px solid #e8d898", borderRadius: 10, padding: "14px 8px" }}>
              <p style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 11, color: "#9c7e3a" }}>{label}</p>
              <p style={{ fontSize: 10.5, fontFamily: "monospace", color: "#b8a058", marginTop: 3 }}>{note}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Konfigurasi pelatihan */}
      <Card>
        <CardHeader icon={Settings} title="Konfigurasi Pelatihan" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {([
            ["Optimizer",        MODEL_CONFIG.optimizer],
            ["Learning Rate",    MODEL_CONFIG.learningRate.toString()],
            ["Fungsi Kerugian",  "Categorical Cross-Entropy"],
            ["Epoch",            MODEL_CONFIG.epochs.toString()],
            ["Batch Size",       MODEL_CONFIG.batchSize.toString()],
            ["Random Seed",      MODEL_CONFIG.randomSeed.toString()],
            ["Normalisasi",      MODEL_CONFIG.normalization],
            ["Framework",        "TensorFlow 2.19.0"],
            ["Basis Dibekukan",  "Ya (transfer learning)"],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} style={{ borderRadius: 8, border: "1px solid #e8d898", background: "#fdf8ee", padding: "12px 14px" }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8a058", marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1a0808" }}>{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
