"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { CONFUSION_MATRIX, TEST_METRICS, MODEL_CONFIG } from "@/lib/model-data";
import { ClipboardList, Target, BarChart3 } from "lucide-react";
import { PageShell, PageHeader, Card, CardHeader, StatCard } from "@/components/ui-kit";

const CLASS_NAMES  = MODEL_CONFIG.classNames;
const CLASS_COLORS = ["#b31b1b", "#c17c14", "#2d7a2d"] as const;

const TOOLTIP_STYLE = {
  background: "#fffef8", border: "1px solid #e0cc7a",
  borderRadius: 8, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
};

function normalizeRow(row: number[]): number[] {
  const sum = row.reduce((a, b) => a + b, 0);
  return row.map((v) => parseFloat(((v / sum) * 100).toFixed(1)));
}
const NORM_CM = CONFUSION_MATRIX.map(normalizeRow);

function getCellColor(value: number): string {
  const t = value / 100;
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${lerp(253, 179)},${lerp(245, 27)},${lerp(208, 27)})`;
}

const PER_CLASS_DATA = CLASS_NAMES.map((cls) => {
  const m = TEST_METRICS.perClass[cls];
  return { class: cls, Presisi: +(m.precision * 100).toFixed(1), Recall: +(m.recall * 100).toFixed(1), F1: +(m.f1 * 100).toFixed(1) };
});

const RADAR_DATA = CLASS_NAMES.map((cls) => {
  const m = TEST_METRICS.perClass[cls];
  return { class: cls, Presisi: +(m.precision * 100).toFixed(1), Recall: +(m.recall * 100).toFixed(1), "F1-Score": +(m.f1 * 100).toFixed(1) };
});

export default function ResultsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Evaluasi"
        title="Hasil Pengujian"
        description={
          <>
            Evaluasi pada <strong>{TEST_METRICS.totalTestSamples} sampel uji yang ditahan</strong> (15% dari dataset).
            Semua metrik sesuai dengan output notebook penelitian.
          </>
        }
      />

      {/* Statistik ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="Akurasi Keseluruhan" value={`${(TEST_METRICS.overallAccuracy * 100).toFixed(1)}%`} accent="red" />
        <StatCard label="Rata-rata Makro F1"  value={`${(TEST_METRICS.macroAvgF1 * 100).toFixed(1)}%`}     accent="amber" />
        <StatCard label="F1 Berbobot"         value={`${(TEST_METRICS.weightedAvgF1 * 100).toFixed(1)}%`}  accent="green" />
        <StatCard label="Sampel Uji"          value={TEST_METRICS.totalTestSamples.toString()}             accent="neutral" />
      </div>

      {/* Confusion matrix */}
      <Card>
        <CardHeader icon={Target} title="Confusion Matrix" subtitle="Dinormalisasi (%) — Baris = Aktual · Kolom = Prediksi" />
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 500 }}>
            {/* Header kolom */}
            <div style={{ display: "flex", marginLeft: 120, marginBottom: 8 }}>
              {CLASS_NAMES.map((cls) => (
                <div key={cls} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9c7e3a", padding: "0 6px" }}>
                  Prediksi: {cls}
                </div>
              ))}
            </div>
            {/* Baris */}
            {CONFUSION_MATRIX.map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "stretch", marginBottom: 10 }}>
                <div style={{ width: 120, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9c7e3a", textAlign: "right", lineHeight: 1.3 }}>
                    Aktual: <span style={{ color: "#1a0808" }}>{CLASS_NAMES[i]}</span>
                  </span>
                </div>
                {row.map((rawVal, j) => {
                  const pct = NORM_CM[i][j];
                  const isDiag = i === j;
                  const lightText = pct > 55;
                  return (
                    <div
                      key={j}
                      style={{
                        flex: 1, margin: "0 5px", borderRadius: 10,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "20px 8px", cursor: "default", userSelect: "none",
                        background: getCellColor(pct),
                        color: lightText ? "#fff" : "#1a0808",
                        border: isDiag ? "2px solid #b31b1b" : "1px solid #d4be72",
                        minHeight: 80,
                      }}
                    >
                      <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{rawVal}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{pct}%</span>
                      {isDiag && <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3, opacity: 0.7, fontWeight: 600 }}>Benar</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Rincian diagonal per kelas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 20 }}>
          {CLASS_NAMES.map((cls, i) => {
            const pct = NORM_CM[i][i];
            const color = CLASS_COLORS[i];
            return (
              <div key={cls} style={{ borderRadius: 10, padding: "12px 14px", textAlign: "center", background: `${color}12`, border: `1px solid ${color}30` }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9c7e3a", marginBottom: 4 }}>{cls}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{pct}%</p>
                <p style={{ fontSize: 10.5, color: "#9c7e3a" }}>diklasifikasi dengan benar</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Laporan klasifikasi */}
      <Card>
        <CardHeader icon={ClipboardList} title="Laporan Klasifikasi" subtitle="Presisi · Recall · F1-Score per kelas" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0cc7a" }}>
              {["Kelas", "Presisi", "Recall", "F1-Score", "Support"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 0", paddingRight: 24, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9c7e3a", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLASS_NAMES.map((cls, i) => {
              const m = TEST_METRICS.perClass[cls];
              const color = CLASS_COLORS[i];
              const MiniBar = ({ val }: { val: number }) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 56, height: 5, background: "#f0e8c4", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${val * 100}%`, background: color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#1a0808", fontSize: 12 }}>{val.toFixed(4)}</span>
                </div>
              );
              return (
                <tr key={cls} style={{ borderBottom: "1px solid #f0e5be" }}>
                  <td style={{ padding: "11px 0", paddingRight: 24, fontWeight: 700, color }}>{cls}</td>
                  <td style={{ padding: "11px 0", paddingRight: 24 }}><MiniBar val={m.precision} /></td>
                  <td style={{ padding: "11px 0", paddingRight: 24 }}><MiniBar val={m.recall} /></td>
                  <td style={{ padding: "11px 0", paddingRight: 24 }}><MiniBar val={m.f1} /></td>
                  <td style={{ padding: "11px 0", paddingRight: 24, fontFamily: "monospace", fontWeight: 600, fontSize: 13, color: "#1a0808" }}>{m.support}</td>
                </tr>
              );
            })}
            {/* Rata-rata makro */}
            <tr style={{ borderTop: "2px solid #e0cc7a", background: "#fdf8ee" }}>
              <td style={{ padding: "9px 0", paddingRight: 24, fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", color: "#1a0808" }}>Rata-rata Makro</td>
              {[
                ((TEST_METRICS.perClass.Matang.precision + TEST_METRICS.perClass.Mentah.precision + TEST_METRICS.perClass["Tidak Layak"].precision) / 3).toFixed(4),
                ((TEST_METRICS.perClass.Matang.recall    + TEST_METRICS.perClass.Mentah.recall    + TEST_METRICS.perClass["Tidak Layak"].recall)    / 3).toFixed(4),
                TEST_METRICS.macroAvgF1.toFixed(4),
              ].map((v, vi) => (
                <td key={vi} style={{ padding: "9px 0", paddingRight: 24, fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: vi === 2 ? "#b31b1b" : "#1a0808" }}>{v}</td>
              ))}
              <td style={{ padding: "9px 0", paddingRight: 24, fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#1a0808" }}>{TEST_METRICS.totalTestSamples}</td>
            </tr>
            {/* Akurasi */}
            <tr style={{ background: "#fdf8ee" }}>
              <td style={{ padding: "9px 0", paddingRight: 24, fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", color: "#1a0808" }}>Akurasi</td>
              <td colSpan={3} style={{ padding: "9px 0", paddingRight: 24, fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#b31b1b" }}>{TEST_METRICS.overallAccuracy.toFixed(4)}</td>
              <td style={{ padding: "9px 0", paddingRight: 24, fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#1a0808" }}>{TEST_METRICS.totalTestSamples}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Baris grafik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <Card>
          <CardHeader icon={BarChart3} title="Metrik per Kelas" subtitle="Presisi · Recall · F1-Score (%)" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={PER_CLASS_DATA} margin={{ top: 4, right: 8, left: -4, bottom: 4 }} barSize={16} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#ede5c0" vertical={false} />
              <XAxis dataKey="class" tick={{ fontSize: 11, fill: "#6b4f1e" }} axisLine={false} tickLine={false} />
              <YAxis domain={[65, 105]} tick={{ fontSize: 11, fill: "#9c7e3a" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Presisi" fill="#b31b1b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Recall"  fill="#c17c14" radius={[3, 3, 0, 0]} />
              <Bar dataKey="F1"      fill="#2d7a2d" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader icon={Target} title="Radar Performa Kelas" subtitle="Presisi · Recall · F1 per kelas (%)" />
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#ede5c0" />
              <PolarAngleAxis dataKey="class" tick={{ fontSize: 11, fill: "#6b4f1e" }} />
              <Radar name="Presisi"  dataKey="Presisi"  stroke="#b31b1b" fill="#b31b1b" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Recall"   dataKey="Recall"   stroke="#c17c14" fill="#c17c14" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="F1-Score" dataKey="F1-Score" stroke="#2d7a2d" fill="#2d7a2d" fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Confusion matrix mentah */}
      <Card>
        <CardHeader icon={ClipboardList} title="Confusion Matrix – Jumlah Mentah" subtitle="Jumlah aktual × prediksi per sel" />
        <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e0cc7a" }}>
              <th style={{ textAlign: "left", padding: "8px 0", paddingRight: 28, fontSize: 11, color: "#9c7e3a", fontWeight: 600, fontFamily: "monospace" }}>Aktual \ Prediksi</th>
              {CLASS_NAMES.map((cls) => (
                <th key={cls} style={{ textAlign: "center", padding: "8px 0", paddingRight: 28, fontSize: 11, color: "#9c7e3a", fontWeight: 600 }}>{cls}</th>
              ))}
              <th style={{ textAlign: "center", padding: "8px 0", fontSize: 11, color: "#9c7e3a", fontWeight: 600 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {CONFUSION_MATRIX.map((row, i) => {
              const rowTotal = row.reduce((a, b) => a + b, 0);
              const color = CLASS_COLORS[i];
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f0e5be" }}>
                  <td style={{ padding: "11px 0", paddingRight: 28, fontWeight: 700, color, fontFamily: "monospace" }}>{CLASS_NAMES[i]}</td>
                  {row.map((val, j) => (
                    <td key={j} style={{ textAlign: "center", padding: "11px 0", paddingRight: 28, fontWeight: i === j ? 800 : 500, fontSize: i === j ? 15 : 14, color: i === j ? "#b31b1b" : "#6b4f1e", fontFamily: "monospace" }}>{val}</td>
                  ))}
                  <td style={{ textAlign: "center", padding: "11px 0", fontWeight: 600, fontSize: 12, color: "#9c7e3a", fontFamily: "monospace" }}>{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: 11, color: "#b8a058", marginTop: 12 }}>Nilai merah tebal pada diagonal menunjukkan prediksi yang benar.</p>
      </Card>
    </PageShell>
  );
}
