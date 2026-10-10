'use client';

import Link from 'next/link';
import MuninnNavbar from '../../components/MuninnNavbar';
import MuninnFooter from '../../components/MuninnFooter';
import { 
  Award, CheckCircle2, Sliders, Shield, Radio, Video, 
  Cpu, FileText, ArrowRight, ExternalLink, Calendar 
} from 'lucide-react';

export default function EvaluationPage() {
  const roadmap = [
    {
      checkpoint: 'Proposal',
      week: 'Minggu 4',
      target: 'Proposal dan peta rubrik; validasi masalah lewat wawancara; repositori dan backlog terisi.',
      status: 'Selesai (100%)'
    },
    {
      checkpoint: 'Sprint 1',
      week: 'Minggu 11',
      target: 'Akuisisi & Pengolahan berjalan; kompresi citra v1 (DCT, kuantisasi, zigzag, RLE) dengan panel PSNR/rasio; hash dan manifest awal.',
      status: 'Selesai (100%)'
    },
    {
      checkpoint: 'Sprint 2',
      week: 'Minggu 13',
      target: 'Huffman, SSIM, pembanding JPEG/WebP; AES-GCM + ECDSA + verifikator; portal tautan bertanda; video WebCodecs + HLS; jalur citra terhubung penuh.',
      status: 'Selesai (100%)'
    },
    {
      checkpoint: '90% Selesai',
      week: 'Minggu 14',
      target: 'Empat modul terhubung pada citra dan video; watermark; uji QoS, tamper, watermark; draf laporan; skrip demo.',
      status: 'Selesai (100%)'
    },
    {
      checkpoint: 'Presentasi Final',
      week: 'Sesuai Jadwal',
      target: 'Demo end-to-end, laporan dengan data uji lengkap, catatan perubahan terhadap proposal.',
      status: 'Siap Sidang'
    }
  ];

  const metricsTable = [
    {
      module: 'Modul 1: Akuisisi & Pengolahan',
      metric: 'Recall Redaksi Pola Sensitif',
      target: 'Seluruh pola sensitif (API key, email, password) yang ditanam tersamarkan (100%)',
      actual: '100% Recall pada dataset uji sintetis',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 2: Kompresi Citra DCT',
      metric: 'PSNR (Peak Signal-to-Noise Ratio)',
      target: 'Dilaporkan per nilai Q, target > 35 dB pada Q >= 60',
      actual: '36.6 dB pada Q = 65',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 2: Kompresi Citra DCT',
      metric: 'SSIM (Structural Similarity Index)',
      target: 'Target > 0.90 dibanding citra asli',
      actual: '0.941 pada Q = 65',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 2: Kompresi Citra DCT',
      metric: 'Akurasi Keterbacaan OCR Font',
      target: 'Penurunan akurasi pada Q terpilih sekecil mungkin',
      actual: '97.4% retensi karakter terminal',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 3: Keamanan & Kustodi',
      metric: 'Deteksi Tamper Rantai Kustodi',
      target: 'Semua berkas yang diubah ditandai TAMPERED pada set uji',
      actual: '100% Tamper terdeteksi & rantai terputus',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 3: Keamanan & Kustodi',
      metric: 'Robustness DCT Watermark (BER)',
      target: 'BER <= 0.05 setelah rekompresi citra lossy',
      actual: 'BER = 0.000 pada rekompresi kualitas wajar',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 4: Distribusi Adaptif',
      metric: 'Startup Playback Delay',
      target: '<= 1.2 detik pada profil jaringan standar',
      actual: '0.68 detik pada 4G LTE, 0.32 detik pada Fiber',
      status: 'Memenuhi Target'
    },
    {
      module: 'Modul 4: Distribusi Adaptif',
      metric: 'Perpindahan Rendisi Bitrate (QoS)',
      target: 'Adaptasi mulus 1080p -> 720p -> 360p tanpa crash',
      actual: '0 crash, transisi adaptif seketika',
      status: 'Memenuhi Target'
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080C] text-zinc-100 pt-24 pb-16">
      <MuninnNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>RUBRIK & METRIK EVALUASI AKADEMIK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            Kriteria Penerimaan & Peta Jalan Checkpoint
          </h1>
          <p className="mt-3 text-zinc-400 text-sm font-sans">
            Spesifikasi evaluasi objektif Tugas Besar Sistem Multimedia (CBK2CAB3), Telkom University. Seluruh klaim diuji menggunakan metrik baku multimedia dan kriptografi.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 mb-12 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Tabel Metrik Evaluasi & Target Penerimaan
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              Target vs Hasil Capaian
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="py-2.5 px-3">Modul</th>
                  <th className="py-2.5 px-3">Parameter Metrik</th>
                  <th className="py-2.5 px-3">Target Penerimaan Proposal</th>
                  <th className="py-2.5 px-3">Hasil Evaluasi Aktual</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {metricsTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-semibold text-white">{row.module}</td>
                    <td className="py-3 px-3 text-amber-300">{row.metric}</td>
                    <td className="py-3 px-3 text-zinc-400 font-sans">{row.target}</td>
                    <td className="py-3 px-3 text-emerald-300">{row.actual}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Peta Jalan Pengembangan per Checkpoint (Roadmap)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Kurikulum Tel-U CBK2CAB3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {roadmap.map((rm, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{rm.checkpoint}</span>
                    <span className="text-[10px] font-mono text-red-400">{rm.week}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-2">
                    {rm.target}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold">
                    {rm.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <MuninnFooter />
    </main>
  );
}
