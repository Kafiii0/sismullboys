'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MuninnNavbar from '../../components/MuninnNavbar';
import MuninnFooter from '../../components/MuninnFooter';
import { 
  Radio, Play, Pause, RotateCcw, Wifi, WifiOff, Clock, 
  ShieldCheck, ShieldAlert, Key, CheckCircle2, Copy, 
  Download, ArrowRight, Activity, Layers, AlertTriangle, ExternalLink 
} from 'lucide-react';

export default function DistributionPage() {
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [networkProfile, setNetworkProfile] = useState('4g'); 
  const [activeRendition, setActiveRendition] = useState('720p');
  const [bufferHealth, setBufferHealth] = useState(8.5); 
  const [startupLatency, setStartupLatency] = useState(740); 
  const [rebufferCount, setRebufferCount] = useState(0);

  const [linkTtl, setLinkTtl] = useState('1h');
  const [copiedLink, setCopiedLink] = useState(false);
  const [signedUrl, setSignedUrl] = useState('');

  const [verifierStatus, setVerifierStatus] = useState('authentic'); 
  const [verifierChecked, setVerifierChecked] = useState(true);
  const [extractedRecipient, setExtractedRecipient] = useState('TELKOM-AUDIT-2026-CLIENT-09');

  const networkProfiles = {
    fiber: { name: 'Campus Fiber Gigabit', speed: '50 Mbps', targetRendition: '1080p', delay: 320, rebuffers: 0 },
    '4g': { name: 'Seluler 4G LTE Cepat', speed: '12 Mbps', targetRendition: '720p', delay: 680, rebuffers: 0 },
    '3g': { name: 'Koneksi 3G HSDPA', speed: '1.2 Mbps', targetRendition: '360p', delay: 1450, rebuffers: 1 },
    edge: { name: 'Jaringan Terbatas 2G Edge', speed: '250 kbps', targetRendition: '360p', delay: 2800, rebuffers: 4 }
  };

  const renditions = {
    '1080p': { label: '1080p FHD (Audit Master)', bitrate: '6,500 kbps', res: '1920x1080', fps: '30 fps', color: 'text-red-400' },
    '720p': { label: '720p HD (Standard Web)', bitrate: '2,400 kbps', res: '1280x720', fps: '30 fps', color: 'text-rose-400' },
    '360p': { label: '360p SD (Mobile Low-Band)', bitrate: '650 kbps', res: '640x360', fps: '24 fps', color: 'text-zinc-400' }
  };

  useEffect(() => {
    const prof = networkProfiles[networkProfile];
    setActiveRendition(prof.targetRendition);
    setStartupLatency(prof.delay);
    setRebufferCount(prof.rebuffers);
    setBufferHealth(networkProfile === 'fiber' ? 14.2 : networkProfile === '4g' ? 9.5 : networkProfile === '3g' ? 3.8 : 0.8);
  }, [networkProfile]);

  useEffect(() => {
    const expiryTime = linkTtl === '10m' ? '+10m' : linkTtl === '1h' ? '+1h' : '+24h';
    const fakeToken = 'sig_ecdsa_981a2f' + Math.random().toString(36).substring(2, 9);
    setSignedUrl(`https://evidence.muninn.telkomuniversity.ac.id/stream/audit-9812.m3u8?token=${fakeToken}&expires=${expiryTime}`);
  }, [linkTtl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(signedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#08080C] text-zinc-100 pt-24 pb-16">
      <MuninnNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
            <Link href="/" className="hover:text-red-400">MUNINN</Link>
            <span>/</span>
            <span className="text-red-400 font-semibold">MODUL 4: DISTRIBUSI HLS ADAPTIF & VERIFIKATOR KLIEN</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                Adaptive HLS Distribution & Verification Portal
              </h1>
              <p className="mt-2 text-zinc-400 text-sm font-sans max-w-2xl">
                Distribusi streaming multi-bitrate adaptif HLS (RFC 8216) tiga rendisi, tautan bertanda tangan berkedaluwarsa, dan portal verifikasi integritas bukti digital untuk klien.
              </p>
            </div>

            <Link
              href="/evaluation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-mono font-semibold shadow-lg shadow-red-950/40 shrink-0"
            >
              <span>Lihat Rubrik & Evaluasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            
            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-white">
                    HLS ADAPTIVE PLAYER (RFC 8216 STANDARD)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                    AKTIF: {activeRendition} ({renditions[activeRendition].bitrate})
                  </span>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black aspect-video flex flex-col justify-between p-4 group">
                
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-black/70 backdrop-blur border border-white/10 text-[10px] font-mono text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>REC {'//'} PROMETHEUS POC AUDIT #04</span>
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    Resolusi Rendisi: <strong className="text-white">{renditions[activeRendition].res}</strong> @ {renditions[activeRendition].fps}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pointer-events-none">
                  {isPlaying ? (
                    <div className="flex items-center gap-1.5 h-12">
                      <div className="w-1.5 bg-red-600 h-8 animate-bounce" />
                      <div className="w-1.5 bg-red-500 h-12 animate-pulse" />
                      <div className="w-1.5 bg-rose-500 h-6 animate-bounce" />
                      <div className="w-1.5 bg-red-400 h-10 animate-pulse" />
                      <div className="w-1.5 bg-rose-400 h-7 animate-bounce" />
                    </div>
                  ) : (
                    <div className="p-4 rounded-full bg-white/10 text-white">
                      <Play className="w-8 h-8" />
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-zinc-400 mt-2">
                    {isPlaying ? 'Memutar Segmen TS Terenkripsi AES-128 HLS' : 'Pemutaran Dihentikan'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B0B10]/90 backdrop-blur border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <span className="text-zinc-300 text-[11px]">02:45 / 05:00</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-zinc-400">Buffer: <strong className="text-red-400">{bufferHealth.toFixed(1)}s</strong></span>
                    <span className="text-zinc-400">QoS Rebuffer: <strong className={rebufferCount > 0 ? 'text-amber-400' : 'text-zinc-400'}>{rebufferCount}x</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                    <Wifi className="w-4 h-4 text-amber-400" />
                    <span>SIMULASI THROTTLING JARINGAN KLIEN</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Adaptasi Otomatis (ABR Engine)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(networkProfiles).map(key => (
                    <button
                      key={key}
                      onClick={() => setNetworkProfile(key)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                        networkProfile === key
                          ? 'bg-red-950/40 border-red-500 text-white shadow-md'
                          : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="font-semibold font-mono text-white text-[11px]">
                        {networkProfiles[key].name}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {networkProfiles[key].speed}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span>TAUTAN BERTANDA TANGAN & KEDALUWARSA (TIME-LIMITED URL)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300">
                  HMAC-SHA256
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">Masa Berlaku Tautan:</span>
                {['10m', '1h', '24h'].map(t => (
                  <button
                    key={t}
                    onClick={() => setLinkTtl(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      linkTtl === t
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1]'
                    }`}
                  >
                    {t === '10m' ? '10 Menit' : t === '1h' ? '1 Jam' : '24 Jam'}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-300 truncate select-all">
                  {signedUrl}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono shrink-0 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Tersalin!' : 'Salin URL'}</span>
                </button>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Portal Verifikasi Independen Bukti Klien
                  </h3>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                verifierStatus === 'authentic'
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : 'bg-red-950/70 border-red-500 text-red-300'
              }`}>
                {verifierStatus === 'authentic' ? (
                  <CheckCircle2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-mono font-bold text-xs">
                    {verifierStatus === 'authentic'
                      ? 'VONIS: VALID & OTENTIK (RANTAI UTUH)'
                      : 'VONIS: TAMPERED (BUKTI TIDAK SAH)'
                    }
                  </div>
                  <div className="text-[11px] font-sans mt-0.5 text-zinc-300">
                    {verifierStatus === 'authentic'
                      ? 'Paket digital lolos verifikasi kriptografis 100%. Tanda tangan ECDSA cocok, hash chain tidak terputus, dan watermark terkonfirmasi.'
                      : 'Terdeteksi byte tidak cocok dengan digest SHA-256 pada manifes! Bukti ditolak secara hukum.'
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <span>1. Dekripsi Payload AES-256-GCM:</span>
                  <span className="text-red-400 font-bold">SUKSES (AEAD TAG OK)</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <span>2. Rantai Kustodi SHA-256 (H0..H4):</span>
                  <span className={`font-bold ${verifierStatus === 'authentic' ? 'text-red-400' : 'text-zinc-500'}`}>
                    {verifierStatus === 'authentic' ? '5/5 TERVERIFIKASI' : 'GAGAL DI H2'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <span>3. Tanda Tangan ECDSA P-256:</span>
                  <span className={`font-bold ${verifierStatus === 'authentic' ? 'text-red-400' : 'text-zinc-500'}`}>
                    {verifierStatus === 'authentic' ? 'VALID (INVESTIGATOR)' : 'INVALID'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <span>4. Ekstraksi DCT Watermark:</span>
                  <span className="text-rose-300 font-bold">{extractedRecipient}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setVerifierStatus('authentic')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all ${
                    verifierStatus === 'authentic'
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1]'
                  }`}
                >
                  Uji Berkas Sah
                </button>
                <button
                  onClick={() => setVerifierStatus('tampered')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all ${
                    verifierStatus === 'tampered'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1]'
                  }`}
                >
                  Simulasi Berkas Palsu
                </button>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/20 bg-black/40 hover:bg-white/[0.03] cursor-pointer text-xs font-mono text-zinc-300 transition-all">
                  <Download className="w-3.5 h-3.5 text-amber-400 rotate-180" />
                  <span>Unggah Manifes .muninn Bukti Nyata</span>
                  <input
                    type="file"
                    accept=".muninn,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        try {
                          const parsed = JSON.parse(evt.target.result);
                          if (parsed.recipientId) setExtractedRecipient(parsed.recipientId);
                          if (parsed.integrityStatus === 'TAMPERED_INVALID' || parsed.status === 'TAMPERED_INVALID') {
                            setVerifierStatus('tampered');
                          } else {
                            setVerifierStatus('authentic');
                          }
                        } catch {
                          setVerifierStatus('tampered');
                        }
                      };
                      reader.readAsText(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

            </div>

          </div>

        </div>

      </div>

      <MuninnFooter />
    </main>
  );
}
