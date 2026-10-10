#  Secure Multimedia Evidence Pipeline



---

## 📑 Daftar Isi
1. [Asal Nama & Filosofi](#1-asal-nama--filosofi)
2. [Ringkasan Eksekutif](#2-ringkasan-eksekutif)
3. [Masalah yang Diselesaikan & Data Pendukung](#3-masalah-yang-diselesaikan--data-pendukung)
4. [Visi dan Misi](#4-visi-dan-misi)
5. [Empat Modul Multimedia & Alasan Pemilihan Teknik](#5-empat-modul-multimedia--alasan-pemilihan-teknik)
6. [Alur Data Sistem & Rantai Kustodi](#6-alur-data-sistem--rantai-kustodi)
7. [Status Pengembangan](#7-status-pengembangan)
8. [Metrik Evaluasi & Target Penerimaan](#8-metrik-evaluasi--target-penerimaan)
9. [Spesifikasi Teknologi](#9-spesifikasi-teknologi)
10. [Etika, Keamanan, dan Kepatuhan Regulasi](#10-etika-keamanan-dan-kepatuhan-regulasi)
11. [Peta Jalan per Checkpoint](#11-peta-jalan-per-checkpoint)
12. [Kesiapan Kemitraan dan HKI](#12-kesiapan-kemitraan-dan-hki)
13. [Panduan Instalasi & Menjalankan Proyek](#13-panduan-instalasi--menjalankan-proyek)
14. [Struktur Tim Pengembang](#14-struktur-tim-pengembang)
15. [Referensi Ilmiah & Industri](#15-referensi-ilmiah--industri)

---

## 1. Ringkasan Eksekutif

Audit keamanan siber (*penetration testing*) dan penanganan insiden (*incident response*) menghasilkan bukti multimedia yang masif, sensitif, dan harus dapat dipertanggungjawabkan di hadapan hukum maupun manajemen eksekutif. **MUNINN** adalah *pipeline multimedia end-to-end* yang memperlakukan bukti digital layaknya layanan streaming komersial modern memperlakukan video resolusi tinggi, namun dengan standar kerahasiaan (*confidentiality*) dan integritas (*chain of custody*) yang jauh lebih tinggi.

### Kedaulatan Data Klien (Client-Side First)
Seluruh pemrosesan berat dijalankan secara **klien (client-side di peramban)**:
* Data mentah bukti tidak pernah meninggalkan perangkat investigator sebelum teks sensitif disamarkan (*redacted*) dan paketnya dienkripsi (*AES-256-GCM*).
* Server hanya menerima, menyimpan, dan menyajikan paket bukti terenkripsi secara kriptografis (*zero-knowledge backend*).

Proyek ini tumbuh dari fondasi situs **PROMETHEUS Cybersecurity** (Next.js 14, Three.js 3D WebGL, Tailwind CSS). Fondasi tersebut dipertahankan sebagai lapisan penyajian, portal klien, dan sumber bukti (*PoC artifacts*); alur rekayasa sistem multimedianya dibangun secara kokoh di atasnya.

---

## 3. Masalah yang Diselesaikan & Data Pendukung

Tanpa *pipeline* khusus multimedia, bukti audit keamanan biasanya dibagikan lewat aplikasi perpesanan instan (WhatsApp/Telegram), surel, atau penyimpanan awan biasa. Praktik ini memicu empat masalah:

| Dimensi Masalah | Penjelasan Teknis & Risiko Operasional |
| :--- | :--- |
| **1. Ukuran (*Payload Size*)** | Video rekaman layar 1080p, 30 fps, 24-bit RGB tanpa kompresi:<br>`1920 × 1080 × 3 × 30 = 186.624.000 byte/detik (≈ 186,6 MB/s)`<br>Untuk rekaman PoC 5 menit mencapai **~56 GB**. Kompresi asal-asalan merusak keterbacaan teks (*font blurring*) pada terminal dan kode eksploitasi. |
| **2. Kerahasiaan (*Confidentiality*)** | Tangkapan layar sering memuat token API, *session cookie*, surel, atau data pribadi karyawan/nasabah yang tidak disamarkan, melanggar **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**. |
| **3. Integritas (*Integrity & Custody*)** | Penerima tidak dapat membuktikan apakah berkas belum diubah atau dipotong; pengirim tidak memiliki jejak rantai kustodi (*chain of custody*). |
| **4. Distribusi (*Adaptive Streaming*)** | Penerima dengan jaringan seluler lambat atau koneksi terbatas gagal memutar bukti berukuran besar karena ketiadaan pemutaran adaptif (*multi-bitrate streaming*). |

### Data Pendukung Empiris
* **BSSN (Badan Siber dan Sandi Negara):** Mencatat lebih dari **5,16 miliar anomali trafik** di Indonesia pada Januari–November 2025 (~182 anomali per detik), dengan 93,78% berbasis malware. Kapasitas pemantauan BSSN belum mencapai 10% dari seluruh trafik internet nasional.
* **Verizon DBIR (Data Breach Investigations Report):** **60%** insiden keamanan sektor keuangan melibatkan faktor manusia dan **30%** disebabkan oleh pihak ketiga.
* **Ericsson Mobility Report:** Video menyumbang sekitar **75% dari seluruh trafik data seluler global** pada akhir 2025; kompresi efisien dan distribusi adaptif adalah kebutuhan riil tak terelakkan.
* **Kaitan Aplikasi Nyata:** Debrief temuan audit jarak jauh dan pengiriman rekaman PoC kepada klien adalah penerapan langsung dari pipeline ini.

---

## 4. Visi dan Misi

### Visi
Menjadi alur terbuka dan dapat diverifikasi bagi bukti multimedia sensitif, sehingga setiap rekaman audit dapat dibagikan tanpa membocorkan data dan tanpa kehilangan keabsahannya.

### Misi
1. **Memperkecil ukuran bukti multimedia** tanpa mengorbankan keterbacaan, dan membuktikannya dengan metrik terukur.
2. **Melindungi kerahasiaan sejak sumber:** redaksi otomatis dan enkripsi di sisi klien.
3. **Menjamin integritas dan keaslian** (hash chain, tanda tangan digital) serta keterlacakan (watermark per penerima).
4. **Memudahkan distribusi ke penerima** dengan kondisi jaringan beragam (HLS adaptif, tautan kedaluwarsa).
5. **Mengevaluasi setiap modul secara objektif** (PSNR, SSIM, rasio kompresi, QoS, BER).

---

## 5. Empat Modul Multimedia & Alasan Pemilihan Teknik

### Matriks Empat Modul Inti
| Modul | Fungsi Utama | Teknik Utama | Metrik Evaluasi |
| :--- | :--- | :--- | :--- |
| **1. Akuisisi & Pengolahan** | Menangkap layar/webcam/mikrofon atau menerima unggahan; menemukan dan menyamarkan data sensitif. | • `MediaDevices` + `MediaRecorder`<br>• OCR (`Tesseract.js`) + Regex Token Scanner<br>• Redaksi Mosaik Blok / Kotak Solid<br>• Konvolusi Gaussian sebagai pembanding<br>• High-pass filter + normalisasi audio | • Waktu proses per frame (ms)<br>• Recall redaksi sensitif (%) |
| **2. Kompresi** | Memperkecil ukuran bukti sambil menjaga keterbacaan teks/tampilan. | • **Citra:** DCT 8×8 → Kuantisasi ($Q$) → Zigzag → RLE → Huffman Codec<br>• **Pembanding:** Standar JPEG & WebP<br>• **Video & Audio:** WebCodecs (H.264/VP9) & Opus | • PSNR (dB)<br>• SSIM (0–1)<br>• Rasio kompresi (%)<br>• Akurasi OCR sebelum vs sesudah |
| **3. Keamanan** | Menjaga kerahasiaan, integritas, keaslian, dan keterlacakan pembocor. | • AES-256-GCM (client-side)<br>• SHA-256 Hash Chain Manifest<br>• Tanda tangan digital ECDSA P-256<br>• Kunci dibungkus ECDH + HKDF<br>• Watermark pada koefisien DCT frekuensi menengah | • BER watermark setelah rekompresi<br>• Deteksi tamper (VALID / TAMPERED)<br>• Overhead enkripsi (ms) |
| **4. Distribusi** | Mengirim bukti ke penerima dengan aman dan adaptif. | • HLS (RFC 8216) tiga rendisi: 1080p, 720p, 360p<br>• Player adaptif dengan simulasi throttling<br>• Tautan bertanda tangan + kedaluwarsa (*signed expiring links*) | • Startup delay (ms)<br>• Rebuffering count & duration<br>• Perpindahan bitrate jaringan |

### Alasan Pemilihan Teknik (Ringkas)
* **DCT dibanding DWT/PNG:** Lebih sederhana dan memberi kualitas memadai pada Q menengah, jauh lebih kecil daripada PNG, dan domain koefisiennya dipakai ulang untuk watermark (satu domain, dua fungsi).
* **Mosaik/Kotak Solid dibanding Blur Ringan:** Blur dapat dipulihkan sebagian lewat dekonvolusi (*unblur filter*). Kotak solid dan mosaik kasar memusnahkan informasi piksel sehingga tidak dapat direkayasa balik.
* **GCM dibanding CBC:** Kerahasiaan dan integritas sekaligus (*Authenticated Encryption*) tanpa MAC terpisah.
* **Watermark DCT dibanding LSB:** LSB hancur total oleh kompresi lossy; koefisien DCT frekuensi tengah mampu bertahan dari kompresi berulang.
* **HLS dibanding DASH/WebRTC:** Pustaka pemutar matang dan didukung native di Safari; WebRTC untuk live interaktif dua arah, sedangkan bukti audit adalah arsip *on-demand*.

---

## 6. Alur Data Sistem & Rantai Kustodi

```
  [ Sumber Bukti: Layar / Webcam / Mikrofon / Unggahan / JSON PoC ]
                               │
                               ▼
  [ Akuisisi & Pengolahan: Hash awal H0, OCR + Redaksi, Normalisasi Audio ]
                               │
                               ▼
  [ Kompresi: DCT 8x8 + RLE + Huffman, WebCodecs, Opus, Kalkulasi PSNR/SSIM ]
                               │
                               ▼
  [ Keamanan: Watermark Penerima DCT, AES-256-GCM, Hash Chain Manifest H1..H4 ]
                               │
                               ▼
  [ Distribusi: HLS Multi-Bitrate, Tautan Bertanda Tangan & Kedaluwarsa ]
                               │
                               ▼
  [ Penyajian & Verifikasi: Putar Adaptif, Dekripsi, Cek Hash & Tanda Tangan ]
                   --> VERDICT: VALID / TAMPERED <--
```

### Urutan Wajib Pipeline
> **Urutan Wajib:** `samarkan -> kompres -> beri watermark -> enkripsi`  
> *Data terenkripsi tidak dapat dikompresi (entropi maksimal), sehingga enkripsi selalu terakhir.*

### Rantai Kustodi (Hash Chain)
Hash setiap tahap dicatat di manifest dan saling mengunci (*hash chain*). Perubahan pada tahap mana pun akan terdeteksi saat verifikasi independen oleh klien atau auditor eksternal.

---

## 7. Status Pengembangan

| Komponen | Status Implementasi |
| :--- | :--- |
| **Situs korporat, globe 3D, antarmuka** (Next.js 14, Three.js, Tailwind) | ✅ Berjalan Penuh |
| **ReconForge & BreachWatch PoC** (Sumber bukti temuan kerentanan) | ✅ Berjalan Penuh |
| **Evidence Studio (Modul 1: Akuisisi & Redaksi)** | ✅ Berjalan Interaktif |
| **Laboratorium Kompresi DCT (Modul 2: DCT, Q, PSNR, SSIM)** | ✅ Berjalan Interaktif |
| **Keamanan & Kustodi (Modul 3: Hash Chain, Watermark, AES-GCM)** | ✅ Berjalan Interaktif |
| **Distribusi Adaptif (Modul 4: HLS Simulator, Verifikator Bukti)** | ✅ Berjalan Interaktif |

---

## 8. Metrik Evaluasi & Target Penerimaan

| Modul | Metrik | Target Penerimaan |
| :--- | :--- | :--- |
| **Akuisisi & Pengolahan** | Recall redaksi pada set tangkapan layar sintetis | Seluruh pola sensitif yang ditanam tersamarkan (100%) |
| **Kompresi** | PSNR, SSIM, rasio kompresi | Dilaporkan per nilai Q dan dibandingkan dengan JPEG/WebP (PSNR > 35 dB, SSIM > 0.90) |
| **Kompresi** | Akurasi OCR sebelum vs sesudah | Penurunan akurasi pada Q terpilih sekecil mungkin |
| **Keamanan** | Deteksi tamper | Semua berkas yang diubah ditandai TAMPERED pada set uji |
| **Keamanan** | BER watermark setelah rekompresi | Dilaporkan pada beberapa nilai Q (BER < 0.05) |
| **Distribusi** | Startup delay, rebuffering, perpindahan bitrate | Diukur pada profil throttling jaringan berbeda (Fast 4G, 3G, Edge) |

---

## 9. Teknologi

* **Aplikasi:** Next.js 14 (App Router), React 18, Tailwind CSS, Three.js, Framer Motion
* **Multimedia:** MediaDevices/MediaRecorder, WebCodecs, Web Audio API, Canvas/ImageData, hls.js
* **Pengolahan:** Canvas pixel manipulation, Regex pattern detector, Tesseract.js
* **Kriptografi:** WebCrypto API (AES-256-GCM, ECDSA, ECDH, HKDF, SHA-256)
* **Deployment:** Vercel / Node.js Local Server

---

## 10. Etika, Keamanan, dan Kepatuhan

* **Proyek Akademik:** Seluruh data uji bersifat sintetis untuk keperluan Tugas Besar CBK2CAB3.
* **Nama Perusahaan:** Bersifat ilustratif untuk mendemonstrasikan sistem tata kelola bukti digital.
* **Regulasi:** Mematuhi UU ITE (UU No. 1 Tahun 2024) dan UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022).
* **Pencatatan AI:** Penggunaan AI dalam pengembangan dicatat sesuai kebijakan akademik mata kuliah.

---

## 11. Peta Jalan per Checkpoint

| Checkpoint | Minggu | Target Capaian |
| :--- | :--- | :--- |
| **Proposal** | 4 | Proposal dan peta rubrik; validasi masalah lewat wawancara; repositori dan backlog terisi |
| **Sprint 1** | 11 | Akuisisi & Pengolahan berjalan; kompresi citra v1 (DCT, kuantisasi, zigzag, RLE) dengan panel PSNR/rasio; hash dan manifest |
| **Sprint 2** | 13 | Huffman, SSIM, pembanding JPEG/WebP; AES-GCM + ECDSA + verifikator; portal tautan bertanda; video WebCodecs + HLS; jalur citra terhubung penuh |
| **90% Selesai** | 14 | Empat modul terhubung pada citra dan video; watermark; uji QoS, tamper, watermark; draf laporan; skrip demo |
| **Presentasi Final** | Sesuai jadwal | Demo end-to-end, laporan dengan data uji, catatan perubahan terhadap proposal |

---

## 12. Kesiapan Kemitraan dan HKI

* **Kemitraan:** Calon segmen mitra mencakup penyedia jasa pentest, konsultan keamanan, dan tim CSIRT kampus atau instansi daerah.
* **Hak Cipta:** Pendaftaran hak cipta kode program, antarmuka studio, dan dokumentasi melalui DJKI.
* **Merek:** Penelusuran nama dan logo di PDKI (kelas 9 dan 42).

---

## 13. Menjalankan Proyek

```bash
# 1. Pindah ke direktori proyek
cd "d:/Tel U/tubes-sistem-multimedia"

# 2. Jalankan server pengembangan lokal
npm run dev
# Akses di http://localhost:3000

# 3. Build produksi
npm run build
npm run start
```

---

## 14. Tim Pengembang

| Anggota | Modul Utama | Tanggung Jawab |
| :--- | :--- | :--- |
| **[Nama 1 — NIM]** | **Modul 1:** Akuisisi & Pengolahan | Antarmuka Evidence Studio, Screen/Webcam, OCR Regex, Redaksi Mosaik/Solid, Audio Normalization |
| **[Nama 2 — NIM]** | **Modul 2:** Kompresi Citra & Video | Algoritma DCT 8×8, Kuantisasi Q, Zigzag, RLE, Huffman Codec, Metrik PSNR & SSIM |
| **[Nama 3 — NIM]** | **Modul 3:** Distribusi & Portal Klien | HLS Multi-Bitrate RFC 8216, Player Adaptif, Throttling Simulator, Signed Expiring URLs |
| **[Nama 4 — NIM]** | **Modul 4:** Keamanan & Kustodi | WebCrypto AES-256-GCM, Hash Chain Manifest SHA-256, ECDSA Signature, Robust DCT Watermark, Tamper Detector |

* **Dosen Pengampu:** [Dosen Pengampu Mata Kuliah CBK2CAB3]
* **Institusi:** Telkom University Bandung

---

## 15. Referensi

1. Investortrust.id, *"Serangan Siber Capai 182 Kali per Detik"* — Analisis Tren Anomali Trafik BSSN.
2. Infobanknews, *"BSSN Ungkap 5,2 Miliar Anomali Trafik Internet"* — Rekapitulasi Malware & Anomali Nasional.
3. Bisnis.com, *"BSSN Temukan 4,4 Miliar Trafik Anomali Menyasar ke RI"* — Data Serangan Siber.
4. Ericsson, *"Mobile Traffic Update Q1 2026"* — Proyeksi dan Komposisi Trafik Video Seluler Global.
