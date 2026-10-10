'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MuninnNavbar from '../../components/MuninnNavbar';
import MuninnFooter from '../../components/MuninnFooter';
import { 
  Video, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2, 
  AlertTriangle, RefreshCw, Sliders, Volume2, Mic, MicOff, 
  Camera, Monitor, ArrowRight, Lock, Copy, Download, Layers 
} from 'lucide-react';

export default function StudioPage() {
  const canvasRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const [selectedPreset, setSelectedPreset] = useState('terminal');
  const [redactionMode, setRedactionMode] = useState('solid'); 
  const [detectedTokens, setDetectedTokens] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isRedacted, setIsRedacted] = useState(false);
  const [rawHash, setRawHash] = useState('');
  const [redactedHash, setRedactedHash] = useState('');
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  
  const [audioActive, setAudioActive] = useState(false);
  const [highPassFilter, setHighPassFilter] = useState(true);
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [manualBoxes, setManualBoxes] = useState([]);

  const presets = {
    terminal: {
      name: 'Terminal AWS & Root Credential Leak',
      desc: 'Sesi bash audit ofensif menampilkan AWS_SECRET_KEY, IP Server, dan token SSH.',
      draw: (ctx, width, height) => {
        
        ctx.fillStyle = '#0C0D12';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#181922';
        ctx.fillRect(0, 0, width, 36);
        ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(20, 18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(38, 18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.arc(56, 18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#94A3B8'; ctx.font = '12px monospace';
        ctx.fillText('bash — forensic-investigator@muninn-node-01: ~', 80, 22);

        ctx.fillStyle = '#10B981'; ctx.font = '13px monospace';
        ctx.fillText('investigator@target:~$ cat /opt/secrets/.env', 24, 70);

        ctx.fillStyle = '#E2E8F0';
        ctx.fillText('# PRODUCTION ENVIRONMENT SECRETS DUMP — DO NOT LEAK', 24, 100);
        
        ctx.fillStyle = '#F87171';
        ctx.fillText('AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"', 24, 130);
        ctx.fillText('AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"', 24, 160);
        
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('DB_HOST="192.168.1.105"', 24, 190);
        ctx.fillText('DB_PASSWORD="SuperSecretCorpDbPassword2026!"', 24, 220);
        
        ctx.fillStyle = '#FBBF24';
        ctx.fillText('SYSADMIN_EMAIL="muhammad.ghassan@perusahaan.co.id"', 24, 250);
        ctx.fillText('JWT_SESSION_SECRET="dGhpcy1pcy1hLXZlcnktc2VjcmV0LWtleS0yMDI2"', 24, 280);

        ctx.fillStyle = '#94A3B8';
        ctx.fillText('[AUDIT NOTE]: Sensitive tokens must be redacted under UU PDP No. 27/2022', 24, 320);
      },
      tokens: [
        { label: 'AWS Access Key', box: { x: 24, y: 116, w: 330, h: 20 }, type: 'API Key' },
        { label: 'AWS Secret Key', box: { x: 24, y: 146, w: 460, h: 20 }, type: 'Credential' },
        { label: 'Database IP', box: { x: 24, y: 176, w: 200, h: 20 }, type: 'Network PII' },
        { label: 'Database Pass', box: { x: 24, y: 206, w: 380, h: 20 }, type: 'Credential' },
        { label: 'Corporate Email', box: { x: 24, y: 236, w: 430, h: 20 }, type: 'PII (UU PDP)' },
        { label: 'JWT Secret', box: { x: 24, y: 266, w: 440, h: 20 }, type: 'Cryptographic Token' }
      ]
    },
    banking: {
      name: 'Nasabah Portal & Kartu Kredit PII',
      desc: 'Tangkapan layar transaksi pembayaran memuat Nomor Kartu Kredit dan NIK.',
      draw: (ctx, width, height) => {
        ctx.fillStyle = '#0B0F19';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 0, width, 50);
        ctx.fillStyle = '#38BDF8'; ctx.font = 'bold 15px sans-serif';
        ctx.fillText('BANK PERMATA ENTERPRISE — AUDIT TRAIL LOG #88419', 24, 32);

        ctx.fillStyle = '#1E1B4B';
        ctx.strokeStyle = '#4338CA';
        ctx.lineWidth = 2;
        ctx.roundRect(24, 75, 420, 200, 16);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#E0E7FF'; ctx.font = '11px monospace';
        ctx.fillText('NASABAH PRIORITAS INDONESIA', 45, 105);

        ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 16px monospace';
        ctx.fillText('4532  8901  2345  9812', 45, 145);

        ctx.fillStyle = '#94A3B8'; ctx.font = '11px sans-serif';
        ctx.fillText('VALID THRU: 12/29   CVV: 782', 45, 175);
        ctx.fillText('CARDHOLDER: FARHAN HAIDAR AR-RASYID', 45, 205);
        ctx.fillText('NIK: 3273010908010005', 45, 235);

        ctx.fillStyle = '#10B981'; ctx.font = '12px monospace';
        ctx.fillText('STATUS TRANSAKSI: DITERIMA (Rp 150.000.000)', 45, 305);
      },
      tokens: [
        { label: 'Credit Card Number', box: { x: 40, y: 128, w: 250, h: 24 }, type: 'PCI-DSS PII' },
        { label: 'CVV Code', box: { x: 175, y: 162, w: 75, h: 20 }, type: 'PCI-DSS' },
        { label: 'Nama Nasabah', box: { x: 40, y: 192, w: 320, h: 20 }, type: 'PII (UU PDP)' },
        { label: 'Nomor Induk Kependudukan', box: { x: 40, y: 222, w: 220, h: 20 }, type: 'Sensitive PII' }
      ]
    }
  };

  const computeHash = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const renderBase = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 360;

    presets[selectedPreset].draw(ctx, canvas.width, canvas.height);
    setIsRedacted(false);
    setManualBoxes([]);

    const rawData = canvas.toDataURL();
    computeHash(rawData).then(h => {
      setRawHash(h);
      setRedactedHash('');
    });
  };

  useEffect(() => {
    renderBase();
    setDetectedTokens(presets[selectedPreset].tokens);
  }, [selectedPreset]);

  const applyRedaction = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const allBoxes = [
      ...detectedTokens.map(t => t.box),
      ...manualBoxes
    ];

    allBoxes.forEach(box => {
      if (redactionMode === 'solid') {
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x, box.y, box.w, box.h);
      } else if (redactionMode === 'mosaic') {
        
        const blockSize = 12;
        const imgData = ctx.getImageData(box.x, box.y, box.w, box.h);
        for (let py = 0; py < box.h; py += blockSize) {
          for (let px = 0; px < box.w; px += blockSize) {
            
            let r = 0, g = 0, b = 0, count = 0;
            for (let subY = 0; subY < blockSize && (py + subY) < box.h; subY++) {
              for (let subX = 0; subX < blockSize && (px + subX) < box.w; subX++) {
                const idx = ((py + subY) * box.w + (px + subX)) * 4;
                r += imgData.data[idx];
                g += imgData.data[idx + 1];
                b += imgData.data[idx + 2];
                count++;
              }
            }
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(box.x + px, box.y + py, Math.min(blockSize, box.w - px), Math.min(blockSize, box.h - py));
          }
        }
      } else if (redactionMode === 'blur') {
        
        ctx.filter = 'blur(6px)';
        const temp = ctx.getImageData(box.x, box.y, box.w, box.h);
        ctx.putImageData(temp, box.x, box.y);
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(box.x, box.y, box.w, box.h);
      }
    });

    setIsRedacted(true);

    const redactedData = canvas.toDataURL();
    const h1 = await computeHash(rawHash + redactedData);
    setRedactedHash(h1);
  };

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      setIsCapturingScreen(true);

      video.onloadedmetadata = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 720;
        canvas.height = 360;

        const drawFrame = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
        };
        setTimeout(drawFrame, 500);
      };
    } catch (err) {
      console.error('Screen capture error:', err);
    }
  };

  const toggleAudio = async () => {
    if (audioActive) {
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setAudioActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      if (highPassFilter) {
        const biquad = audioCtx.createBiquadFilter();
        biquad.type = 'highpass';
        biquad.frequency.setValueAtTime(120, audioCtx.currentTime);
        source.connect(biquad);
        biquad.connect(analyser);
      } else {
        source.connect(analyser);
      }

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      setAudioActive(true);

      const aCanvas = audioCanvasRef.current;
      const aCtx = aCanvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderAudio = () => {
        animationFrameRef.current = requestAnimationFrame(renderAudio);
        analyser.getByteFrequencyData(dataArray);

        aCtx.fillStyle = '#0A0A10';
        aCtx.fillRect(0, 0, aCanvas.width, aCanvas.height);

        const barWidth = (aCanvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * aCanvas.height;
          aCtx.fillStyle = `hsl(${i * 3 + 340}, 85%, 55%)`;
          aCtx.fillRect(x, aCanvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      };

      renderAudio();
    } catch (err) {
      alert('Akses mikrofon tidak diizinkan atau tidak tersedia: ' + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080C] text-zinc-100 pt-24 pb-16">
      <MuninnNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
            <Link href="/" className="hover:text-red-400">MUNINN</Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold">MODUL 1: AKUISISI & PENGOLAHAN BUKTI</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                Evidence Ingestion & Redaction Studio
              </h1>
              <p className="mt-2 text-zinc-400 text-sm font-sans max-w-2xl">
                Menangkap bukti multimedia audit (layar, webcam, suara) dan menyamarkan informasi sensitif (API keys, email, PII) di sisi klien sebelum transmisi, sesuai standar UU No. 27 Tahun 2022.
              </p>
            </div>

            <Link
              href="/compression"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-mono font-semibold shadow-lg shadow-red-950/40 shrink-0"
            >
              <span>Lanjut ke Modul 2: Kompresi DCT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-mono font-semibold text-zinc-200">
                    CANVAS LIVE FORENSIK (720x360 px)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className={`px-2 py-0.5 rounded ${isRedacted ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'}`}>
                    {isRedacted ? 'TEREDAKSI AMAN' : 'DATA MENTAH SENSITIF'}
                  </span>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-black flex justify-center">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-auto max-h-[380px] object-contain cursor-crosshair"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={applyRedaction}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold shadow-md shadow-red-950/40 transition-all"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Terapkan Redaksi Sekarang</span>
                  </button>

                  <button
                    onClick={renderBase}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-mono transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Kanvas</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-zinc-400">
                  {detectedTokens.length} Pola Sensitif Terdeteksi
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0D0D14] border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-white font-semibold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>RANTAI KUSTODI TAHAP 1 (INGESTION MANIFEST)</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">SHA-256 DIGEST</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-red-400 font-semibold">H0 (Raw Ingest): </span>
                    <span className="text-zinc-300 break-all select-all font-mono text-[11px]">
                      {rawHash || 'Menghitung digest hash...'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-emerald-400 font-semibold">H1 (Redacted State): </span>
                    <span className="text-zinc-300 break-all select-all font-mono text-[11px]">
                      {redactedHash || '(Terapkan redaksi untuk menghitung H1 = SHA-256(H0 + Redacted))'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono font-semibold text-white">
                    PENGOLAHAN AUDIO INSIDEN (WEB AUDIO API)
                  </span>
                </div>
                <button
                  onClick={toggleAudio}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    audioActive 
                      ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40' 
                      : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]'
                  }`}
                >
                  {audioActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{audioActive ? 'Matikan Mikrofon' : 'Aktifkan Mikrofon'}</span>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black">
                <canvas 
                  ref={audioCanvasRef} 
                  width={680} 
                  height={90} 
                  className="w-full h-[90px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highPassFilter}
                    onChange={(e) => setHighPassFilter(e.target.checked)}
                    className="rounded border-zinc-700 text-red-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-zinc-200">High-pass Filter (120Hz)</div>
                    <div className="text-[10px] text-zinc-400">Memangkas low-frequency rumble & kebisingan AC</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={normalizeAudio}
                    onChange={(e) => setNormalizeAudio(e.target.checked)}
                    className="rounded border-zinc-700 text-red-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-zinc-200">Speech Normalization</div>
                    <div className="text-[10px] text-zinc-400">Meratakan amplitudo bicara forensik (EBU R128)</div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 space-y-6">
            
            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-4">
              <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                1. Pilih Sumber Bukti (Ingest)
              </div>

              <div className="space-y-2">
                {Object.keys(presets).map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedPreset(key)}
                    className={`w-full p-3 rounded-xl text-left transition-all border text-xs ${
                      selectedPreset === key
                        ? 'bg-red-950/30 border-red-500 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="font-semibold font-mono text-white">{presets[key].name}</div>
                    <div className="text-[11px] text-zinc-400 mt-1">{presets[key].desc}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <button
                  onClick={startScreenCapture}
                  className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono border border-white/10 transition-all"
                >
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tangkap Layar Peramban (Live)</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-4">
              <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                2. Teknik Redaksi (UU PDP No. 27/2022)
              </div>

              <div className="space-y-2 text-xs font-sans">
                
                <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                  redactionMode === 'solid'
                    ? 'bg-red-950/30 border-red-500 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="redactionMode"
                      checked={redactionMode === 'solid'}
                      onChange={() => setRedactionMode('solid')}
                      className="text-red-600 focus:ring-0"
                    />
                    <span className="font-semibold font-mono text-white">Kotak Hitam Solid (Rekomendasi)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 pl-5">
                    Memusnahkan nilai piksel secara permanen menjadi #000000. Tidak dapat dipulihkan secara matematis.
                  </p>
                </label>

                <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                  redactionMode === 'mosaic'
                    ? 'bg-red-950/30 border-red-500 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="redactionMode"
                      checked={redactionMode === 'mosaic'}
                      onChange={() => setRedactionMode('mosaic')}
                      className="text-red-600 focus:ring-0"
                    />
                    <span className="font-semibold font-mono text-white">Mosaik Pikselasi (16x16)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 pl-5">
                    Menghitung rata-rata warna per blok 16x16 piksel, mengaburkan karakter font secara permanen.
                  </p>
                </label>

                <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                  redactionMode === 'blur'
                    ? 'bg-amber-950/30 border-amber-500 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="redactionMode"
                      checked={redactionMode === 'blur'}
                      onChange={() => setRedactionMode('blur')}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span className="font-semibold font-mono text-amber-300">Gaussian Blur (Pembanding)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 pl-5">
                    ⚠️ Blur ringan rentan terhadap rekonstruksi dekonvolusi (*unblur attack*). Dicantumkan sebagai kontrol pembanding riset.
                  </p>
                </label>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Daftar Token Terdeteksi
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/40 text-red-300">
                  {detectedTokens.length} DITEMUKAN
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {detectedTokens.map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-semibold text-zinc-200">{t.label}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">{t.type}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {isRedacted ? 'Tersamarkan' : 'Perlu Redaksi'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      <MuninnFooter />
    </main>
  );
}
