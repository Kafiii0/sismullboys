'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MuninnNavbar from '../../components/MuninnNavbar';
import MuninnFooter from '../../components/MuninnFooter';
import { 
  ShieldCheck, Lock, Unlock, Key, FileCheck, AlertTriangle, 
  Sparkles, CheckCircle2, ArrowRight, Download, RefreshCw, 
  Eye, Hash, ShieldAlert, Cpu, QrCode 
} from 'lucide-react';

export default function SecurityPage() {
  const [recipientTag, setRecipientTag] = useState('TELKOM-AUDIT-2026-CLIENT-09');
  const [isTampered, setIsTampered] = useState(false);
  const [tamperedStage, setTamperedStage] = useState(null); 
  const [encryptionKey, setEncryptionKey] = useState('0f948b8c2d137ea651e9bca93081bf47d1a29486c7b01934ef8123da67123491');
  const [ecdsaVerified, setEcdsaVerified] = useState(true);
  
  const [watermarkRobustness, setWatermarkRobustness] = useState({
    embeddedBits: 192,
    recoveredBits: 192,
    ber: 0.000,
    status: 'SURVIVED LOSSY RECOMPRESSION'
  });

  const baseHashes = {
    h0: '4a8b193f01c89de32b91c49081e7d23589b21f98c173e047ba6312a0f81d9230',
    h1: '8f9210bc931a7de40182c4710183bda591823f0918237ba90123ef61823901a2',
    h2: 'e1092837482910ab381928374910283749102837491028374910283749102837',
    h3: 'c581902837481920394810293847102938471029384710293847102938471029',
    h4: '7190283749102938471029384710293847102938471029384710293847102938'
  };

  const getChainHashes = () => {
    if (!isTampered) {
      return baseHashes;
    }
    if (tamperedStage === 'stage1') {
      return {
        h0: baseHashes.h0,
        h1: 'FAIL_REDAC_MODIFIED_481928374910283749102837491028374910283749102837',
        h2: 'INVALID_CHAIN_381928374910283749102837491028374910283749102837491028',
        h3: 'INVALID_CHAIN_c58190283748192039481029384710293847102938471029384710',
        h4: 'INVALID_CHAIN_719028374910293847102938471029384710293847102938471029'
      };
    }
    return {
      h0: baseHashes.h0,
      h1: baseHashes.h1,
      h2: 'FAIL_COMPR_CORRUPTED_38192837491028374910283749102837491028374910283',
      h3: 'INVALID_CHAIN_c58190283748192039481029384710293847102938471029384710',
      h4: 'INVALID_CHAIN_719028374910293847102938471029384710293847102938471029'
    };
  };

  const currentChain = getChainHashes();

  const injectTamper = (stage) => {
    setIsTampered(true);
    setTamperedStage(stage);
    setEcdsaVerified(false);
    setWatermarkRobustness({
      embeddedBits: 192,
      recoveredBits: 168,
      ber: 0.125,
      status: 'WATERMARK INTEGRITY BREACHED'
    });
  };

  const restoreChain = () => {
    setIsTampered(false);
    setTamperedStage(null);
    setEcdsaVerified(true);
    setWatermarkRobustness({
      embeddedBits: 192,
      recoveredBits: 192,
      ber: 0.000,
      status: 'SURVIVED LOSSY RECOMPRESSION'
    });
  };

  const downloadManifest = () => {
    const bundle = {
      protocol: 'MUNINN-EVIDENCE-V1',
      createdAt: new Date().toISOString(),
      investigator: 'Muhammad Trisnatama (CTO / Evidence Officer)',
      recipientId: recipientTag,
      hashChain: currentChain,
      encryption: {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'HKDF-SHA256',
        ivLength: 96,
        authTag: '8b7f10a82736451e'
      },
      digitalSignature: {
        algorithm: 'ECDSA-P256-SHA256',
        publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE491...EXAMPLEKEY',
        signature: 'MEUCIQDx9...EVIDENCE_SIGNATURE_OK'
      },
      status: isTampered ? 'TAMPERED_INVALID' : 'VERIFIED_AUTHENTIC'
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence_manifest_${isTampered ? 'tampered' : 'authentic'}.muninn`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#08080C] text-zinc-100 pt-24 pb-16">
      <MuninnNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
            <Link href="/" className="hover:text-red-400">MUNINN</Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">MODUL 3: KEAMANAN, WATERMARK & RANTAI KUSTODI</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                Cryptographic Custody & DCT Watermarking
              </h1>
              <p className="mt-2 text-zinc-400 text-sm font-sans max-w-2xl">
                Menjamin integritas dan kerahasiaan bukti digital audit melalui rantai kustodi SHA-256 yang saling mengunci, watermark koefisien DCT tahan rekompresi, dan enkripsi klien AES-256-GCM.
              </p>
            </div>

            <Link
              href="/distribution"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-mono font-semibold shadow-lg shadow-red-950/40 shrink-0"
            >
              <span>Lanjut ke Modul 4: Distribusi & Verifikasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className={`mb-8 p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
          isTampered
            ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/50'
            : 'bg-emerald-950/30 border-emerald-500/40 shadow-xl shadow-emerald-950/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isTampered ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'}`}>
              {isTampered ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded font-bold ${
                  isTampered ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isTampered ? 'STATUS: TAMPERED' : 'STATUS: VALID & OTENTIK'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {isTampered ? 'Integritas Berkas Dilanggar!' : 'Rantai Kustodi Utuh'}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans mt-1">
                {isTampered
                  ? `Terdeteksi manipulasi byte tidak sah pada ${tamperedStage === 'stage1' ? 'Tahap 1 (Redaksi)' : 'Tahap 2 (Kompresi)'}! Seluruh mata rantai hash downstream otomatis terputus.`
                  : 'Seluruh tahapan dari raw evidence hingga paket terenkripsi terkunci secara matematis oleh Hash Chain SHA-256 dan Tanda Tangan ECDSA P-256.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isTampered ? (
              <button
                onClick={restoreChain}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pulihkan Rantai Kustodi Asli</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => injectTamper('stage1')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulasi Tamper di Tahap 1</span>
                </button>
                <button
                  onClick={() => injectTamper('stage2')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-mono transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tamper di Tahap 2</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            
            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Eksplorasi Rantai Kustodi (SHA-256 Hash Chain)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  RFC 6234 Cryptographic Standards
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-300">H0: RAW INGESTION DIGEST</span>
                    <span className="text-[10px] text-emerald-400">STATUS: TERKUNCI</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 break-all">{currentChain.h0}</div>
                  <div className="text-[10px] text-zinc-500">Formula: SHA-256(RawEvidenceBytes)</div>
                </div>

                <div className="flex justify-center -my-1 text-zinc-600">▼</div>

                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isTampered && tamperedStage === 'stage1'
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-black/40 border-white/5 text-zinc-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">H1: REDACTED CANVAS DIGEST</span>
                    <span className={`text-[10px] ${isTampered && tamperedStage === 'stage1' ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                      {isTampered && tamperedStage === 'stage1' ? 'TAMPERED / DIGEST BERBEDA!' : 'STATUS: TERKUNCI'}
                    </span>
                  </div>
                  <div className="text-[11px] break-all">{currentChain.h1}</div>
                  <div className="text-[10px] text-zinc-500">Formula: SHA-256(H0 || RedactedDataBytes)</div>
                </div>

                <div className="flex justify-center -my-1 text-zinc-600">▼</div>

                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isTampered
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-black/40 border-white/5 text-zinc-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">H2: DCT COMPRESSED PAYLOAD</span>
                    <span className={`text-[10px] ${isTampered ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                      {isTampered ? 'RANTAI GAGAL MEMVALIDASI' : 'STATUS: TERKUNCI'}
                    </span>
                  </div>
                  <div className="text-[11px] break-all">{currentChain.h2}</div>
                  <div className="text-[10px] text-zinc-500">Formula: SHA-256(H1 || DCTQuantizedBytes)</div>
                </div>

                <div className="flex justify-center -my-1 text-zinc-600">▼</div>

                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isTampered
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-black/40 border-white/5 text-zinc-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">H3: WATERMARKED EVIDENCE BUNDLE</span>
                    <span className={`text-[10px] ${isTampered ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                      {isTampered ? 'RANTAI RUSAK' : 'STATUS: TERKUNCI'}
                    </span>
                  </div>
                  <div className="text-[11px] break-all">{currentChain.h3}</div>
                  <div className="text-[10px] text-zinc-500">Formula: SHA-256(H2 || MidFreqDCTWatermark)</div>
                </div>

                <div className="flex justify-center -my-1 text-zinc-600">▼</div>

                <div className={`p-3.5 rounded-xl border space-y-1 ${
                  isTampered
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-black/40 border-white/5 text-zinc-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">H4: FINAL AES-256-GCM CIPHERTEXT</span>
                    <span className={`text-[10px] ${isTampered ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                      {isTampered ? 'INTEGRITY TAG MISMATCH' : 'STATUS: TERKUNCI'}
                    </span>
                  </div>
                  <div className="text-[11px] break-all">{currentChain.h4}</div>
                  <div className="text-[10px] text-zinc-500">Formula: SHA-256(H3 || EncryptedPayload)</div>
                </div>

              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div className="text-xs text-zinc-400 font-sans">
                  Unduh paket manifes terenkripsi untuk pengujian di Portal Verifikasi Klien.
                </div>
                <button
                  onClick={downloadManifest}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-mono font-semibold border border-white/10 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Unduh Paket .muninn</span>
                </button>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Robust DCT Watermarking
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                  Frekuensi Tengah
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Tag Identitas Penerima (Watermark Payload):
                  </label>
                  <input
                    type="text"
                    value={recipientTag}
                    onChange={(e) => setRecipientTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400">Panjang Payload:</span>
                    <span className="text-white">{watermarkRobustness.embeddedBits} bit</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400">Bit Error Rate (BER):</span>
                    <span className={`font-bold ${watermarkRobustness.ber === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {watermarkRobustness.ber.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400">Status Uji Rekompresi:</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${watermarkRobustness.ber === 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                      {watermarkRobustness.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 font-sans space-y-1">
                  <strong className="text-zinc-200">Mengapa Koefisien DCT Tengah?</strong>
                  <p>
                    Metode LSB (*Least Significant Bit*) langsung hancur oleh kompresi lossy JPEG. Watermark MUNINN disematkan pada koefisien frekuensi menengah (u+v ∈ [3,7]), sehingga tahan terhadap rekompresi dan manipulasi rasio Q.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F0F17] border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    WebCrypto AES-256-GCM
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Client-Side AEAD
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <div className="text-[10px] text-zinc-400 uppercase">Kunci Simetris 256-bit (ECDH / HKDF):</div>
                  <div className="text-[11px] text-zinc-300 break-all select-all">{encryptionKey}</div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase">Tanda Tangan Digital Investigator:</span>
                    <span className={`text-[10px] font-bold ${ecdsaVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ecdsaVerified ? 'ECDSA VALID' : 'SIGNATURE MISMATCH'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans">
                    Kurva Elliptic Curve P-256 mengesahkan identitas auditor pembuat bukti.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-[11px] text-zinc-300 font-sans">
                  🛡️ <strong>Zero-Knowledge Server:</strong> Kunci enkripsi tidak pernah dikirim ke server. Server hanya menyimpan ciphertext dan metadata manifes bertanda tangan.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <MuninnFooter />
    </main>
  );
}
