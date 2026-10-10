'use client';

import { useState } from 'react';
import Link from 'next/link';
import BifrostNavbar from '../components/BifrostNavbar';
import BifrostFooter from '../components/BifrostFooter';
import { 
  ShieldCheck, ArrowRight, ArrowUpRight, CheckCircle2, 
  Lock, EyeOff, MapPin, Video, FileText, Hash, 
  ChevronRight, Sliders, Database, Layers, Check,
  Download, Mic, Monitor, Sparkles
} from 'lucide-react';

export default function Home() {
  const [heroRedacted, setHeroRedacted] = useState(true);

  const capabilities = [
    {
      step: '01',
      title: 'Selective Credential Redactor',
      tag: 'PII & JUDICIAL CONTEXT',
      desc: 'Mask 16-digit NIK, financial credentials, and biometric seals while strictly preserving state authority headers (REPUBLIK INDONESIA) for courtroom evidentiary admissibility.',
      href: '/redact',
      barColor: 'bg-red-600',
    },
    {
      step: '02',
      title: 'EXIF & Hardware Telemetry Purge',
      tag: 'CONTAINER SANITIZATION',
      desc: 'Scrub embedded GPS coordinates, camera serial numbers, device model signatures, and creation timestamps from multimedia container headers before public disclosure.',
      href: '/redact',
      barColor: 'bg-rose-600',
    },
    {
      step: '03',
      title: 'Video Temporal Window Masking',
      tag: 'SURVEILLANCE TIMECODE',
      desc: 'Apply frame-bounded redaction windows (e.g. 00:01.500 to 00:06.500) to conceal transient credentials on moving vehicles or access badges in surveillance video.',
      href: '/redact',
      barColor: 'bg-red-700',
    },
    {
      step: '04',
      title: 'Cryptographic Chain of Custody',
      tag: 'ISO/IEC 27037 AUDIT',
      desc: 'Compute verifiable pre- and post-sanitization SHA-256 digests in real time. Export tamper-evident JSON audit receipts conforming to digital evidence guidelines.',
      href: '/redact',
      barColor: 'bg-[#E11D48]',
    },
  ];

  const workflowSteps = [
    {
      num: '01',
      title: 'Ingestion & Tamper Baseline',
      summary: 'Load raw multimedia files directly into memory. A pre-sanitization SHA-256 cryptographic digest is calculated immediately to anchor the original chain of custody.',
    },
    {
      num: '02',
      title: 'Selective Redaction & EXIF Scrub',
      summary: 'Examiner targets sensitive credentials (NIK, QR, bank details) while preserving legal headers. GPS coordinates and hardware telemetry are purged from container metadata.',
    },
    {
      num: '03',
      title: 'Verifiable Custody & Export',
      summary: 'Sanitized media is generated with burned-in masking. A cryptographically verifiable JSON Audit Certificate is produced documenting all modifications for legal counsel.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white">
      <BifrostNavbar />

      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden border-b border-white/[0.08]">
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-[-100px] w-[500px] h-[500px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-[-100px] w-[450px] h-[450px] bg-red-950/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>FORENSIC EVIDENCE SANITIZATION SUITE</span>
              </div>

              <h1 className="font-grotesk text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.18]">
                Forensic Media Redaction with Zero{' '}
                <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">
                  Evidentiary
                </span>{' '}
                Context Loss.
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed max-w-xl font-light">
                Selective credential masking and container metadata stripping for digital evidence. Redact sensitive NIK, financial tokens, and biometric identifiers while preserving legal authority headers, purging hardware EXIF telemetry, and certifying SHA-256 chain of custody.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/redact"
                  className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch Redact Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-black/40 hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 font-semibold text-xs tracking-wider uppercase backdrop-blur-sm transition-all"
                >
                  <span>How It Works</span>
                </a>
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Standard:</span>
                <span>ISO/IEC 27037:2012</span>
                <span className="text-zinc-600">|</span>
                <span>UU PDP 27/2022</span>
              </div>

            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0E0F14] border border-white/[0.1] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Interactive Evidence Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-lg border border-white/[0.06]">
                    <button
                      onClick={() => setHeroRedacted(false)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                        !heroRedacted ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Raw
                    </button>
                    <button
                      onClick={() => setHeroRedacted(true)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                        heroRedacted ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Sanitized
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161821] border border-white/[0.06] space-y-3 font-mono text-xs">
                  
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
                    <span>?? REPUBLIK INDONESIA - KTP</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Preserved Legal Marker</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">NIK (16-Digit ID):</span>
                    <span className={heroRedacted ? 'bg-black text-red-400 px-2 py-0.5 rounded font-bold' : 'text-white'}>
                      {heroRedacted ? '????????????????' : '3204122308990001'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Nama Lengkap:</span>
                    <span className="text-zinc-200">SYAHRUL RAMADHAN</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">EXIF Geolocation:</span>
                    <span className={heroRedacted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {heroRedacted ? '[PURGED - ZEROED]' : '-6.9732, 107.6304'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Hardware Serial:</span>
                    <span className={heroRedacted ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                      {heroRedacted ? '[STRIPPED]' : 'iPhone15,3 SN#88419'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] text-zinc-400 mb-1">SHA-256 Integrity Verification:</div>
                    <div className="text-[10px] p-2 rounded bg-black border border-white/[0.06] text-zinc-300 truncate">
                      {heroRedacted 
                        ? 'e8b4c91a02f3781d45bc901a4e76d9102c984b67f1a309e45c71bfa82910d43a' 
                        : '8f4a7c29e13d98b0451a2f643e8d710b9c3e215840d2a891e45763bf018a3d52'
                      }
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-zinc-400">Test with full interactive canvas:</span>
                  <Link href="/redact" className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                    <span>Open Workbench</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
      
      <section id="capabilities" className="py-24 bg-[#08080A] relative overflow-hidden border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-mono text-red-500 font-bold uppercase tracking-wider">
                CORE FORENSIC MODULES
              </div>
              <h2 className="font-grotesk text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Forensic Multimedia Sanitization Capabilities
              </h2>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Adhering to strict forensic principles: evidence must remain judicially admissible while sensitive privacy credentials are permanently expunged.
              </p>
            </div>

            <Link
              href="/redact"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
            >
              <span>Explore Redact Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap) => (
              <div
                key={cap.step}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#0D0E12] border border-white/[0.06] hover:border-white/[0.15] transition-all hover:-translate-y-1 duration-300 overflow-hidden"
              >
                
                <div className={`absolute top-0 inset-x-0 h-1 ${cap.barColor}`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 font-bold">{cap.step}</span>
                    <span className="text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="font-grotesk text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                    {cap.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {cap.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.04]">
                  <Link
                    href={cap.href}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors"
                  >
                    <span>Launch Module</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-[#090A0E] via-[#0B0F19] to-[#0A0B0F] relative overflow-hidden border-b border-white/[0.08]">
        
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-[#0D121F]/90 border border-emerald-500/25 p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NATIVE DESKTOP SUITE v2.5</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-zinc-300 font-mono text-xs">
                    WINDOWS 10 / 11 64-BIT
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="font-grotesk text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    BIFROST Witness Cam{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      Standalone App
                    </span>
                  </h2>
                  <p className="text-sm text-zinc-300 font-sans leading-relaxed font-light">
                    Aplikasi desktop native dengan integrasi driver <strong>DirectShow Virtual Camera</strong> dan <strong>DSP Audio Voice Disguiser</strong> real-time. Melindungi identitas saksi dan presenter langsung pada Google Meet, Zoom, MS Teams, dan OBS.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                      <Video className="w-4 h-4" />
                      <span>DirectShow Virtual Cam</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Terdaftar resmi sebagai &quot;BIFROST Encrypted Camera&quot; di Windows Device Manager.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                      <Mic className="w-4 h-4" />
                      <span>DSP Voice Disguiser</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Modulasi nada suara real-time (Deep Shadow &amp; Robotik Vocoder) via Virtual Audio Cable.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>YuNet Biometric AI</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Deteksi wajah presisi &amp; slider pixelasi adaptif 0%-100% dengan tombol darurat Panic Blackout.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                      <Monitor className="w-4 h-4" />
                      <span>Offline &amp; Low Latency</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Eksekusi 100% lokal tanpa kirim video ke cloud. Latensi stream &lt; 15 milidetik.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <a
                    href="/downloads/BIFROST_Witness_Cam_Windows.zip"
                    download
                    className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/40"
                  >
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    <span>Unduh Versi Desktop (.zip)</span>
                  </a>

                  <Link
                    href="/programs"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 hover:border-white/20 font-semibold text-xs tracking-wider uppercase transition-all"
                  >
                    <span>Jelajahi Portal Program</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-3 pt-1">
                  <span>Paket Berisi: <strong>BIFROST_Witness_Cam.exe</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span>Ukuran: <strong>79.1 MB ZIP</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span>Panduan Instalasi Lengkap</span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#080B12] border border-white/[0.1] p-5 shadow-2xl space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-white uppercase text-[11px]">
                        BIFROST Witness Cam Preview
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      LIVE DIRECTSHOW
                    </span>
                  </div>

                  <div className="relative aspect-video rounded-xl bg-[#04060A] border border-white/[0.08] flex items-center justify-center overflow-hidden p-4 text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98115,transparent_70%)]" />
                    
                    <div className="space-y-3 relative z-10">
                      <img 
                        src="/bifrost_cam_logo.png" 
                        alt="BIFROST Cam Shield Logo" 
                        className="w-24 h-24 object-contain rounded-2xl mx-auto shadow-2xl shadow-emerald-500/30 border border-emerald-400/40 p-1 bg-black/60 hover:scale-105 transition-transform" 
                      />
                      <div>
                        <div className="font-bold text-white text-xs tracking-wide">BIFROST Cam Shield</div>
                        <div className="text-[10px] text-emerald-400 font-mono">Official Application Emblem</div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 border border-emerald-500/40 text-[10px] text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Siap dipilih di Google Meet / Zoom</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] pt-1">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Target Driver:</span>
                      <span className="text-white font-bold">DirectShow CLSID Hook</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Model Deteksi:</span>
                      <span className="text-white">YuNet ONNX Biometric</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Filter Audio:</span>
                      <span className="text-emerald-400">Pitch Shift &amp; Vocoder DSP</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Status Lisensi:</span>
                      <span className="text-zinc-200">Akademik (Tubes Sistem Multimedia)</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-[#0A0B0F] relative overflow-hidden border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <div className="text-xs font-mono text-red-500 font-bold uppercase tracking-wider">
              OPERATIONAL WORKFLOW
            </div>
            <h2 className="font-grotesk text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              A transparent, 3-stage chain-of-custody process engineered to prevent accidental data breaches during forensic disclosure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((ws) => (
              <div
                key={ws.num}
                className="relative p-6 rounded-2xl bg-[#0E0F14] border border-white/[0.06] space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/40 text-red-400 font-mono font-bold flex items-center justify-center text-sm">
                  {ws.num}
                </div>

                <h3 className="font-grotesk text-lg font-bold text-white">
                  {ws.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {ws.summary}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section id="custody" className="py-24 bg-[#08080A] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#12141A] to-[#0A0B0E] border border-white/[0.1] text-center space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-xs font-mono text-red-300">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>JUDICIAL EVIDENCE ADMISSIBILITY READY</span>
            </div>

            <h2 className="font-grotesk text-3xl sm:text-4xl font-bold text-white tracking-tight max-w-2xl mx-auto">
              Ready to Sanitize and Verify Multimedia Evidence?
            </h2>

            <p className="text-sm text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
              Launch the standalone Redact Studio to inspect Indonesian identity documents, surveillance CCTV footage, or upload custom forensic artifacts for client evaluation.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/redact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Redact Studio Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-4 text-xs font-mono text-zinc-500">
              Session initialized with SHA-256 WebCrypto FIPS 180-4 Engine
            </div>

          </div>
        </div>
      </section>

      <BifrostFooter />
    </main>
  );
}
