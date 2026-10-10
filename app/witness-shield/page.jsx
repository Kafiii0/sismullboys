'use client';

import Link from 'next/link';
import BifrostNavbar from '../../components/BifrostNavbar';
import BifrostFooter from '../../components/BifrostFooter';
import {
  Video, Mic, ShieldCheck, Download,
  Cpu, ArrowRight, Sliders
} from 'lucide-react';

export default function WitnessShieldPage() {
  const tradeOffs = [
    {
      parameter: 'Buffer Suara (DSP Audio)',
      multimediaConcept: 'Kecepatan & Kejernihan Suara',
      impact: 'Ukuran 1024 membuat suara tersamarkan seketika (delay < 15ms) tanpa putus-putus, sehingga suara tetap pas dengan gerak bibir.',
      verdict: 'Buffer 1024 (Pas & Tanpa Jeda)'
    },
    {
      parameter: 'Tipe Sensor Wajah',
      multimediaConcept: 'Privasi vs Kealamian Wajah',
      impact: 'Mosaik 70% mengaburkan wajah dengan aman, namun ekspresi dan anggukan saksi tetap terlihat wajar di kamera tanpa kaku seperti topeng hitam.',
      verdict: 'Mosaik 70% (Aman & Alami)'
    },
    {
      parameter: 'Kecepatan Kamera (AI YuNet)',
      multimediaConcept: 'Beban Laptop vs Kelancaran Video',
      impact: 'Kamera berjalan lancar di 60 FPS pada laptop biasa tanpa membuat perangkat panas, dengan deteksi wajah yang selalu tepat mengikuti pergerakan.',
      verdict: '60 FPS Mulus (Ringan di Laptop)'
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-emerald-600/30 selection:text-white">
      <BifrostNavbar />

      <section className="relative pt-36 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>APLIKASI DESKTOP WINDOWS</span>
          </div>

          <div className="flex items-center justify-center gap-3.5 max-w-4xl mx-auto">
            <img 
              src="/bifrost_cam_logo.png" 
              alt="BIFROST Cam Shield Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl border border-emerald-500/40 shadow-2xl shadow-emerald-500/30 bg-black/60 p-1" 
            />
            <h1 className="font-grotesk text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-left leading-tight">
              BIFROST{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Witness Cam
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-2xl mx-auto font-light leading-relaxed">
            Kamera virtual dan pengubah suara langsung untuk melindungi privasi saksi atau pembicara saat online meeting di Google Meet, Zoom, dan OBS.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="/downloads/BIFROST_Witness_Cam_Windows.zip"
              download
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/40"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>Unduh Witness Cam (.zip)</span>
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
            <span>Berkas: <strong>BIFROST_Witness_Cam.exe</strong></span>
            <span>•</span>
            <span>Ukuran: <strong>79.1 MB ZIP</strong></span>
            <span>•</span>
            <span>Windows 10 / 11 64-bit</span>
          </div>
        </div>
      </section>

      <section className="py-16 relative border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              FITUR UTAMA
            </div>
            <h2 className="font-grotesk text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Kemampuan BIFROST Witness Cam
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Mengaburkan wajah dan mengubah nada suara secara langsung di komputer tanpa perlu koneksi internet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#0D121B] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/40 text-emerald-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Kamera Virtual
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Terbaca otomatis di Windows sebagai &quot;BIFROST Encrypted Camera&quot; dan bisa langsung dipilih di Google Meet dan Zoom.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121B] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-700/40 text-cyan-400 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Pengubah Suara (Voice)
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Mengubah suara asli menjadi lebih berat atau robotik saat berbicara melalui kabel audio virtual.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121B] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/40 text-emerald-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Slider Sensor Fleksibel
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Tingkat sensor wajah bisa diatur dari 0% sampai 100% dengan slider, atau diganti ke mode siluet dan sensor mata.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121B] border border-white/[0.08] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700/40 text-emerald-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-grotesk text-base font-bold text-white">
                Deteksi Wajah Cepat
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Mendeteksi dan mengikuti gerak wajah secara mulus di 60 FPS tanpa membuat laptop panas atau lemot.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="py-16 relative bg-[#06070B] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              HASIL UJI KINERJA
            </div>
            <h2 className="font-grotesk text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pengujian Fitur &amp; Hasil Optimasi
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Hasil pengujian setelan audio dan kamera agar suara dan video tetap natural, aman, dan tanpa jeda (lag).
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0A0D15]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#101422] text-zinc-300 border-b border-white/[0.08]">
                  <tr>
                    <th className="p-4 font-bold text-white">Fitur yang Diuji</th>
                    <th className="p-4 font-bold text-emerald-400">Fokus Pengujian</th>
                    <th className="p-4 font-bold text-zinc-300">Hasil Pengujian &amp; Efek ke Pengguna</th>
                    <th className="p-4 font-bold text-cyan-400">Rekomendasi Setelan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                  {tradeOffs.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{row.parameter}</td>
                      <td className="p-4 text-emerald-300">{row.multimediaConcept}</td>
                      <td className="p-4 text-zinc-400 font-sans leading-relaxed">{row.impact}</td>
                      <td className="p-4 font-bold text-cyan-400">{row.verdict}</td>
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
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#0D1824] to-[#0A0D14] border border-emerald-500/30 space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div>
                <h3 className="font-grotesk text-2xl font-bold text-white">
                  Panduan Menjalankan Program (.EXE)
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Hubungkan kamera dan mikrofon tersensor ke Google Meet atau Zoom.
                </p>
              </div>
              <a
                href="/downloads/BIFROST_Witness_Cam_Windows.zip"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-lg shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh ZIP (79.1 MB)</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="text-white font-bold">Buka Program</h4>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Ekstrak berkas ZIP lalu jalankan <code>BIFROST_Witness_Cam.exe</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">2</span>
                <h4 className="text-white font-bold">Pilih Kamera di Meet/Zoom</h4>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Pada setelan kamera Google Meet atau Zoom, pilih <strong className="text-emerald-400">BIFROST Encrypted Camera</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="text-white font-bold">Hubungkan Suara (Opsional)</h4>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Gunakan kabel audio virtual gratis seperti <a href="https://vb-audio.com/Cable/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">VB-CABLE</a> lalu pilih mikrofon <strong>CABLE Output</strong> di Google Meet.
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
