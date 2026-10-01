# Kadle: Kana Doodle 🎌

> **Kadle** (Kana + Doodle) adalah aplikasi latihan menulis huruf Jepang (Hiragana & Katakana) interaktif yang ditenagai oleh model AI *handwriting recognition* langsung di browser pengguna (*client-side*).

---

## ✨ Fitur Utama

- ✍️ **Interactive Drawing Canvas**
  - Kanvas menulis yang mulus, responsif, dan bebas latensi.
  - Mendukung input mouse, stylus, dan layar sentuh (mobile/tablet).
  - Kontrol floating minimalis: *Undo*, *Redo*, dan *Clear Canvas*.

- 🧠 **Client-Side AI Recognition (`onnxruntime-web`)**
  - Ditenagai model ResNet FP16 (3.082 kelas JIS X 0208 Kanji + Kana).
  - Inferensi berjalan 100% di browser pengguna via WebAssembly (WASM)—tanpa backend, hemat biaya server, dan *privacy-first*.
  - Pemisahan goresan berbasis *hierarchical stroke clustering* untuk mengevaluasi kata multi-karakter dari kiri ke kanan.
  - Normalisasi goresan otomatis dengan dukungan goresan titik tunggal (*single-point dots* untuk dakuten/tenten).

- ⚡ **Streaming Download & Offline CacheStorage**
  - Pelacakan progress unduhan model AI secara real-time via Web Streams API (`ReadableStream`).
  - Proteksi tombol *Periksa* otomatis terkunci (*disabled*) hingga model siap digunakan.
  - Hasil unduhan model otomatis disimpan ke `window.caches` (*Cache API*), membuat kunjungan berikutnya instan (~0.1 detik) bahkan saat offline.

- 🗂️ **Kustomisasi Kana Deck Fleksibel**
  - Pilih huruf Hiragana atau Katakana yang ingin dipelajari per karakter atau per baris (*A, Ka, Sa, Ta, Na, Ha, Ma, Ya, Ra, Wa*).
  - Filter kosakata ketat: Kuis hanya akan memunculkan kata yang seluruh hurufnya ada di deck aktif pengguna.

- 🎯 **Mode Kuis & Kosakata Pintar**
  - Opsi kuis: **Acak** (karakter tunggal/acak) atau **Kosakata** (kata bahasa Jepang bermakna).
  - Pengaturan panjang kata fleksibel (2, 3, 4, atau 5 karakter).
  - Fitur intip bantuan (*hint/romaji*) dan pengucapan suara (*speech synthesis*).

- 📱 **Mobile-First & Google Material Design**
  - UI clean, modern, dan floating controls terinspirasi dari Google Design System.
  - Desain toast hasil evaluasi yang ergonomis untuk penggunaan satu tangan di perangkat mobile.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Runtime**: [ONNX Runtime Web](https://onnxruntime.ai/) (`onnxruntime-web`)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Package Manager**: [Bun](https://bun.sh/)

---

## 🚀 Memulai (Local Development)

### Prasyarat
Pastikan kamu telah menginstal [Bun](https://bun.sh/) di sistem kamu.

### Instalasi
```bash
# Clone repository
git clone https://github.com/your-username/kadle.git
cd kadle

# Install dependencies
bun install
```

### Menjalankan Server Development
```bash
bun run dev
```
Buka browser di `http://localhost:5173`.

### Build untuk Produksi
```bash
bun run build
```
File siap saji (*production assets*) akan dihasilkan di folder `dist/`.

---

## ☁️ Panduan Deploy ke Cloudflare Pages

1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Pilih repository `kadle`.
3. Atur konfigurasi build berikut:
   - **Framework preset**: `Vite` (atau `None`)
   - **Build command**: `bun run build` (atau `npm run build`)
   - **Build output directory**: `dist`
4. Klik **Save and Deploy**.

> [!TIP]
> Model ONNX dan file label di folder `public/` akan otomatis di-serve oleh Cloudflare Pages dengan cache global CDN berkecepatan tinggi.

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT. Silakan gunakan dan kembangkan sesuai kebutuhan.
