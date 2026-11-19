'use client';

import Link from 'next/link';
import MuninnNavbar from '../../components/MuninnNavbar';
import MuninnFooter from '../../components/MuninnFooter';
import { Users, Award, Shield, Video, Cpu, Radio, BookOpen, GraduationCap } from 'lucide-react';

export default function TeamPage() {
  const members = [
    {
      name: 'Muhammad Trisnatama',
      nim: '103032500099',
      role: 'Multimedia & Compression Engineer',
      focus: 'Pengolahan citra digital, pengujian kualitas redaksi media, implementasi algoritma DCT 8x8, dan optimasi performa pemrosesan piksel.',
      icon: Cpu,
      color: 'from-red-500 to-rose-600'
    },
    {
      name: 'Muhammad Ghassan Denaprisnyah',
      nim: '103032530012',
      role: 'Frontend & Integration Engineer',
      focus: 'Pengembangan antarmuka Redact Studio, integrasi Next.js Tailwind CSS, MediaDevices, dan pengujian sistem modulasi audio DSP.',
      icon: Video,
      color: 'from-amber-500 to-orange-500'
    },
    {
      name: 'Farhan Haidar Ar-Rasyid',
      nim: '103032500015',
      role: 'Security & Cryptography Engineer',
      focus: 'Perancangan modul verifikasi integritas SHA-256 custody ledger, distribusi terenkripsi, dan implementasi penandatanganan pasca-kuantum (PQC).',
      icon: Radio,
      color: 'from-red-700 to-zinc-800'
    },
    {
      name: 'I Gede Arya Yoga Saputra',
      nim: '103032530026',
      role: 'Quality Assurance & Documentation',
      focus: 'Pengujian fungsionalitas lintas modul, audit kesesuaian standar privasi UU PDP & ISO/IEC 27037, dan penyusunan buku panduan HKI.',
      icon: Award,
      color: 'from-red-600 to-rose-800'
    },
    {
      name: 'Fahri Al Kahfi',
      nim: '103032500049',
      role: 'Ketua Tim & Lead Architect',
      focus: 'Perancangan arsitektur mesin desktop Tauri Rust, implementasi DirectShow virtual camera, deteksi YuNet ONNX, dan logika Anti-Loop HDMI Shield.',
      icon: Shield,
      color: 'from-rose-600 to-red-700'
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080C] text-zinc-100 pt-24 pb-16">
      <MuninnNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>STRUKTUR TIM PENELITI & MAHASISWA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            Tim Pengembang Proyek MUNINN
          </h1>
          <p className="mt-3 text-zinc-400 text-sm font-sans">
            Tugas Besar Sistem Multimedia (CBK2CAB3) · Program Studi S1 Teknik Informatika, Fakultas Informatika, Telkom University Bandung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {members.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0F0F17] border border-white/10 hover:border-red-500/40 transition-all flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-zinc-400">NIM: {m.nim}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">{m.name}</h3>
                    <div className="text-xs font-mono text-red-400 font-semibold mt-0.5">{m.role}</div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {m.focus}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Telkom University</span>
                  <span className="text-red-400 font-semibold">Tubes CBK2CAB3</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-mono uppercase text-red-400 font-semibold">
              Supervisi Akademik & Pengampu Mata Kuliah
            </div>
            <div className="text-base font-bold text-white font-mono">
              Andi Shafira Dyah Kurniasari
            </div>
            <div className="text-xs text-zinc-400 font-sans">
              NIP: 26000043 · Dosen Pengampu Mata Kuliah Sistem Multimedia (CBK2CAB3) · Telkom University Bandung
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-zinc-400 text-center sm:text-right">
            <div>Repositori: <code className="text-zinc-200">Kafiii0/tubes-sihitam</code></div>
            <div className="text-[11px] text-zinc-500 mt-1">Evolusi Arsitektur Sistem Multimedia MUNINN</div>
          </div>
        </div>

      </div>

      <MuninnFooter />
    </main>
  );
}
