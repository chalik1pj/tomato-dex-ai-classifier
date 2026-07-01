# public/model/ — File Model TensorFlow.js

Folder ini harus berisi hasil konversi model TF.js dari notebook.
File yang diperlukan:

  model.json                  ← descriptor arsitektur + path ke file bobot
  group1-shard1of1.bin        ← bobot biner (nama bisa berbeda tergantung ukuran model)

## Cara menghasilkan file ini

1. Buka file `Model/tomato_research_InceptionResNetV2.ipynb`
2. Jalankan semua sel training (sel 1 s/d 28)
3. Jalankan **sel terakhir** (bertanda "SIMPAN MODEL")
4. Download folder `tfjs_model/` yang dihasilkan
5. Salin SEMUA isi folder `tfjs_model/` ke sini (`public/model/`)

## Verifikasi

Setelah file disalin, buka URL berikut di browser:
  http://localhost:3000/model/model.json

Jika browser menampilkan JSON dengan key "format", "modelTopology", dan "weightsManifest",
maka model sudah siap digunakan di halaman Deteksi AI.
