"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { DATASET_CONFIG, MODEL_CONFIG } from "@/lib/model-data";
import { Database, ImageIcon, Shuffle } from "lucide-react";
import { PageShell, PageHeader, Card, CardHeader, StatCard } from "@/components/ui-kit";

const CLASS_COLORS = ["#b31b1b", "#c17c14", "#2d7a2d"] as const;

// Data nyata dari notebook: 800 gambar per kelas (seimbang sempurna)
const PIE_DATA = [
  { name: "Matang (Ripe)",        value: 800, color: "#b31b1b" },
  { name: "Mentah (Unripe)",      value: 800, color: "#c17c14" },
  { name: "Tidak Layak (Unfit)",  value: 800, color: "#2d7a2d" },
];

// Stratified split: train 70% / val 15% / test 15%, per kelas 560/120/120
const SPLIT_DATA = [
  { split: "Latih", Matang: 560, Mentah: 560, "Tidak Layak": 560 },
  { split: "Val",   Matang: 120, Mentah: 120, "Tidak Layak": 120 },
  { split: "Uji",   Matang: 120, Mentah: 120, "Tidak Layak": 120 },
];

const TOOLTIP_STYLE = {
  background: "#fffef8",
  border: "1px solid #e0cc7a",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
};

const PREPROCESSING = [
  { n: "01", title: "Pemuatan Gambar",      desc: "Gambar dimuat dari Kaggle (syafwanchalik/tomatodex) dengan variasi pencahayaan dan lingkungan nyata." },
  { n: "02", title: "Ubah Ukuran 224 × 224", desc: "Semua gambar diubah ukurannya agar sesuai dengan dimensi input yang dibutuhkan InceptionResNetV2." },
  { n: "03", title: "Normalisasi",          desc: "Nilai piksel dibagi 255 untuk menormalisasi dari [0, 255] menjadi float32 [0, 1]." },
  { n: "04", title: "Pembagian Berstrata",  desc: "Dataset dibagi Latih 70% / Validasi 15% / Uji 15% dengan stratifikasi dan random seed = 24." },
];

// Setiap kelas memiliki 800 gambar — distribusi seimbang sempurna (33,3% masing-masing)
const CLASS_TABLE = [
  { cls: "Matang",      eng: "Ripe",   color: "#b31b1b", total: 800, train: 560, val: 120, test: 120, pct: 33 },
  { cls: "Mentah",      eng: "Unripe", color: "#c17c14", total: 800, train: 560, val: 120, test: 120, pct: 33 },
  { cls: "Tidak Layak", eng: "Unfit",  color: "#2d7a2d", total: 800, train: 560, val: 120, test: 120, pct: 33 },
];

export default function DatasetPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Eksplorasi Data"
        title="Ringkasan Dataset"
        description={
          <>
            <strong>2.400 gambar tomat</strong> dalam 3 kelas kematangan dari Kaggle (
            {DATASET_CONFIG.source}), distribusi seimbang sempurna (800 per kelas).
          </>
        }
      />

      {/* Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="Total Gambar"   value="2.400" accent="red" />
        <StatCard label="Kelas"          value="3"     sub="800 per kelas" accent="neutral" />
        <StatCard label="Gambar Latih"   value="1.680" sub="Pembagian 70%" accent="green" />
        <StatCard label="Gambar Uji"     value="360"   sub="Pembagian 15%" accent="amber" />
      </div>

      {/* Baris grafik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>

        {/* Diagram lingkaran */}
        <Card>
          <CardHeader icon={ImageIcon} title="Distribusi Kelas" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%" cy="50%"
                outerRadius={88} innerRadius={42}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine
              >
                {PIE_DATA.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v.toLocaleString("id-ID")} gambar`]} contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            {PIE_DATA.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "#6b4f1e" }}>{d.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Diagram batang bertumpuk */}
        <Card>
          <CardHeader icon={Database} title="Pembagian Latih / Validasi / Uji" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SPLIT_DATA} margin={{ top: 4, right: 8, left: -12, bottom: 4 }} barSize={36} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="#ede5c0" vertical={false} />
              <XAxis dataKey="split" tick={{ fontSize: 12, fill: "#6b4f1e" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9c7e3a" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar dataKey="Matang"       stackId="a" fill="#b31b1b" name="Matang (Ripe)"         radius={[0,0,0,0]} />
              <Bar dataKey="Mentah"       stackId="a" fill="#c17c14" name="Mentah (Unripe)" />
              <Bar dataKey="Tidak Layak"  stackId="a" fill="#2d7a2d" name="Tidak Layak (Unfit)"   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabel detail kelas */}
      <Card>
        <CardHeader title="Detail Kelas" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0cc7a" }}>
              {["Kelas", "Bahasa Inggris", "Total", "Latih", "Validasi", "Uji", "Proporsi"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 0", paddingRight: 20, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9c7e3a", fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLASS_TABLE.map(({ cls, eng, color, total, train, val, test, pct }) => (
              <tr key={cls} style={{ borderBottom: "1px solid #f0e5be" }}>
                <td style={{ padding: "10px 0", paddingRight: 20, fontWeight: 700, color }}>{cls}</td>
                <td style={{ padding: "10px 0", paddingRight: 20, color: "#6b4f1e" }}>{eng}</td>
                <td style={{ padding: "10px 0", paddingRight: 20, fontWeight: 700, color: "#1a0808" }}>{total.toLocaleString("id-ID")}</td>
                <td style={{ padding: "10px 0", paddingRight: 20, color: "#6b4f1e" }}>{train}</td>
                <td style={{ padding: "10px 0", paddingRight: 20, color: "#6b4f1e" }}>{val}</td>
                <td style={{ padding: "10px 0", paddingRight: 20, color: "#6b4f1e" }}>{test}</td>
                <td style={{ padding: "10px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 56, height: 6, background: "#f0e5be", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct * 2}%`, background: color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr style={{ background: "#fdf5e4" }}>
              <td colSpan={2} style={{ padding: "9px 0", paddingRight: 20, fontWeight: 700, color: "#1a0808" }}>Total</td>
              {["2.400", "1.680", "360", "360", "100%"].map((v) => (
                <td key={v} style={{ padding: "9px 0", paddingRight: 20, fontWeight: 700, color: "#1a0808" }}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Pra-pemrosesan + Augmentasi */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <Card>
          <CardHeader icon={ImageIcon} title="Pipeline Pra-pemrosesan" />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {PREPROCESSING.map(({ n, title, desc }) => (
              <div key={n} style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#b31b1b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: 1 }}>{n}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1a0808" }}>{title}</p>
                  <p style={{ fontSize: 11.5, color: "#6b4f1e", marginTop: 3, lineHeight: 1.55 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, borderRadius: 8, background: "#f5eccc", border: "1px solid #d4be72", padding: "10px 14px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9c7e3a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tensor input</p>
            <p style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#1a0808", marginTop: 4 }}>
              (None, {MODEL_CONFIG.inputSize}, {MODEL_CONFIG.inputSize}, 3) &middot; float32 [0, 1]
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader icon={Shuffle} title="Augmentasi Data" subtitle="Diterapkan hanya pada set pelatihan" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {DATASET_CONFIG.augmentation.map((aug) => (
              <div key={aug} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "#fdf5e4", border: "1px solid #e8d898" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b31b1b", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "#1a0808" }}>{aug}</span>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 8, background: "#b31b1b", padding: "12px 16px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Catatan</p>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 3, lineHeight: 1.5 }}>
              Augmentasi hanya diterapkan saat pelatihan. Set validasi dan uji hanya menggunakan ubah ukuran dan normalisasi.
            </p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
