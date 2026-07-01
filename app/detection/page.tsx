"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, Camera, X, Scan, RefreshCw, CheckCircle,
  AlertTriangle, Info, Loader, FolderOpen,
} from "lucide-react";
import { PageShell, PageHeader, Card } from "@/components/ui-kit";
import {
  loadModel, classifyImageElement,
  getModelStatus, type ClassifyResult, type ModelStatus,
} from "@/lib/tfjs-model";

// ─── Pipeline steps shown during inference ────────────────────────────────────
const STEPS = [
  "Memuat gambar ke canvas",
  "Mengubah ukuran ke 224 × 224 px",
  "Menormalisasi piksel ÷ 255 → [0, 1]",
  "Menambah dimensi batch → (1, 224, 224, 3)",
  "Mengekstrak fitur — InceptionResNetV2",
  "Menjalankan kepala klasifikasi Dense(1024)",
  "Menghitung probabilitas softmax (3 kelas)",
];

// ─── Shared button styles ─────────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "10px 20px", borderRadius: 8, background: "#b31b1b", color: "#fff",
  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 16px", borderRadius: 8,
  background: "#fffef8", color: "#1a0808",
  fontSize: 13, fontWeight: 600, border: "1px solid #e0cc7a", cursor: "pointer",
};

// ─── Model status banner ──────────────────────────────────────────────────────
function ModelStatusBanner({ status }: { status: ModelStatus }) {
  if (status === "ready") return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, background: "#f0faf0", border: "1px solid #6aab6a" }}>
      <CheckCircle style={{ width: 14, height: 14, color: "#2d7a2d", flexShrink: 0 }} />
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1a3a1a" }}>
        Model <strong>InceptionResNetV2</strong> berhasil dimuat — inferensi berjalan langsung di browser (TensorFlow.js WebGL).
      </p>
    </div>
  );

  if (status === "loading") return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, background: "#f5f0d8", border: "1px solid #d4be72" }}>
      <Loader style={{ width: 14, height: 14, color: "#9c7e3a", animation: "spin 1s linear infinite", flexShrink: 0 }} />
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#5e4a1e" }}>
        Memuat model TensorFlow.js dari <code style={{ fontFamily: "monospace", fontSize: 11 }}>/model/model.json</code> …
      </p>
    </div>
  );

  if (status === "missing") return (
    <div style={{ padding: "16px 18px", borderRadius: 12, background: "#fff8e1", border: "1px solid #f0c040" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <FolderOpen style={{ width: 15, height: 15, color: "#b07000", flexShrink: 0 }} />
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1a0808" }}>File model tidak ditemukan di <code style={{ fontFamily: "monospace", fontSize: 12 }}>public/model/</code></p>
      </div>
      <p style={{ fontSize: 12, color: "#5e4a1e", lineHeight: 1.6, marginBottom: 12 }}>
        Jalankan <strong>sel terakhir</strong> ("SIMPAN MODEL") di notebook, kemudian salin semua file dari folder <code style={{ fontFamily: "monospace" }}>tfjs_model/</code> ke <code style={{ fontFamily: "monospace" }}>public/model/</code> di project ini.
      </p>
      {/* Struktur yang dibutuhkan */}
      <div style={{ padding: "10px 14px", borderRadius: 8, background: "#1a0808", fontFamily: "monospace", fontSize: 11, color: "#f3e5ab", lineHeight: 1.85 }}>
        <div style={{ color: "#aed6a0", marginBottom: 4 }}># Struktur file yang harus ada setelah disalin:</div>
        <div>public/</div>
        <div>&nbsp;&nbsp;model/</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#ffd580" }}>model.json</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;← descriptor arsitektur</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#ffd580" }}>group1-shard1of1.bin</span>&nbsp;← bobot biner</div>
        <div style={{ marginTop: 8, color: "#aed6a0" }}># Verifikasi: buka URL ini di browser</div>
        <div>http://localhost:3000/model/model.json</div>
      </div>
    </div>
  );

  // status === "error"
  return (
    <div style={{ padding: "16px 18px", borderRadius: 12, background: "#fff0f0", border: "1px solid #f0b0b0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <AlertTriangle style={{ width: 15, height: 15, color: "#b31b1b", flexShrink: 0 }} />
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1a0808" }}>Gagal memuat model</p>
      </div>
      <p style={{ fontSize: 12, color: "#5e4a1e", lineHeight: 1.6 }}>
        File <code style={{ fontFamily: "monospace" }}>public/model/model.json</code> ditemukan tetapi gagal diparsing atau bobot rusak.
        Pastikan file dihasilkan dengan <code style={{ fontFamily: "monospace" }}>tensorflowjs.converters.save_keras_model()</code> tanpa modifikasi.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DetectionPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  // Sync model status to local state
  const refreshStatus = useCallback(() => setModelStatus(getModelStatus()), []);

  // Preload model in background after mount
  useEffect(() => {
    refreshStatus();
    loadModel()
      .then(() => refreshStatus())
      .catch(() => refreshStatus());
  }, [refreshStatus]);

  // Cleanup camera on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Pilih file gambar yang valid (JPG, PNG, WEBP)."); return; }
    setError(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    // Pre-create an img element so we can read naturalWidth later
    const img = new Image();
    img.src = url;
    imgElRef.current = img;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
    } catch { setError("Akses kamera ditolak. Mohon izinkan akses kamera di browser."); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const url = canvas.toDataURL("image/jpeg");
    setImageUrl(url);
    setResult(null);
    const img = new Image();
    img.src = url;
    imgElRef.current = img;
    stopCamera();
  };

  const runClassification = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setStep(0);
    refreshStatus();

    try {
      // Animate steps while model loads / inference runs
      const stepInterval = setInterval(() => {
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
      }, 320);

      // Ensure img element is loaded
      const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = imgElRef.current ?? new Image();
        img.crossOrigin = "anonymous";
        if (img.complete && img.naturalWidth > 0) { resolve(img); return; }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Gagal memuat gambar"));
        if (!img.src) img.src = imageUrl;
      });

      const originalSize = `${imgEl.naturalWidth} × ${imgEl.naturalHeight} px`;

      // Run real TF.js inference
      const res = await classifyImageElement(imgEl, originalSize);

      clearInterval(stepInterval);
      setStep(STEPS.length - 1);
      refreshStatus();

      // Brief pause so the last step visually completes
      await new Promise((r) => setTimeout(r, 200));
      setResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "MODEL_NOT_FOUND") {
        setError("File model tidak ditemukan. Jalankan sel terakhir di notebook lalu salin folder tfjs_model/ ke public/model/.");
      } else if (msg === "MODEL_JSON_PARSE_ERROR") {
        setError("model.json gagal diparsing. Pastikan konversi menggunakan tensorflowjs_converter CLI dengan --input_format=tf_saved_model (lihat sel terakhir notebook).");
      } else {
        setError("Gagal memproses gambar: " + msg);
      }
      refreshStatus();
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setResult(null);
    setLoading(false);
    setStep(0);
    setError(null);
    imgElRef.current = null;
    stopCamera();
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Inferensi"
        title="Deteksi AI"
        description={
          <>
            Unggah atau ambil foto tomat. Model <strong>InceptionResNetV2</strong> (TensorFlow.js)
            akan mengubah ukurannya ke <strong>224 × 224 px</strong>, menormalisasi piksel ke [0, 1],
            lalu mengklasifikasi kematangan secara langsung di browser.
          </>
        }
      />

      {/* Model status banner */}
      <ModelStatusBanner status={modelStatus} />

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["upload", "camera"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 18px", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 600, border: "1px solid",
              background: mode === m ? "#b31b1b" : "#fffef8",
              color: mode === m ? "#fff" : "#6b4f1e",
              borderColor: mode === m ? "#b31b1b" : "#e0cc7a",
            }}
          >
            {m === "upload"
              ? <Upload style={{ width: 14, height: 14 }} />
              : <Camera style={{ width: 14, height: 14 }} />}
            {m === "upload" ? "Unggah Gambar" : "Ambil Foto"}
          </button>
        ))}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>

        {/* ── Left panel: input ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Upload drop zone */}
          {mode === "upload" && !imageUrl && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #d4be72", borderRadius: 14, background: "#fffef8",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "56px 24px", textAlign: "center",
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f5eccc", border: "1px solid #d4be72", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Upload style={{ width: 22, height: 22, color: "#b31b1b" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1a0808" }}>Seret gambar ke sini</p>
              <p style={{ fontSize: 12.5, color: "#9c7e3a", marginTop: 4 }}>atau klik untuk memilih file</p>
              <p style={{ fontSize: 11, color: "#b8a058", marginTop: 12 }}>JPG · PNG · WEBP — hasil terbaik dengan gambar tomat</p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}

          {/* Camera preview */}
          {mode === "camera" && !imageUrl && (
            <Card noPad>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "12px 12px 0 0", background: "#120505", display: "block" }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "center", padding: "14px 16px", borderTop: "1px solid #e0cc7a" }}>
                {!cameraActive
                  ? <button onClick={startCamera} style={btnPrimary}><Camera style={{ width: 15, height: 15 }} /> Mulai Kamera</button>
                  : <>
                    <button onClick={capturePhoto} style={btnPrimary}><Camera style={{ width: 15, height: 15 }} /> Ambil Foto</button>
                    <button onClick={stopCamera} style={btnSecondary}><X style={{ width: 15, height: 15 }} /> Batal</button>
                  </>
                }
              </div>
            </Card>
          )}

          {/* Image preview + action buttons */}
          {imageUrl && (
            <Card noPad>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Gambar tomat yang akan diklasifikasi"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "contain", background: "#120505", borderRadius: "12px 12px 0 0", display: "block" }} />
              <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderTop: "1px solid #e0cc7a" }}>
                <button onClick={runClassification} disabled={loading}
                  style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading
                    ? <RefreshCw style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
                    : <Scan style={{ width: 15, height: 15 }} />}
                  {loading ? "Menganalisis…" : "Klasifikasi Gambar"}
                </button>
                <button onClick={reset} disabled={loading}
                  style={{ ...btnSecondary, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                  <X style={{ width: 15, height: 15 }} /> Atur Ulang
                </button>
              </div>
            </Card>
          )}

          {/* Error message */}
          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 10, background: "#fff0f0", border: "1px solid #f0b0b0" }}>
              <AlertTriangle style={{ width: 15, height: 15, color: "#b31b1b", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12.5, color: "#1a0808" }}>{error}</p>
            </div>
          )}

          {/* Inference pipeline animation */}
          {loading && (
            <Card>
              <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9c7e3a", marginBottom: 14 }}>
                Pipeline Inferensi (Real-time)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STEPS.map((label, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: i < step ? "#2d7a2d" : i === step ? "#b31b1b" : "#f0e8c4",
                      transition: "background 0.2s",
                    }}>
                      {i < step
                        ? <CheckCircle style={{ width: 12, height: 12, color: "#fff" }} />
                        : i === step
                          ? <Loader style={{ width: 11, height: 11, color: "#fff", animation: "spin 1s linear infinite" }} />
                          : null
                      }
                    </div>
                    <span style={{ fontSize: 12.5, color: i <= step ? "#1a0808" : "#b8a058", fontWeight: i === step ? 600 : 400 }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right panel: results ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Empty state */}
          {!result && !loading && (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f5eccc", border: "1px solid #d4be72", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Scan style={{ width: 24, height: 24, color: "#b31b1b" }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1a0808" }}>Menunggu klasifikasi</p>
                <p style={{ fontSize: 12.5, color: "#9c7e3a", marginTop: 6, maxWidth: 260, lineHeight: 1.55 }}>
                  Unggah atau ambil foto tomat, lalu klik &quot;Klasifikasi Gambar&quot; untuk menjalankan inferensi TF.js.
                </p>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 7, width: "100%", maxWidth: 300, textAlign: "left" }}>
                  {[
                    ["Model", "InceptionResNetV2 (TF.js)"],
                    ["Input", "224 × 224 × 3 float32"],
                    ["Normalisasi", "÷ 255 → [0, 1]"],
                    ["Output", "softmax(3) → Matang / Mentah / Tidak Layak"],
                    ["Backend", "WebGL (GPU) atau CPU"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0e5be", fontSize: 12 }}>
                      <span style={{ color: "#9c7e3a" }}>{k}</span>
                      <span style={{ fontFamily: "monospace", color: "#1a0808", fontWeight: 600, textAlign: "right", maxWidth: 180 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Classification result banner */}
          {result && (
            <>
              <div style={{ borderRadius: 12, padding: "20px 22px", background: result.topColor, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <CheckCircle style={{ width: 15, height: 15, color: "rgba(255,255,255,0.75)" }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.75)" }}>
                    Hasil Klasifikasi — Model Nyata
                  </span>
                </div>
                <p style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>{result.topClass}</p>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{result.topLabel}</p>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Kepercayaan</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{(result.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${result.confidence * 100}%`, background: "#fff", borderRadius: 99 }} />
                  </div>
                </div>
              </div>

              {/* Softmax probabilities */}
              <Card>
                <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9c7e3a", marginBottom: 16 }}>
                  Probabilitas Kelas (Softmax Output)
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {result.predictions.map((pred) => (
                    <div key={pred.class}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: pred.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: pred.color }}>{pred.class}</span>
                          <span style={{ fontSize: 11, color: "#9c7e3a" }}>({pred.label})</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#1a0808" }}>
                          {(pred.probability * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: "#f0e8c4", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pred.probability * 100}%`, background: pred.color, borderRadius: 99, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Preprocessing + model info */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <Info style={{ width: 14, height: 14, color: "#b31b1b" }} />
                  <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9c7e3a" }}>
                    Detail Pra-pemrosesan &amp; Inferensi
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {([
                    ["Ukuran asli",     result.preprocessInfo.originalSize],
                    ["Diubah ukuran ke", result.preprocessInfo.resizedTo],
                    ["Normalisasi",     result.preprocessInfo.normalized],
                    ["File model",      result.preprocessInfo.modelPath],
                    ["TF.js backend",   result.preprocessInfo.backend],
                    ["Bentuk tensor",   "(1, 224, 224, 3)"],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0e5be", fontSize: 12 }}>
                      <span style={{ color: "#9c7e3a" }}>{k}</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#1a0808" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
