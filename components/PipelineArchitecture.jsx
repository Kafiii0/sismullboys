'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Video, EyeOff, Sliders, ShieldCheck, Radio, 
  CheckCircle2, ArrowRight, Lock, Key, AlertTriangle, Sparkles 
} from 'lucide-react';

export default function PipelineArchitecture() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Sumber Bukti Audit',
      module: 'Ingestion Layer',
      icon: Video,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-950/40',
      summary: 'Menangkap aliran raw feed layar 1080p, webcam, audio insiden, atau dokumen PoC temuan keamanan.',
      details: [
        'Input: Layar peramban via MediaDevices API (getDisplayMedia)',
        'Input: Mikrofon insiden penanganan forensik via Web Audio API',
        'Input: Berkas PoC / JSON hasil scan ReconForge & BreachWatch',
        'Payload mentah: 1080p 30fps RGB mencapai 186.6 MB/s (~56 GB / 5 menit)'
      ],
      href: '/studio'
    },
    {
      num: '02',
      title: 'Akuisisi & Redaksi',
      module: 'Modul 1 (CBK2CAB3)',
      icon: EyeOff,
      color: 'from-yellow-500 to-amber-600',
      badgeColor: 'border-yellow-500/30 text-yellow-300 bg-yellow-950/40',
      summary: 'Perhitungan hash awal H0, pendeteksian otomatis data sensitif (regex/OCR), dan penyamaran sebelum data keluar perangkat.',
      details: [
        'Hitung H0 = SHA-256(Raw Evidence Bytes)',
        'Regex Pattern Hunter: Deteksi API key (AKIA...), password, IP address, email, kartu kredit',
        'Redaksi Solid Blackout Box (memusnahkan piksel secara matematis) & Mosaik 16x16',
        'Filtering Audio: High-pass filter cut-off 120Hz & speech normalization',
        'Kepatuhan: Melindungi PII sesuai UU No. 27 Tahun 2022 (UU PDP)'
      ],
      href: '/studio'
    },
    {
      num: '03',
      title: 'Kompresi Citra DCT',
      module: 'Modul 2 (CBK2CAB3)',
      icon: Sliders,
      color: 'from-red-500 to-rose-600',
      badgeColor: 'border-red-500/30 text-red-300 bg-red-950/40',
      summary: 'Transformasi DCT 8x8, kuantisasi dengan faktor kualitas Q, zigzag scan, RLE, dan pengkodean Huffman.',
      details: [
        'Hitung H1 = SHA-256(H0 + Redacted Bytes)',
        'Forward DCT 8x8: Memisahkan komponen frekuensi spasial (DC vs AC)',
        'Kuantisasi Matriks Q (slider Q 1-100) untuk kompresi lossy berbobot',
        'Zigzag scan + Run-Length Encoding (RLE) + Huffman coding',
        'Evaluasi objektif: PSNR > 35 dB & SSIM > 0.90 menjamin keterbacaan font terminal'
      ],
      href: '/compression'
    },
    {
      num: '04',
      title: 'Keamanan & Kustodi',
      module: 'Modul 3 (CBK2CAB3)',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
      summary: 'Penanaman DCT watermark per penerima, penguncian rantai kustodi SHA-256, tanda tangan ECDSA, dan enkripsi AES-256-GCM.',
      details: [
        'Hitung H2 = SHA-256(H1 + Compressed Bytes)',
        'Robust Watermarking: Sisipkan ID penerima pada koefisien DCT frekuensi menengah (tahan rekompresi)',
        'Tanda tangan digital investigator dengan kunci ECDSA kurva P-256',
        'Client-side AES-256-GCM: Enkripsi terotentikasi menghasilkan ciphertext + auth tag',
        'Kunci dibungkus ECDH + HKDF; server berstatus zero-knowledge'
      ],
      href: '/security'
    },
    {
      num: '05',
      title: 'Distribusi Adaptif',
      module: 'Modul 4 (CBK2CAB3)',
      icon: Radio,
      color: 'from-sky-500 to-blue-600',
      badgeColor: 'border-sky-500/30 text-sky-300 bg-sky-950/40',
      summary: 'Pengemasan HLS RFC 8216 multi-rendisi (1080p, 720p, 360p) dengan tautan bertanda tangan berkedaluwarsa.',
      details: [
        'Tiga rendisi adaptif: 1080p FHD (6.5Mbps), 720p HD (2.5Mbps), 360p SD (650kbps)',
        'Signed Expiring URLs dengan HMAC signature & countdown kedaluwarsa (10m, 1h, 24h)',
        'Simulasi throttling jaringan: Fast Fiber, 4G LTE, 3G, dan Constrained Edge',
        'Metrik QoS: Pengukuran startup latency (target <= 1.2s) dan rebuffering events'
      ],
      href: '/distribution'
    },
    {
      num: '06',
      title: 'Penyajian & Verifikasi',
      module: 'Verification Layer',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-purple-600',
      badgeColor: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/40',
      summary: 'Portal klien mendekripsi bukti dengan kunci resmi, memvalidasi seluruh mata rantai kustodi, dan memunculkan status keaslian.',
      details: [
        'Dekripsi paket AES-256-GCM di peramban klien',
        'Validasi keutuhan rantai hash H0 -> H1 -> H2 -> H3 -> H4',
        'Verifikasi tanda tangan investigator dengan ECDSA Public Key',
        'Ekstraksi watermark penerima untuk pembuktian kebocoran',
        'Hasil Vonis: [VALID & ASLI] atau [TAMPERED / INTEGRITY VIOLATED]'
      ],
      href: '/distribution'
    }
  ];

  return (
    <section id="pipeline-flow" className="py-20 bg-[#07070B] border-b border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ALUR DATA SISTEM & RANTAI KUSTODI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            Siklus 6 Tahap Pipeline Multimedia MUNINN
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base font-sans">
            Mengikuti urutan pemrosesan standar baku: bukti digital disamarkan, dikompresi, diberi watermark, dan dienkripsi sebelum transmisi.
          </p>
        </div>

        <div className="mb-12 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#101018] to-amber-950/40 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-red-400 font-semibold">
                Urutan Wajib Kriptografi & Kompresi:
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-white mt-0.5">
                Samarkan ➔ Kompres ➔ Beri Watermark ➔ Enkripsi
              </div>
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-sans max-w-md bg-black/40 p-3 rounded-xl border border-white/5">
            ⚠️ <strong className="text-zinc-200">Prinsip Entropi:</strong> Data yang dienkripsi memiliki entropi informasi maksimal menyerupai derau acak, sehingga <span className="text-red-400 font-semibold">tidak dapat dikompresi</span>. Enkripsi selalu dieksekusi terakhir.
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-[#151520] border-red-500 shadow-lg shadow-red-950/40 scale-[1.02]'
                    : 'bg-[#0E0E14] border-white/[0.07] hover:border-white/20 hover:bg-[#12121A]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-zinc-400">{st.num}</span>
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${st.color} text-white`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="font-semibold text-xs text-white line-clamp-1 font-sans">{st.title}</div>
                <div className="text-[10px] text-zinc-400 font-mono mt-1">{st.module}</div>
              </button>
            );
          })}
        </div>

        {steps[activeStep] && (
          <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${steps[activeStep].badgeColor}`}>
                    Tahap {steps[activeStep].num} · {steps[activeStep].module}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-mono">
                  {steps[activeStep].title}
                </h3>
                <p className="text-zinc-300 text-sm max-w-2xl font-sans">
                  {steps[activeStep].summary}
                </p>
              </div>

              <Link
                href={steps[activeStep].href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-red-950/50 shrink-0"
              >
                <span>Buka Modul Terkait</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps[activeStep].details.map((dt, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-300 font-mono">{dt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
