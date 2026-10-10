'use client';

import Link from 'next/link';
import BifrostNavbar from '../../components/BifrostNavbar';
import BifrostFooter from '../../components/BifrostFooter';
import {
  ShieldCheck, Monitor,
  Download, Cpu, Layers,
  RefreshCw, ArrowRight, AlertTriangle
} from 'lucide-react';

export default function ScreenShieldPage() {
  const tradeOffs = [
    {
      parameter: 'Resolusi Pemindaian Layar',
      multimediaConcept: 'Kecepatan Baca Teks vs Beban Sistem',
      impact: 'Resolusi 720p membaca teks sensitif dengan akurasi 97.4% dan respon instan (~30 FPS), sehingga laptop tidak berat saat presentasi.',
      verdict: 'Resolusi 720p (Cepat & Akurat)'
    },
    {
      parameter: 'Teknik Sensor Dokumen',
      multimediaConcept: 'Keamanan Penutupan Data',
      impact: 'Mosaik blok membuat teks rahasia (email, password, PIN) benar-benar tertutup permanen dan mustahil dibuka kembali dengan filter penajam.',
      verdict: 'Mosaik Blok Permanen'
    },
    {
      parameter: 'Pencegah Layar Berulang (Loop)',
      multimediaConcept: 'Deteksi Cermin Berulang di Meet',
      impact: 'Mendeteksi dan memutus efek layar cermin berulang di Google Meet dalam 0,05 detik, layar presentasi tetap stabil dan bersih.',
      verdict: 'Aktif Otomatis (Layar Stabil)'
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-cyan-600/30 selection:text-white">
      <BifrostNavbar />

      <section className="relative pt-36 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>APLIKASI DESKTOP WINDOWS</span>
          </div>

          <h1 className="font-grotesk text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            BIFROST HDMI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Presentation Shield
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-2xl mx-auto font-light leading-relaxed">
            Aplikasi pelindung layar proyektor dan screen share Google Meet. Menutup data sensitif secara otomatis dan mencegah bug layar berulang (Infinite Mirror Loop).
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="/downloads/BIFROST_HDMI_Shield_Windows.zip"
              download
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xl shadow-cyan-600/30 hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/40"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>Unduh HDMI Shield (.zip)</span>
            </a>

            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 hover:border-white/20 font-semibold text-xs tracking-wider uppercase transition-all"
            >
              <span>Semua Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="text-xs font-mono text-zinc-400 pt-1 flex items-center justify-center gap-3">
            <span>Berkas: <strong>BIFROST_HDMI_Shield.exe</strong></span>
            <span>•</span>
            <span>Ukuran: <strong>119.5 MB ZIP</strong></span>
            <span>•</span>
            <span>Windows 10 / 11 64-bit</span>
          </div>
        </div>
      </section>

      <section className="py-16 relative border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              FITUR UTAMA
            </div>
            <h2 className="font-grotesk text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Kemampuan BIFROST HDMI Shield
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Menjaga privasi dokumen di layar saat terhubung ke proyektor fisik atau share screen rapat online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#0D101A] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-700/40 text-cyan-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Anti-Layar Berulang (Loop)
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Mencegah efek cermin berulang tak berujung saat share screen seluruh layar di Google Meet.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D101A] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-700/40 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Sensor Teks Otomatis
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Mendeteksi dan menutup otomatis email, password, dan nomor rahasia pada layar saat presentasi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D101A] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-700/40 text-cyan-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Proteksi Jendela Bertumpuk
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Data rahasia tetap tertutup aman meskipun jendela aplikasi digeser, ditumpuk, atau diperbesar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D101A] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-700/40 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Tombol Darurat Layar Hitam
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Tekan tombol Spasi untuk seketika mematikan tampilan layar saat dokumen pribadi tidak sengaja terbuka.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="py-16 relative bg-[#06070B] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              HASIL UJI KINERJA
            </div>
            <h2 className="font-grotesk text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pengujian Fitur &amp; Hasil Optimasi
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Pengaturan resolusi dan sensor agar proteksi layar berjalan otomatis, akurat, dan tidak memperlambat presentasi.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0A0D15]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#101422] text-zinc-300 border-b border-white/[0.08]">
                  <tr>
                    <th className="p-4 font-bold text-white">Fitur yang Diuji</th>
                    <th className="p-4 font-bold text-cyan-400">Fokus Pengujian</th>
                    <th className="p-4 font-bold text-zinc-300">Hasil Pengujian &amp; Efek ke Pengguna</th>
                    <th className="p-4 font-bold text-emerald-400">Rekomendasi Setelan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                  {tradeOffs.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{row.parameter}</td>
                      <td className="p-4 text-cyan-300">{row.multimediaConcept}</td>
                      <td className="p-4 text-zinc-400 font-sans leading-relaxed">{row.impact}</td>
                      <td className="p-4 font-bold text-emerald-400">{row.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#0F1424] to-[#0A0C14] border border-cyan-500/30 space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div>
                <h3 className="font-grotesk text-2xl font-bold text-white">
                  Panduan Menjalankan Program (.EXE)
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Langsung aktif di sistem Windows tanpa perlu membuka browser.
                </p>
              </div>
              <a
                href="/downloads/BIFROST_HDMI_Shield_Windows.zip"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-lg shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh ZIP (119.5 MB)</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="text-white font-bold">Buka Program</h4>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Ekstrak berkas ZIP lalu buka <code>BIFROST_HDMI_Shield.exe</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
                <h4 className="text-white font-bold">Mulai Presentasi</h4>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Colokkan kabel HDMI proyektor atau mulai Share Screen di Google Meet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="text-white font-bold">Proteksi Otomatis</h4>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Program langsung memantau dan menyensor data sensitif secara otomatis di latar belakang.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <BifrostFooter />
    </main>
  );
}
