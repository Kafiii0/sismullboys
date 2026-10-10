'use client';

import Link from 'next/link';
import BifrostNavbar from '../../components/BifrostNavbar';
import BifrostFooter from '../../components/BifrostFooter';
import { 
  Download, Monitor, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function ProgramsPage() {
  const programs = [
    {
      id: 'witness-cam',
      name: 'BIFROST Witness Cam',
      version: 'v2.5 Standalone',
      tagline: 'Virtual Camera & Voice Disguiser',
      logo: '/bifrost_cam_logo.png',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      glowColor: 'from-emerald-600/20 to-teal-600/10',
      description: 'Aplikasi desktop untuk menyamarkan wajah dan memodulasi suara secara real-time pada Google Meet, Zoom, dan OBS.',
      features: [
        { label: 'DirectShow Virtual Cam', desc: 'Terdaftar resmi sebagai driver kamera virtual di Windows.' },
        { label: 'DSP Voice Disguiser', desc: 'Modulasi vokal real-time via Virtual Audio Cable.' },
        { label: 'YuNet Biometric AI', desc: 'Deteksi wajah lokal & sensor pixelasi mosaik adaptif.' },
        { label: 'Offline & Low Latency', desc: 'Komputasi lokal tanpa internet dengan latensi < 15ms.' }
      ],
      specs: {
        executable: 'BIFROST_Witness_Cam.exe',
        os: 'Windows 10 / 11 (64-bit)',
        size: '79.1 MB ZIP',
        type: 'Portable Standalone (.exe)'
      },
      downloadUrl: '/downloads/BIFROST_Witness_Cam_Windows.zip',
      docUrl: '/witness-shield',
      accentBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
    },
    {
      id: 'hdmi-shield',
      name: 'BIFROST HDMI Shield',
      version: 'v2.5 Standalone',
      tagline: 'Presentation Privacy & Anti-Infinity Loop',
      logo: null,
      badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
      glowColor: 'from-cyan-600/20 to-blue-600/10',
      description: 'Aplikasi desktop untuk mengamankan presentasi proyektor dan meniadakan bug layar berulang (Infinite Loop) di Google Meet.',
      features: [
        { label: 'Anti-Infinity Loop', desc: 'Menghilangkan efek cermin berulang saat share screen.' },
        { label: 'RapidOCR Engine', desc: 'Deteksi otomatis kolom kredensial sensitif pada layar.' },
        { label: 'Window Overlap Blur', desc: 'Sensor otomatis jendela sensitif yang bertumpuk.' },
        { label: 'Panic Blackout Hotkey', desc: 'Tombol darurat instan [Spasi] untuk memadamkan layar.' }
      ],
      specs: {
        executable: 'BIFROST_HDMI_Shield.exe',
        os: 'Windows 10 / 11 (64-bit)',
        size: '119.5 MB ZIP',
        type: 'Portable Standalone (.exe)'
      },
      downloadUrl: '/downloads/BIFROST_HDMI_Shield_Windows.zip',
      docUrl: '/screen-shield',
      accentBtn: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30'
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white">
      <BifrostNavbar />

      <section className="relative pt-36 pb-12 md:pt-40 md:pb-16 overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>PORTABLE WINDOWS APPLICATIONS</span>
          </div>

          <h1 className="font-grotesk text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Programs &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-red-500">
              Downloads
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-xl mx-auto font-light leading-relaxed">
            Unduh aplikasi desktop BIFROST mandiri (.exe) untuk sistem Windows 10/11.
          </p>
        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {programs.map((prog, idx) => (
            <div
              key={prog.id}
              id={prog.id}
              className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0E121E] to-[#0A0D15] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${prog.glowColor} rounded-full blur-3xl pointer-events-none`} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                
                <div className="lg:col-span-7 space-y-5">
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500 font-bold">0{idx + 1}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${prog.badgeColor}`}>
                      {prog.version}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {prog.tagline}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {prog.logo ? (
                      <img 
                        src={prog.logo} 
                        alt={prog.name} 
                        className="w-14 h-14 object-contain rounded-2xl border border-emerald-500/40 shadow-xl shadow-emerald-500/20 bg-black/50 p-1 shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-xl shadow-cyan-500/20">
                        <Monitor className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-grotesk text-2xl font-extrabold text-white tracking-tight">
                        {prog.name}
                      </h2>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">
                        Berkas: <strong className="text-white">{prog.specs.executable}</strong>
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 font-sans leading-relaxed font-light">
                    {prog.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {prog.features.map((feat, fidx) => (
                      <div key={fidx} className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                        <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat.label}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <Link
                      href={prog.docUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
                    >
                      <span>Lihat Dokumentasi &amp; Panduan Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>

                <div className="lg:col-span-5 rounded-2xl bg-[#07090F] border border-white/[0.1] p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Paket Unduhan
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      WINDOWS 64-BIT
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Berkas Unduh:</span>
                      <span className="text-white font-bold">{prog.specs.executable.replace('.exe', '.zip')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Ukuran:</span>
                      <span className="text-emerald-400 font-bold">{prog.specs.size}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Tipe:</span>
                      <span className="text-zinc-300">{prog.specs.type}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <a
                      href={prog.downloadUrl}
                      download
                      className={`w-full group flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl ${prog.accentBtn} text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] border border-white/20`}
                    >
                      <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      <span>Unduh ZIP ({prog.specs.size})</span>
                    </a>
                  </div>

                  <p className="text-[11px] font-mono text-zinc-500 text-center">
                    Ekstrak ZIP lalu klik ganda berkas .exe untuk menjalankan
                  </p>
                </div>

              </div>
            </div>
          ))}

        </div>
      </section>

      <BifrostFooter />
    </main>
  );
}
