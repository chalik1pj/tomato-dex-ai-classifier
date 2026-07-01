import Link from "next/link";
import { Database, Scan, BarChart3, ClipboardList, ArrowRight, Layers, Target } from "lucide-react";
import { MODEL_CONFIG, DATASET_CONFIG, TEST_METRICS } from "@/lib/model-data";
import { PageShell, PageHeader, Card, CardHeader, StatCard } from "@/components/ui-kit";

const CLASS_COLORS = ["#b31b1b", "#c17c14", "#2d7a2d"] as const;
const CLASS_BG     = ["#fff0f0", "#fff8ee", "#f0fff2"] as const;
const CLASS_BORDER = ["#f0b0b0", "#f0d090", "#90d0a0"] as const;

const QUICK_LINKS = [
  { href: "/dataset",        icon: Database,      label: "Dataset",             desc: "Distribusi kelas, pipeline augmentasi, dan pembagian dataset." },
  { href: "/detection",      icon: Scan,          label: "Deteksi AI",          desc: "Unggah atau ambil foto tomat untuk mengklasifikasi tingkat kematangannya." },
  { href: "/visualization",  icon: BarChart3,     label: "Visualisasi Model",   desc: "Grafik riwayat pelatihan dan rincian arsitektur lapisan model." },
  { href: "/results",        icon: ClipboardList, label: "Hasil Pengujian",     desc: "Confusion matrix, F1 per kelas, dan laporan klasifikasi." },
];

export default function DashboardPage() {
  const classes = MODEL_CONFIG.classNames;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Ringkasan"
        title="Dasbor TomatoDex"
        description={
          <>
            Klasifikasi kematangan tomat berbasis CNN menggunakan transfer learning <strong>InceptionResNetV2</strong> dari
            ImageNet. Mengklasifikasikan tomat menjadi <em>Matang</em>, <em>Mentah</em>, atau{" "}
            <em>Tidak Layak</em> dalam kondisi pencahayaan nyata.
          </>
        }
      />

      {/* ── Baris statistik ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <StatCard label="Akurasi Pengujian" value="83,9%" sub="360 sampel uji"       accent="red" />
        <StatCard label="Epoch Pelatihan"   value="50"    sub="Batch size 32"        accent="neutral" />
        <StatCard label="Akurasi Latih"     value="93,5%" sub="Epoch 50 / 50"        accent="green" />
        <StatCard label="Akurasi Validasi"  value="84,7%" sub="Epoch 50 / 50"        accent="amber" />
      </div>

      {/* ── Baris tengah ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>

        {/* Arsitektur Model */}
        <Card>
          <CardHeader icon={Layers} title="Arsitektur Model" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {([
                ["Arsitektur",         MODEL_CONFIG.name],
                ["Model Dasar",        "InceptionResNetV2 (ImageNet)"],
                ["Ukuran Input",       `${MODEL_CONFIG.inputSize} × ${MODEL_CONFIG.inputSize} × 3`],
                ["Total Parameter",    "55,9 Juta"],
                ["Parameter Dilatih",  "1,58 Juta (basis dibekukan)"],
                ["Optimizer",          `Adam  lr = ${MODEL_CONFIG.learningRate}`],
                ["Fungsi Kerugian",    "Categorical Cross-Entropy"],
              ] as [string, string][]).map(([k, v]) => (
                <tr key={k} style={{ borderBottom: "1px solid #f0e5be" }}>
                  <td style={{ padding: "8px 0", fontSize: 12, color: "#9c7e3a", fontWeight: 500, paddingRight: 12 }}>{k}</td>
                  <td style={{ padding: "8px 0", fontSize: 12, color: "#1a0808", fontWeight: 600, textAlign: "right" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Performa per kelas */}
        <Card>
          <CardHeader icon={Target} title="Performa per Kelas" subtitle="F1 · Presisi · Recall pada data uji" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {classes.map((cls, i) => {
              const m = TEST_METRICS.perClass[cls];
              const color = CLASS_COLORS[i];
              return (
                <div key={cls}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a0808" }}>{cls}</span>
                      <span style={{ fontSize: 11, color: "#9c7e3a" }}>({MODEL_CONFIG.classLabels[cls]})</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{(m.f1 * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: "#f0e8c4", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.f1 * 100}%`, background: color, borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 5 }}>
                    <span style={{ fontSize: 11, color: "#9c7e3a" }}>P {(m.precision * 100).toFixed(1)}%</span>
                    <span style={{ fontSize: 11, color: "#9c7e3a" }}>R {(m.recall * 100).toFixed(1)}%</span>
                    <span style={{ fontSize: 11, color: "#9c7e3a" }}>n = {m.support}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0e5be" }}>
            {[["Rata-rata Makro F1", (TEST_METRICS.macroAvgF1 * 100).toFixed(1) + "%"], ["F1 Berbobot", (TEST_METRICS.weightedAvgF1 * 100).toFixed(1) + "%"]].map(([label, val]) => (
              <div key={label} style={{ textAlign: "center", background: "#fdf5e4", border: "1px solid #e8d898", borderRadius: 10, padding: "12px 8px" }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9c7e3a", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#b31b1b" }}>{val}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Ringkasan dataset ── */}
      <Card>
        <CardHeader title="Ringkasan Dataset" subtitle={DATASET_CONFIG.source} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 18 }}>
          {classes.map((cls, i) => {
            const d = DATASET_CONFIG.classDistribution[cls];
            return (
              <div key={cls} style={{ background: CLASS_BG[i], border: `1px solid ${CLASS_BORDER[i]}`, borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 30, fontWeight: 800, color: CLASS_COLORS[i], letterSpacing: "-0.02em" }}>{d.count.toLocaleString("id-ID")}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a0808", marginTop: 4 }}>{cls}</p>
                <p style={{ fontSize: 11, color: "#9c7e3a", marginTop: 2 }}>{MODEL_CONFIG.classLabels[cls]} · {(d.fraction * 100).toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { t: `Latih: ${DATASET_CONFIG.trainImages.toLocaleString("id-ID")} (70%)`,    c: "#b31b1b" },
            { t: `Validasi: ${DATASET_CONFIG.valImages.toLocaleString("id-ID")} (15%)`, c: "#c17c14" },
            { t: `Uji: ${DATASET_CONFIG.testImages.toLocaleString("id-ID")} (15%)`,     c: "#2d7a2d" },
            { t: `Total: ${DATASET_CONFIG.totalImages.toLocaleString("id-ID")}`,         c: "#1a0808" },
          ].map(({ t, c }) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "#f5eccc", border: "1px solid #d4be72", fontSize: 12, fontWeight: 600, color: c }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
              {t}
            </span>
          ))}
        </div>
      </Card>

      {/* ── Tautan eksplorasi ── */}
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: "#9c7e3a", marginBottom: 14 }}>Jelajahi</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "#fffef8", border: "1px solid #e0cc7a",
                borderRadius: 12, padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                cursor: "pointer",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#b31b1b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0808" }}>{label}</p>
                  <p style={{ fontSize: 12, color: "#9c7e3a", marginTop: 3, lineHeight: 1.4 }}>{desc}</p>
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: "#c4a840", flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
