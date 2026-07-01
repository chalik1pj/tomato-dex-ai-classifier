// TomatoDex – Data model diekstrak dari notebook tomatodex-inceptionresnetv2.ipynb
// TensorFlow 2.19.0 | Random seed: 24 | GPU: Tesla P100-PCIE-16GB

export const MODEL_CONFIG = {
  name: "InceptionResNetV2",
  baseModel: "InceptionResNetV2 (ImageNet pretrained)",
  inputSize: 224,
  numClasses: 3,
  classNames: ["Matang", "Mentah", "Tidak Layak"] as const,
  classLabels: { Matang: "Ripe", Mentah: "Unripe", "Tidak Layak": "Unfit" },
  normalization: "Dibagi 255 → [0, 1]",
  optimizer: "Adam",
  learningRate: 0.0001,
  loss: "Categorical Cross-Entropy",
  epochs: 50,
  batchSize: 32,
  randomSeed: 24,
  totalParams: 55_913_699,
  trainableParams: 1_576_963,
  nonTrainableParams: 54_336_736,
};

export const DATASET_CONFIG = {
  totalImages: 2400,
  trainImages: 1680,
  valImages: 360,
  testImages: 360,
  trainSplit: 0.70,
  valSplit: 0.15,
  testSplit: 0.15,
  // Per kelas — masing-masing 800 gambar (seimbang sempurna)
  classDistribution: {
    Matang:        { count: 800, fraction: 0.333 },
    Mentah:        { count: 800, fraction: 0.333 },
    "Tidak Layak": { count: 800, fraction: 0.333 },
  },
  // Per split per kelas (stratified)
  splitPerClass: {
    train: { Matang: 560, Mentah: 560, "Tidak Layak": 560 },
    val:   { Matang: 120, Mentah: 120, "Tidak Layak": 120 },
    test:  { Matang: 120, Mentah: 120, "Tidak Layak": 120 },
  },
  source: "Kaggle – syafwanchalik/tomatodex",
  augmentation: [
    "Horizontal & Vertical Flip",
    "Rotasi (±20°)",
    "Pergeseran Lebar & Tinggi (±10%)",
    "Zoom (±15%)",
    "Penyesuaian Kecerahan",
    "Transformasi Shear",
  ],
};

// Riwayat pelatihan 50 epoch — nilai nyata dari output notebook
export const TRAINING_HISTORY = [
  { epoch: 1,  accuracy: 0.6113, loss: 0.8617, val_accuracy: 0.6306, val_loss: 0.7624 },
  { epoch: 2,  accuracy: 0.7542, loss: 0.6278, val_accuracy: 0.7167, val_loss: 0.6529 },
  { epoch: 3,  accuracy: 0.7887, loss: 0.5530, val_accuracy: 0.7417, val_loss: 0.5904 },
  { epoch: 4,  accuracy: 0.8125, loss: 0.5089, val_accuracy: 0.7556, val_loss: 0.5499 },
  { epoch: 5,  accuracy: 0.8208, loss: 0.4786, val_accuracy: 0.7833, val_loss: 0.5225 },
  { epoch: 6,  accuracy: 0.8333, loss: 0.4551, val_accuracy: 0.8028, val_loss: 0.5016 },
  { epoch: 7,  accuracy: 0.8381, loss: 0.4379, val_accuracy: 0.8056, val_loss: 0.4852 },
  { epoch: 8,  accuracy: 0.8464, loss: 0.4198, val_accuracy: 0.8056, val_loss: 0.4720 },
  { epoch: 9,  accuracy: 0.8524, loss: 0.4055, val_accuracy: 0.8056, val_loss: 0.4605 },
  { epoch: 10, accuracy: 0.8589, loss: 0.3932, val_accuracy: 0.8083, val_loss: 0.4515 },
  { epoch: 11, accuracy: 0.8637, loss: 0.3822, val_accuracy: 0.8167, val_loss: 0.4420 },
  { epoch: 12, accuracy: 0.8661, loss: 0.3714, val_accuracy: 0.8194, val_loss: 0.4344 },
  { epoch: 13, accuracy: 0.8714, loss: 0.3617, val_accuracy: 0.8361, val_loss: 0.4241 },
  { epoch: 14, accuracy: 0.8756, loss: 0.3527, val_accuracy: 0.8278, val_loss: 0.4221 },
  { epoch: 15, accuracy: 0.8786, loss: 0.3446, val_accuracy: 0.8389, val_loss: 0.4166 },
  { epoch: 16, accuracy: 0.8851, loss: 0.3358, val_accuracy: 0.8361, val_loss: 0.4112 },
  { epoch: 17, accuracy: 0.8887, loss: 0.3288, val_accuracy: 0.8389, val_loss: 0.4088 },
  { epoch: 18, accuracy: 0.8905, loss: 0.3215, val_accuracy: 0.8500, val_loss: 0.4044 },
  { epoch: 19, accuracy: 0.8923, loss: 0.3145, val_accuracy: 0.8556, val_loss: 0.4016 },
  { epoch: 20, accuracy: 0.8958, loss: 0.3072, val_accuracy: 0.8556, val_loss: 0.3973 },
  { epoch: 21, accuracy: 0.8970, loss: 0.3010, val_accuracy: 0.8639, val_loss: 0.3964 },
  { epoch: 22, accuracy: 0.8994, loss: 0.2950, val_accuracy: 0.8556, val_loss: 0.3932 },
  { epoch: 23, accuracy: 0.9030, loss: 0.2890, val_accuracy: 0.8611, val_loss: 0.3900 },
  { epoch: 24, accuracy: 0.9042, loss: 0.2831, val_accuracy: 0.8583, val_loss: 0.3877 },
  { epoch: 25, accuracy: 0.9048, loss: 0.2773, val_accuracy: 0.8611, val_loss: 0.3869 },
  { epoch: 26, accuracy: 0.9083, loss: 0.2731, val_accuracy: 0.8556, val_loss: 0.3814 },
  { epoch: 27, accuracy: 0.9131, loss: 0.2664, val_accuracy: 0.8528, val_loss: 0.3809 },
  { epoch: 28, accuracy: 0.9149, loss: 0.2613, val_accuracy: 0.8528, val_loss: 0.3797 },
  { epoch: 29, accuracy: 0.9155, loss: 0.2568, val_accuracy: 0.8556, val_loss: 0.3782 },
  { epoch: 30, accuracy: 0.9167, loss: 0.2522, val_accuracy: 0.8556, val_loss: 0.3765 },
  { epoch: 31, accuracy: 0.9173, loss: 0.2476, val_accuracy: 0.8556, val_loss: 0.3742 },
  { epoch: 32, accuracy: 0.9190, loss: 0.2427, val_accuracy: 0.8583, val_loss: 0.3736 },
  { epoch: 33, accuracy: 0.9202, loss: 0.2383, val_accuracy: 0.8528, val_loss: 0.3728 },
  { epoch: 34, accuracy: 0.9214, loss: 0.2347, val_accuracy: 0.8528, val_loss: 0.3733 },
  { epoch: 35, accuracy: 0.9238, loss: 0.2301, val_accuracy: 0.8500, val_loss: 0.3708 },
  { epoch: 36, accuracy: 0.9238, loss: 0.2261, val_accuracy: 0.8500, val_loss: 0.3690 },
  { epoch: 37, accuracy: 0.9262, loss: 0.2221, val_accuracy: 0.8528, val_loss: 0.3673 },
  { epoch: 38, accuracy: 0.9280, loss: 0.2181, val_accuracy: 0.8500, val_loss: 0.3686 },
  { epoch: 39, accuracy: 0.9268, loss: 0.2141, val_accuracy: 0.8500, val_loss: 0.3653 },
  { epoch: 40, accuracy: 0.9268, loss: 0.2104, val_accuracy: 0.8444, val_loss: 0.3656 },
  { epoch: 41, accuracy: 0.9274, loss: 0.2070, val_accuracy: 0.8444, val_loss: 0.3624 },
  { epoch: 42, accuracy: 0.9286, loss: 0.2029, val_accuracy: 0.8417, val_loss: 0.3631 },
  { epoch: 43, accuracy: 0.9292, loss: 0.2002, val_accuracy: 0.8444, val_loss: 0.3607 },
  { epoch: 44, accuracy: 0.9298, loss: 0.1963, val_accuracy: 0.8444, val_loss: 0.3600 },
  { epoch: 45, accuracy: 0.9304, loss: 0.1934, val_accuracy: 0.8444, val_loss: 0.3609 },
  { epoch: 46, accuracy: 0.9310, loss: 0.1902, val_accuracy: 0.8472, val_loss: 0.3569 },
  { epoch: 47, accuracy: 0.9321, loss: 0.1865, val_accuracy: 0.8417, val_loss: 0.3587 },
  { epoch: 48, accuracy: 0.9339, loss: 0.1842, val_accuracy: 0.8500, val_loss: 0.3539 },
  { epoch: 49, accuracy: 0.9351, loss: 0.1808, val_accuracy: 0.8444, val_loss: 0.3533 },
  { epoch: 50, accuracy: 0.9351, loss: 0.1776, val_accuracy: 0.8472, val_loss: 0.3527 },
];

// Confusion matrix — raw counts (baris = aktual, kolom = prediksi)
// Urutan kelas: [Matang, Mentah, Tidak Layak]
// Dari notebook: cm = [[ 92  1  27], [  2 101  17], [ 11   0 109]]
export const CONFUSION_MATRIX = [
  [ 92,  1, 27],  // Aktual: Matang    → prediksi [Matang=92, Mentah=1, TidakLayak=27]
  [  2, 101, 17], // Aktual: Mentah    → prediksi [Matang=2,  Mentah=101, TidakLayak=17]
  [ 11,  0, 109], // Aktual: Tidak Layak→prediksi [Matang=11, Mentah=0, TidakLayak=109]
];

// Confusion matrix ternormalisasi (%)
export const CONFUSION_MATRIX_NORM = [
  [76.7,  0.8, 22.5], // Aktual: Matang
  [ 1.7, 84.2, 14.2], // Aktual: Mentah
  [ 9.2,  0.0, 90.8], // Aktual: Tidak Layak
];

export const TEST_METRICS = {
  overallAccuracy: 0.8389,    // 83.9%
  totalTestSamples: 360,
  macroAvgPrecision: 0.8596,
  macroAvgRecall: 0.8389,
  macroAvgF1: 0.8421,
  weightedAvgF1: 0.8421,
  perClass: {
    Matang: {
      precision: 0.8762,
      recall:    0.7667,
      f1:        0.8178,
      support:   120,
    },
    Mentah: {
      precision: 0.9902,
      recall:    0.8417,
      f1:        0.9099,
      support:   120,
    },
    "Tidak Layak": {
      precision: 0.7124,
      recall:    0.9083,
      f1:        0.7985,
      support:   120,
    },
  },
};

export const MODEL_ARCHITECTURE = [
  {
    layer: "Input",
    type: "Input Layer",
    outputShape: "(None, 224, 224, 3)",
    params: 0,
    trainable: false,
    description: "Gambar RGB dinormalisasi ke [0, 1]",
  },
  {
    layer: "InceptionResNetV2",
    type: "Functional (Base Model)",
    outputShape: "(None, 5, 5, 1536)",
    params: 54_336_736,
    trainable: false,
    description: "Pretrained ImageNet – bobot dibekukan (tidak dilatih)",
  },
  {
    layer: "GlobalAveragePooling2D",
    type: "Pooling",
    outputShape: "(None, 1536)",
    params: 0,
    trainable: true,
    description: "Mereduksi dimensi spasial menjadi vektor fitur",
  },
  {
    layer: "Dense (dense_1)",
    type: "Dense + ReLU",
    outputShape: "(None, 1024)",
    params: 1_573_888,
    trainable: true,
    description: "Lapisan klasifikasi fully-connected (1024 unit)",
  },
  {
    layer: "Dense (output)",
    type: "Dense + Softmax",
    outputShape: "(None, 3)",
    params: 3_075,
    trainable: true,
    description: "Output probabilitas 3 kelas (softmax)",
  },
];

export const CLASS_COLORS = {
  Matang:        "#b31b1b",
  Mentah:        "#c17c14",
  "Tidak Layak": "#2d7a2d",
} as const;
