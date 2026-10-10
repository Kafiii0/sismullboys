# 🎓 Analisis Mendalam Proyek MUNINN / BIFROST
## Tugas Besar Sistem Multimedia (CBK2CAB3) — Telkom University Bandung

---

## BAGIAN 1: HASIL RISET MENDALAM REPOSITORI

### 1.1 Identitas Proyek

| Aspek | Detail |
|:---|:---|
| **Nama Proyek** | MUNINN — Secure Multimedia Evidence Pipeline |
| **Kategori** | Pipeline multimedia end-to-end untuk bukti digital audit keamanan siber |
| **Stack Teknologi** | Next.js 14 (App Router), React 18, Three.js, Tailwind CSS, Framer Motion, Python FastAPI, OpenCV, YOLO, RapidOCR |
| **Arsitektur** | Client-side processing (browser-first), zero-knowledge backend |
| **Mata Kuliah** | CBK2CAB3 — Sistem Multimedia, Telkom University |

### 1.2 Struktur Modul (4 Modul Inti)

```
┌────────────────────────────────────────────────────────────────┐
│ MODUL 1: Akuisisi & Pengolahan (/studio, /redact)             │
│  ├─ Screen/Webcam capture (MediaDevices + MediaRecorder)      │
│  ├─ OCR + Regex Token Scanner (Tesseract.js / RapidOCR)       │
│  ├─ Redaksi: Solid Black / Mosaic / Gaussian Blur             │
│  ├─ Audio: Web Audio API, High-Pass Filter, Normalization     │
│  └─ SHA-256 hash awal (H0)                                    │
├────────────────────────────────────────────────────────────────┤
│ MODUL 2: Kompresi (/compression)                              │
│  ├─ DCT 8×8 forward + inverse transform                      │
│  ├─ Quantization matrix (Q_BASE scaling)                      │
│  ├─ Zigzag scan + RLE + Huffman (disebutkan)                  │
│  ├─ PSNR, SSIM, Compression Ratio                             │
│  └─ Perbandingan vs JPEG Baseline & WebP                      │
├────────────────────────────────────────────────────────────────┤
│ MODUL 3: Keamanan & Kustodi (/security)                       │
│  ├─ SHA-256 Hash Chain (H0 → H1 → H2 → H3 → H4)              │
│  ├─ AES-256-GCM encryption (client-side)                      │
│  ├─ ECDSA P-256 digital signature                             │
│  ├─ DCT mid-frequency watermark                               │
│  ├─ BER (Bit Error Rate) measurement                          │
│  └─ Tamper detection & simulation                             │
├────────────────────────────────────────────────────────────────┤
│ MODUL 4: Distribusi (/distribution)                           │
│  ├─ HLS multi-bitrate: 1080p / 720p / 360p                   │
│  ├─ Network throttling simulator (Fiber/4G/3G/Edge)           │
│  ├─ QoS metrics: startup delay, rebuffering, bitrate switch   │
│  ├─ Signed expiring URLs (HMAC-SHA256)                        │
│  └─ Client verification portal                                │
└────────────────────────────────────────────────────────────────┘
```

### 1.3 Halaman Tambahan (Non-Core)

| Halaman | Fungsi |
|:---|:---|
| `/` (Homepage) | Landing page korporat BIFROST dengan 3D globe (Three.js) |
| `/redact` | AI-based document redaction (KTP, SIM, WhatsApp) menggunakan Python backend (YOLOv8, YuNet, RapidOCR) |
| `/screen-shield` | HDMI Screen Shield protection tool |
| `/witness-shield` | Witness Cam monitoring tool |
| `/evaluation` | Self-assessment rubrik & roadmap |
| `/about`, `/team`, `/contact`, `/services`, `/programs`, `/compliance` | Halaman korporat pelengkap |

### 1.4 Backend (Python FastAPI)

Server-side processing menggunakan:
- **YOLOv8** untuk deteksi objek (orang dalam gambar)
- **YuNet** (OpenCV DNN) untuk face detection
- **RapidOCR** untuk text extraction
- **OpenCV** + NumPy untuk manipulasi citra (redaksi, cropping, masking)
- SHA-256 hashing untuk chain of custody
- EXIF extraction & stripping

---

## BAGIAN 2: PEMETAAN TERHADAP ASPEK PENILAIAN

### 2.1 Aspek Penilaian (7 Kriteria, Total 100 Poin)

| No | Aspek Penilaian | Bobot | Yang Dinilai |
|:---:|:---|:---:|:---|
| 1 | Kejelasan Masalah & Tujuan Proyek | **10** | Masalah jelas, calon pengguna jelas, tujuan proyek masuk akal |
| 2 | Kesesuaian dengan Sistem Multimedia | **20** | Benar-benar sistem multimedia, bukan sekadar menampilkan gambar/video |
| 3 | Pemetaan Materi Sistem Multimedia | **20** | Materi kuliah apa yang digunakan, di bagian mana, bagaimana diimplementasikan |
| 4 | Core Multimedia Processing / Implementasi Teknis | **20** | Ada proses multimedia nyata (sampling, filtering, compression, encoding, dll.) |
| 5 | Alur Data / Arsitektur Sistem | **10** | Alur input → processing → storage/encoding → output jelas dan logis |
| 6 | Rencana Eksperimen & Pengukuran | **10** | Parameter yang diubah, hasil yang dibandingkan, metrik yang diukur |
| 7 | Presentasi & Kemampuan Menjawab | **10** | Seluruh anggota memahami konsep dan mampu menjawab teknis |

### 2.2 Poin PPT yang Wajib Ada

| No | Poin | Isi Wajib |
|:---:|:---|:---|
| 1 | Judul Proyek & Tim | Judul, anggota, pembagian peran |
| 2 | Latar Belakang & Masalah | Masalah, calon pengguna, alasan penting |
| 3 | Konsep Produk | Pengguna X → Sistem Y → Pengguna Z |
| 4 | Unsur Multimedia yang Digunakan | Jenis media: citra, audio, video, teks, animasi, 3D |
| 5 | Pemetaan Materi Sistem Multimedia | Tabel materi → bagian apa → implementasinya |
| 6 | Alur Data / Arsitektur Sistem | Diagram Input → Processing → Storage → Output |
| 7 | Core Feature & Implementasi Teknis | Fitur utama, algoritma/proses multimedia |
| 8 | Rencana Eksperimen & Pengukuran | Parameter, perbandingan, metrik |

---

## BAGIAN 3: EVALUASI PROYEK VS KRITERIA

### ✅ ASPEK YANG SUDAH KUAT (Score Prediction: High)

#### 1. Kejelasan Masalah & Tujuan (10 poin) — ⭐ 9/10
> [!TIP]
> Proyek ini sudah **sangat kuat** di aspek ini.

**Kelebihan:**
- Masalah didefinisikan dengan sangat rinci: 4 dimensi masalah (ukuran, kerahasiaan, integritas, distribusi)
- Data pendukung empiris dari BSSN, Verizon DBIR, Ericsson
- Calon pengguna jelas: pentest consultant, CSIRT, auditor
- Visi dan misi terstruktur
- Regulatory compliance (UU PDP, UU ITE) menambah legitimasi

**Minor Gap:** Tidak ada yang perlu diperbaiki secara signifikan.

---

#### 2. Kesesuaian dengan Sistem Multimedia (20 poin) — ⭐ 17/20
> [!IMPORTANT]
> Proyek ini **benar-benar** sistem multimedia dan BUKAN sekadar menampilkan gambar/video.

**Kelebihan:**
- Memproses citra, video, dan audio secara aktif (bukan hanya menampilkan)
- DCT 8×8 adalah implementasi langsung dari teori kompresi multimedia
- Hash chain, watermarking, encryption → pemrosesan multimedia nyata
- HLS multi-bitrate → distribusi multimedia adaptif

**Gap yang Perlu Ditutup:**
- ⚠️ Beberapa metrik di modul kompresi (SSIM, ukuran compressed) menggunakan **formula pendekatan/estimasi**, bukan kalkulasi real dari data piksel aktual
- ⚠️ Modul distribusi HLS adalah **simulator UI** — bukan streaming HLS riil (.m3u8/.ts files)

---

#### 3. Core Multimedia Processing (20 poin) — ⭐ 15/20
> [!WARNING]
> Ini adalah aspek kritis yang memerlukan perhatian paling besar.

**Yang Sudah Benar-Benar Diimplementasikan:**
- ✅ **DCT 8×8 Forward + Inverse Transform** — implementasi JavaScript lengkap
- ✅ **Quantization matrix scaling** (Q_BASE, getScaledQ) — benar secara matematis
- ✅ **Pixel manipulation** — RGB to luminance, block-based processing
- ✅ **Redaction** — Solid, Mosaic (pixel averaging per block), Blur (Canvas filter)
- ✅ **SHA-256 hashing** — WebCrypto API (real cryptographic hashing)
- ✅ **Audio capture + processing** — Web Audio API, BiquadFilter (highpass 120Hz), FFT visualizer
- ✅ **Screen capture** — MediaDevices.getDisplayMedia()
- ✅ **Server-side AI**: YOLOv8 detection, YuNet face detection, RapidOCR text extraction

**Yang MASIH BERUPA SIMULASI / UI-ONLY (Kritis!):**

| Fitur | Status | Masalah |
|:---|:---|:---|
| **SSIM calculation** | ❌ SIMULASI | Line 191: `Math.min(0.999, Math.max(0.65, (1 - (mse / 1200) * 0.4)))` — ini **bukan SSIM asli**, hanya formula linear turunan MSE |
| **Compressed file size** | ❌ SIMULASI | Line 194: `Math.round(18 + (qualityQ / 100) * 95)` — ukuran dikira-kira, bukan dari actual encoded bytes |
| **OCR retention metric** | ❌ SIMULASI | Line 197: `Math.min(100, Math.max(70, (82 + (qualityQ / 100) * 17.5)))` — angka acak |
| **JPEG/WebP comparison** | ❌ FAKED | Line 472-483: metrik pembanding dihasilkan dari operasi aritmatika sederhana terhadap metrik sendiri |
| **Zigzag + RLE + Huffman** | ⚠️ DISEBUTKAN TAPI TIDAK DIIMPLEMENTASIKAN | Hanya DCT + quantize yang benar-benar berjalan |
| **Hash Chain (H0→H4)** | ⚠️ PARTIAL | H0 dan H1 di studio.jsx menggunakan SHA-256 asli. H2-H4 di security.jsx adalah **hardcoded hex strings** |
| **AES-256-GCM encryption** | ❌ TIDAK ADA | Tidak ada kode WebCrypto `crypto.subtle.encrypt()` |
| **ECDSA signing** | ❌ TIDAK ADA | Tidak ada kode `crypto.subtle.sign()` |
| **DCT Watermark** | ❌ SIMULASI | Hanya label dan BER display, tidak ada watermark embedding di koefisien DCT |
| **HLS streaming** | ❌ SIMULASI | Tidak ada `.m3u8` file, tidak ada segmen `.ts`, hanya UI state toggle |
| **Video WebCodecs** | ❌ TIDAK ADA | Tidak ada kode WebCodecs (VideoEncoder/VideoDecoder) |

---

#### 5. Alur Data / Arsitektur Sistem (10 poin) — ⭐ 8/10

**Kelebihan:**
- Alur pipeline di README sangat jelas: Input → Akuisisi → Kompresi → Keamanan → Distribusi → Verifikasi
- Navigasi antar modul di aplikasi sudah terstruktur (studio → compression → security → distribution → evaluation)
- Urutan wajib pipeline didokumentasikan: redact → compress → watermark → encrypt

**Gap:**
- Alur data antara modul **tidak terhubung secara teknis** — setiap modul berdiri sendiri tanpa state sharing

---

#### 6. Rencana Eksperimen & Pengukuran (10 poin) — ⭐ 6/10

**Kelebihan:**
- Tabel metrik evaluasi sudah ada di evaluation page
- Parameter yang diubah (Q factor) sudah bisa digeser interaktif
- Target penerimaan jelas (PSNR > 35 dB, SSIM > 0.90, BER < 0.05)

**Gap Kritis:**
- ⚠️ Kolom "Hasil Evaluasi Aktual" di evaluation page mengklaim semua "Memenuhi Target" — tapi **beberapa metrik bukan hasil kalkulasi real**
- ⚠️ Tidak ada eksperimen perbandingan **multi-parameter** (misalnya: Q = 10, 30, 50, 70, 90 → tabel PSNR/SSIM/ratio)
- ⚠️ Tidak ada grafik/chart eksperimen (line chart PSNR vs Q, bar chart comparison, dll.)

---

## BAGIAN 4: REKOMENDASI TINDAKAN UNTUK MEMAKSIMALKAN NILAI

### 🔴 PRIORITAS KRITIS (Wajib Sebelum Presentasi)

#### A. Fix SSIM — Implementasi Rumus Sesungguhnya
**Status saat ini:** Formula linear palsu
**Yang harus dilakukan:** Implementasi SSIM per-block atau per-window sesuai rumus Wang et al. (2004):

```
SSIM(x,y) = (2μxμy + C1)(2σxy + C2) / (μx² + μy² + C1)(σx² + σy² + C2)
```

Ini harus dihitung dari pixel data asli dan reconstructed, **bukan dari MSE**.

> [!CAUTION]
> Jika dosen bertanya "bagaimana SSIM dihitung?" dan kalian tidak bisa menjelaskan rumus + implementasinya, ini bisa menjatuhkan nilai di aspek 3 (Pemetaan Materi) dan aspek 4 (Core Processing) sekaligus — total **40 poin** terancam.

#### B. Fix Compressed Size — Hitung dari Actual Encoded Data
**Yang harus dilakukan:**
- Setelah quantization, hitung jumlah non-zero coefficients
- Implementasi zigzag scan → RLE encoding → hitung actual byte output
- Bandingkan dengan `canvas.toBlob('image/jpeg', quality)` untuk perbandingan realistis

#### C. Implementasikan Huffman Encoding (Minimal Sederhana)
Saat ini zigzag + RLE + Huffman **disebutkan di README tapi tidak diimplementasikan sama sekali**.
- Minimal: implementasi frequency table + prefix codes dari hasil RLE
- Tampilkan tabel Huffman dan hasil encoded bitstream di UI

#### D. Buat Perbandingan JPEG/WebP yang Riil
**Saat ini:** Metrik JPEG dan WebP di-fake (`compressedSizeKb * 1.05`, `psnr + 0.4`)
**Harus:** Gunakan `canvas.toBlob('image/jpeg', q)` dan `canvas.toBlob('image/webp', q)` → hitung PSNR/SSIM dari decoded result vs original

---

### 🟠 PRIORITAS TINGGI (Sangat Memperkuat Nilai)

#### E. Tambahkan Grafik/Chart Eksperimen
Dosen mengharapkan **data eksperimen yang bisa dianalisis**. Tambahkan:
- **Line chart:** PSNR vs Q (untuk Q = 5, 10, 20, 30, 50, 65, 80, 95)
- **Line chart:** SSIM vs Q
- **Bar chart:** Compression Ratio: MUNINN DCT vs JPEG vs WebP
- **Scatter plot:** Trade-off kualitas (PSNR) ↔ ukuran file

Bisa menggunakan Chart.js atau recharts (sudah ada React).

#### F. Implementasi AES-256-GCM yang Sebenarnya
WebCrypto API sudah tersedia di browser — tinggal dipakai:
```js
const key = await crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, ['encrypt','decrypt']);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, plaintext);
```
Tampilkan: plaintext size → ciphertext size → encryption time → decryption + verification

#### G. Implementasi DCT Watermark yang Sebenarnya
Sudah ada DCT forward/inverse di kompresi — bisa diextend:
1. Pilih koefisien mid-frequency (u+v ∈ [3,7]) dari beberapa block
2. Embed bit string recipient tag ke koefisien tersebut
3. Extract dan hitung BER setelah re-quantization

#### H. Buat Hash Chain yang Real End-to-End
Saat ini H0 dan H1 dihitung real di studio, tapi H2-H4 hardcoded.
Hubungkan pipeline: output dari modul 1 → input modul 2 → hash H2 dihitung dari actual compressed data → dst.

---

### 🟡 PRIORITAS SEDANG (Nice-to-Have untuk Nilai Sempurna)

#### I. Hubungkan Pipeline Antar Modul
Saat ini setiap modul adalah halaman terpisah tanpa data flow:
- Simpan intermediate results ke browser storage (IndexedDB / sessionStorage)
- Flow: Upload gambar → Studio (redact) → Compression (DCT) → Security (encrypt + watermark) → Distribution (stream/download)

#### J. Tambahkan "Pemetaan Materi" Page yang Eksplisit
Buat tabel di PPT dan/atau di web:

| Materi Kuliah | Digunakan di Modul | Implementasi |
|:---|:---|:---|
| Representasi citra (pixel, resolusi, bit depth) | Modul 1 & 2 | Canvas ImageData, RGB → YCbCr |
| Sampling & Kuantisasi | Modul 2 | DCT quantization matrix |
| Kompresi Lossy (DCT, JPEG) | Modul 2 | Full DCT 8×8 pipeline |
| Entropi Coding (Huffman, RLE) | Modul 2 | Zigzag → RLE → Huffman |
| Metrik Kualitas (PSNR, SSIM) | Modul 2 | Calculated per-block |
| Audio Sampling & Filtering | Modul 1 | Web Audio API, BiquadFilter |
| Streaming Multimedia (HLS) | Modul 4 | Multi-bitrate rendition |
| Watermarking | Modul 3 | DCT mid-frequency embedding |
| Keamanan Multimedia | Modul 3 | AES-GCM, SHA-256, ECDSA |
| Color Space Conversion | Modul 1 & 2 | RGB → Luminance (Y channel) |

#### K. Video Processing (Minimal)
Klaim video WebCodecs ada di README tapi tidak terimplementasi.
Minimal: tampilkan frame extraction dari video → apply DCT per frame → measure PSNR/SSIM per frame.

---

### 🟢 BONUS (Jika Ada Waktu)

#### L. Implementasi HLS Riil dengan hls.js
- Generate beberapa segment `.ts` dari video
- Buat master `.m3u8` playlist
- Gunakan `hls.js` library (sudah disebutkan di README) untuk real adaptive playback

#### M. Desktop Apps Integration
Ada `presentation_shield.py` (77KB) dan `witness_shield.py` (53KB) — ini bisa jadi demo tambahan yang mengesankan jika diintegrasikan.

---

## RINGKASAN PRIORITAS TINDAKAN

| Prioritas | Tindakan | Impact pada Nilai | Estimasi Effort |
|:---:|:---|:---:|:---:|
| 🔴 | Fix SSIM (rumus asli) | **+5~8 poin** | 2-3 jam |
| 🔴 | Fix compressed size (dari data riil) | **+3~5 poin** | 1-2 jam |
| 🔴 | Implementasi Zigzag + RLE + Huffman | **+5~8 poin** | 3-5 jam |
| 🔴 | Fix perbandingan JPEG/WebP (riil) | **+3~5 poin** | 2-3 jam |
| 🟠 | Grafik/chart eksperimen | **+5~7 poin** | 2-3 jam |
| 🟠 | Implementasi AES-256-GCM real | **+3~5 poin** | 2-3 jam |
| 🟠 | Implementasi DCT watermark real | **+3~5 poin** | 3-5 jam |
| 🟠 | Hash chain end-to-end real | **+2~3 poin** | 2-3 jam |
| 🟡 | Pipeline state terhubung | **+2~3 poin** | 3-5 jam |
| 🟡 | Tabel pemetaan materi eksplisit | **+3~5 poin** | 1 jam |
| 🟡 | Video frame processing minimal | **+2~3 poin** | 3-4 jam |

---

## KESIMPULAN AKHIR

> [!IMPORTANT]
> **Proyek kalian secara KONSEP dan DESAIN sudah SANGAT KUAT** — jauh di atas rata-rata "proyek yang belum cukup" (galeri foto, music player, CRUD gambar, dll.). README-nya profesional, arsitekturnya matang, dan UI-nya premium.
> 
> **TAPI**, ada celah kritis: **beberapa proses multimedia inti yang diklaim** (SSIM, Huffman, AES-GCM, ECDSA, watermarking, HLS) **masih berupa simulasi UI atau angka palsu**. Jika dosen mendalami dan bertanya "tunjukkan kode implementasi SSIM-nya" atau "di mana Huffman encoding berjalan?", jawaban yang kosong bisa **menjatuhkan 20-30 poin** dari total 100.
> 
> **Target realistis:** Dengan mengerjakan semua item 🔴 (KRITIS), proyek ini bisa mendapat **85-92 dari 100**. Dengan tambahan item 🟠, target bisa naik ke **92-97**.

---

*Dokumen ini dibuat berdasarkan analisis mendalam terhadap seluruh source code di repositori (21 component files, 4 modul inti, 1 server API, 2 desktop apps) dan dipetakan terhadap 7 aspek penilaian yang disediakan.*
