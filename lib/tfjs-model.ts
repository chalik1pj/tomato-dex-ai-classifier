/**
 * TomatoDex — TensorFlow.js model loader & inference
 *
 * Model architecture (dari notebook):
 *   InceptionResNetV2 (bobot ImageNet dibekukan)
 *   → GlobalAveragePooling2D → Dense(1024, relu) → Dense(3, softmax)
 *   Kelas: [Matang (Ripe), Mentah (Unripe), Tidak Layak (Unfit)]
 *
 * Format model yang didukung:
 *   - tfjs_graph_model  (output dari tensorflowjs_converter CLI — direkomendasikan)
 *   - tfjs_layers_model (output dari tfjs.converters.save_keras_model — lama)
 *
 * Pra-pemrosesan (identik dengan Python notebook):
 *   Resize 224×224 → normalisasi ÷ 255 → batch dim
 */

"use client";

import * as tf from "@tensorflow/tfjs";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MODEL_PATH  = "/model/model.json";
export const INPUT_SIZE  = 224;
export const CLASS_NAMES  = ["Matang", "Mentah", "Tidak Layak"] as const;
export const CLASS_LABELS = ["Ripe",   "Unripe", "Unfit"]       as const;
export const CLASS_COLORS = ["#b31b1b", "#c17c14", "#2d7a2d"]   as const;

export type ClassName = (typeof CLASS_NAMES)[number];

export interface Prediction {
  class:       ClassName;
  label:       string;
  probability: number;
  color:       string;
}

export interface ClassifyResult {
  topClass:    ClassName;
  topLabel:    string;
  topColor:    string;
  confidence:  number;
  predictions: Prediction[];
  preprocessInfo: {
    originalSize: string;
    resizedTo:    string;
    normalized:   string;
    modelPath:    string;
    backend:      string;
    modelType:    string;
  };
}

// ─── Status ───────────────────────────────────────────────────────────────────

export type ModelStatus = "idle" | "loading" | "ready" | "error" | "missing";

let _graphModel:   tf.GraphModel   | null = null;
let _layersModel:  tf.LayersModel  | null = null;
let _modelType:    "graph" | "layers" | null = null;
let _loadPromise:  Promise<void>   | null = null;
let _status:       ModelStatus     = "idle";

export function getModelStatus(): ModelStatus { return _status; }

// ─── Model file probe ─────────────────────────────────────────────────────────

async function probeModelFile(): Promise<boolean> {
  try {
    const res = await fetch(MODEL_PATH, { headers: { Range: "bytes=0-1023" } });
    return res.ok || res.status === 206;
  } catch {
    return false;
  }
}

// ─── Loader ───────────────────────────────────────────────────────────────────

/**
 * Muat model dari /model/model.json.
 * Mencoba GraphModel (tfjs_graph_model) terlebih dahulu, lalu fallback ke LayersModel.
 * Model di-cache sehingga hanya dimuat sekali.
 */
export async function loadModel(): Promise<void> {
  if (_graphModel || _layersModel) return;
  if (_loadPromise) return _loadPromise;

  _status = "loading";

  _loadPromise = (async () => {
    // 1. Cek apakah file ada
    const exists = await probeModelFile();
    if (!exists) {
      _status = "missing";
      throw new Error("MODEL_NOT_FOUND");
    }

    // 2. Baca model.json untuk menentukan format
    let modelJson: Record<string, unknown> = {};
    try {
      const res = await fetch(MODEL_PATH);
      modelJson = await res.json();
    } catch {
      _status = "error";
      throw new Error("MODEL_JSON_PARSE_ERROR");
    }

    const format = (modelJson.format as string | undefined) ?? "";
    const isGraph = format.includes("graph") || "signature" in modelJson || "userDefinedMetadata" in modelJson;

    // 3. Muat sesuai format
    if (isGraph) {
      // tfjs_graph_model — output dari tensorflowjs_converter CLI
      _graphModel = await tf.loadGraphModel(MODEL_PATH);
      _modelType  = "graph";
    } else {
      // tfjs_layers_model — output dari save_keras_model() Python API (lama)
      _layersModel = await tf.loadLayersModel(MODEL_PATH);
      _modelType   = "layers";
    }

    // 4. Warm-up pass
    const dummy = tf.zeros([1, INPUT_SIZE, INPUT_SIZE, 3]);
    try {
      const out = _graphModel
        ? (_graphModel.predict(dummy) as tf.Tensor)
        : (_layersModel!.predict(dummy) as tf.Tensor);
      out.dispose();
    } finally {
      dummy.dispose();
    }

    _status = "ready";
  })().catch((err: unknown) => {
    _loadPromise = null;
    if (_status === "loading") _status = "error";
    throw err;
  });

  return _loadPromise;
}

// ─── Preprocessing ────────────────────────────────────────────────────────────

function preprocessImage(source: HTMLCanvasElement): tf.Tensor4D {
  return tf.tidy(() => {
    const raw      = tf.browser.fromPixels(source);
    const resized  = tf.image.resizeBilinear(raw as tf.Tensor3D, [INPUT_SIZE, INPUT_SIZE]);
    const normed   = resized.toFloat().div(tf.scalar(255));
    return normed.expandDims(0) as tf.Tensor4D;
  });
}

function drawToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width  = img.naturalWidth  || INPUT_SIZE;
  canvas.height = img.naturalHeight || INPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

// ─── Inference ────────────────────────────────────────────────────────────────

/**
 * Jalankan klasifikasi pada HTMLImageElement yang sudah dimuat.
 * loadModel() harus sudah dipanggil sebelumnya.
 */
export async function classifyImageElement(
  imgEl: HTMLImageElement,
  originalSize: string,
): Promise<ClassifyResult> {
  if (!_graphModel && !_layersModel) {
    await loadModel();
  }

  const canvas      = drawToCanvas(imgEl);
  const inputTensor = preprocessImage(canvas);

  let probs: number[];
  try {
    const rawOut = _graphModel
      ? (_graphModel.predict(inputTensor)  as tf.Tensor)
      : (_layersModel!.predict(inputTensor) as tf.Tensor);

    // Jika output berbentuk nested NamedTensorMap, ambil tensor pertama
    const outTensor = rawOut instanceof tf.Tensor
      ? rawOut
      : Object.values(rawOut as Record<string, tf.Tensor>)[0];

    probs = Array.from(await outTensor.data());

    if (!(rawOut instanceof tf.Tensor)) {
      Object.values(rawOut as Record<string, tf.Tensor>).forEach(t => t.dispose());
    } else {
      outTensor.dispose();
    }
  } finally {
    inputTensor.dispose();
  }

  // Pastikan jumlah output = 3 kelas
  if (probs.length !== CLASS_NAMES.length) {
    // Jika output lebih dari 3, ambil 3 nilai dengan indeks terbesar
    // (beberapa graph model wrap output dalam array yang lebih besar)
    probs = probs.slice(0, CLASS_NAMES.length);
  }

  const predictions: Prediction[] = CLASS_NAMES.map((cls, i) => ({
    class:       cls,
    label:       CLASS_LABELS[i],
    probability: probs[i] ?? 0,
    color:       CLASS_COLORS[i],
  })).sort((a, b) => b.probability - a.probability);

  const top = predictions[0];

  return {
    topClass:   top.class,
    topLabel:   top.label,
    topColor:   top.color,
    confidence: top.probability,
    predictions,
    preprocessInfo: {
      originalSize,
      resizedTo:  `${INPUT_SIZE} × ${INPUT_SIZE}`,
      normalized: "÷ 255 → [0, 1]",
      modelPath:  MODEL_PATH,
      backend:    tf.getBackend(),
      modelType:  _modelType === "graph" ? "tfjs_graph_model (CLI)" : "tfjs_layers_model (Python API)",
    },
  };
}
