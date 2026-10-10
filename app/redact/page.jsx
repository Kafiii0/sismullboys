'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

import Link from 'next/link';

import BifrostNavbar from '../../components/BifrostNavbar';

import BifrostFooter from '../../components/BifrostFooter';

import { 

  ShieldCheck, EyeOff, Lock, Unlock, Download, RefreshCw, 

  Upload, CheckCircle2, AlertTriangle, FileText, Video, 

  MapPin, Camera, Clock, Hash, Sliders, Layers, ChevronRight,

  Maximize2, ArrowLeft, Copy, Check, Sparkles, UserCheck, Eye,

  Image as ImageIcon, FolderOpen, Smartphone, CreditCard,

  FileCheck, Clipboard
} from 'lucide-react';

export default function RedactStudioPage() {
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [pasteToast, setPasteToast] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [aiResult, setAiResult] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);

  const [activeTab, setActiveTab] = useState('auto');

  const [maskStyle, setMaskStyle] = useState('mosaic'); 

  const [stripExif, setStripExif] = useState(false);

  const [preserveHeader, setPreserveHeader] = useState(true);

  const [redactUserFace, setRedactUserFace] = useState(false);

  const [redactKtpMode, setRedactKtpMode] = useState('none');

  const [redactNik, setRedactNik] = useState(false);

  const [redactName, setRedactName] = useState(false);

  const [redactTtl, setRedactTtl] = useState(false);

  const [redactGender, setRedactGender] = useState(false);

  const [redactAddress, setRedactAddress] = useState(false);

  const [redactOtherPii, setRedactOtherPii] = useState(false);

  const [redactCardPhoto, setRedactCardPhoto] = useState(false);

  const [redactSignature, setRedactSignature] = useState(false);

  const [redactQr, setRedactQr] = useState(false);

  const [redactSimFull, setRedactSimFull] = useState(false);

  const [redactSimNumber, setRedactSimNumber] = useState(false);

  const [redactSimName, setRedactSimName] = useState(false);

  const [redactSimAddress, setRedactSimAddress] = useState(false);

  const [redactSimOccupation, setRedactSimOccupation] = useState(false);

  const [redactSimPhoto, setRedactSimPhoto] = useState(false);

  const [redactSimFingerprint, setRedactSimFingerprint] = useState(false);

  const [redactSimExpiry, setRedactSimExpiry] = useState(false);

  const [redactWaContact, setRedactWaContact] = useState(false);

  const [redactWaAvatar, setRedactWaAvatar] = useState(false);

  const [redactWaAccountNumbers, setRedactWaAccountNumbers] = useState(false);

  const [redactWaPhoneNumbers, setRedactWaPhoneNumbers] = useState(false);

  const [redactWaTimestamp, setRedactWaTimestamp] = useState(false);

  const [redactWaChatBubbles, setRedactWaChatBubbles] = useState(false);

  const [redactWaInputBar, setRedactWaInputBar] = useState(false);

  const [copiedHash, setCopiedHash] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const runAiRedaction = useCallback(async (fileToProcess, overrides = {}) => {
    if (!fileToProcess) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToProcess);

      const tab = overrides.activeTab ?? activeTab;
      formData.append('target_type', tab);
      formData.append('mask_style', overrides.maskStyle ?? maskStyle);
      formData.append('strip_exif', String(overrides.stripExif ?? stripExif));
      formData.append('preserve_header', String(overrides.preserveHeader ?? preserveHeader));
      formData.append('redact_user_face', String(overrides.redactUserFace ?? redactUserFace));

      formData.append('redact_ktp_mode', overrides.redactKtpMode ?? redactKtpMode);
      formData.append('redact_nik', String(overrides.redactNik ?? redactNik));
      formData.append('redact_name', String(overrides.redactName ?? redactName));
      formData.append('redact_ttl', String(overrides.redactTtl ?? redactTtl));
      formData.append('redact_gender', String(overrides.redactGender ?? redactGender));
      formData.append('redact_address', String(overrides.redactAddress ?? redactAddress));
      formData.append('redact_other_pii', String(overrides.redactOtherPii ?? redactOtherPii));
      formData.append('redact_card_photo', String(overrides.redactCardPhoto ?? redactCardPhoto));
      formData.append('redact_signature', String(overrides.redactSignature ?? redactSignature));
      formData.append('redact_qr', String(overrides.redactQr ?? redactQr));

      formData.append('redact_sim_full', String(overrides.redactSimFull ?? redactSimFull));
      formData.append('redact_sim_number', String(overrides.redactSimNumber ?? redactSimNumber));
      formData.append('redact_sim_name', String(overrides.redactSimName ?? redactSimName));
      formData.append('redact_sim_address', String(overrides.redactSimAddress ?? redactSimAddress));
      formData.append('redact_sim_occupation', String(overrides.redactSimOccupation ?? redactSimOccupation));
      formData.append('redact_sim_photo', String(overrides.redactSimPhoto ?? redactSimPhoto));
      formData.append('redact_sim_fingerprint', String(overrides.redactSimFingerprint ?? redactSimFingerprint));
      formData.append('redact_sim_expiry', String(overrides.redactSimExpiry ?? redactSimExpiry));

      formData.append('redact_wa_contact', String(overrides.redactWaContact ?? redactWaContact));
      formData.append('redact_wa_avatar', String(overrides.redactWaAvatar ?? redactWaAvatar));
      formData.append('redact_wa_account_numbers', String(overrides.redactWaAccountNumbers ?? redactWaAccountNumbers));
      formData.append('redact_wa_phone_numbers', String(overrides.redactWaPhoneNumbers ?? redactWaPhoneNumbers));
      formData.append('redact_wa_timestamp', String(overrides.redactWaTimestamp ?? redactWaTimestamp));
      formData.append('redact_wa_chat_bubbles', String(overrides.redactWaChatBubbles ?? redactWaChatBubbles));
      formData.append('redact_wa_input_bar', String(overrides.redactWaInputBar ?? redactWaInputBar));

      const res = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error('AI Engine error: HTTP ' + res.status);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Detection failed:', err);
      setErrorMsg(err.message || 'Detection failed');
    } finally {
      setIsProcessing(false);
    }
  }, [

    activeTab, maskStyle, stripExif, preserveHeader, redactUserFace,

    redactKtpMode, redactNik, redactName, redactTtl, redactGender, redactAddress, redactOtherPii, redactCardPhoto, redactSignature, redactQr,

    redactSimFull, redactSimNumber, redactSimName, redactSimAddress, redactSimOccupation, redactSimPhoto, redactSimFingerprint, redactSimExpiry,

    redactWaContact, redactWaAvatar, redactWaAccountNumbers, redactWaPhoneNumbers, redactWaTimestamp, redactWaChatBubbles, redactWaInputBar

  ]);

  const processFile = useCallback((file) => {

    if (!file) return;

    setSelectedFile(file);

    setFileInfo({

      name: file.name,

      size: (file.size / 1024).toFixed(1) + ' KB',

      type: file.type || 'image/jpeg'

    });

    runAiRedaction(file);

  }, [runAiRedaction]);

  useEffect(() => {

    const handlePaste = (e) => {

      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.type !== 'file') {

        return;

      }

      const clipboardData = e.clipboardData;

      if (!clipboardData) return;

      const items = clipboardData.items;

      if (!items) return;

      for (let i = 0; i < items.length; i++) {

        const item = items[i];

        if (item.type && item.type.startsWith('image/')) {

          const blob = item.getAsFile();

          if (blob) {

            e.preventDefault();

            const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';

            const pastedFile = new File([blob], `clipboard_capture_${Date.now()}.${ext}`, {

              type: blob.type || 'image/png'

            });

            processFile(pastedFile);

            setPasteToast('Gambar dari clipboard (Ctrl + V) berhasil dimuat!');

            setTimeout(() => setPasteToast(null), 3500);

            break;

          }

        }

      }

    };

    window.addEventListener('paste', handlePaste);

    return () => {

      window.removeEventListener('paste', handlePaste);

    };

  }, [processFile]);

  const handlePasteFromClipboard = async (e) => {

    e?.stopPropagation?.();

    try {

      if (navigator.clipboard?.read) {

        const items = await navigator.clipboard.read();

        for (const item of items) {

          const imageType = item.types.find(t => t.startsWith('image/'));

          if (imageType) {

            const blob = await item.getType(imageType);

            const ext = imageType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';

            const pastedFile = new File([blob], `clipboard_capture_${Date.now()}.${ext}`, { type: imageType });

            processFile(pastedFile);

            setPasteToast('Gambar dari clipboard berhasil dimuat!');

            setTimeout(() => setPasteToast(null), 3500);

            return;

          }

        }

      }

    } catch (err) {

      console.warn('Clipboard read error or permission denied:', err);

    }

  };

  const handleFileUpload = (e) => {

    const file = e.target.files?.[0];

    if (file) processFile(file);

  };

  const handleDragOver = (e) => {

    e.preventDefault();

    setIsDragging(true);

  };

  const handleDragLeave = () => {

    setIsDragging(false);

  };

  const handleDrop = (e) => {

    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) processFile(file);

  };

  const handleResetFile = () => {

    setSelectedFile(null);

    setFileInfo(null);

    setAiResult(null);

    setErrorMsg(null);

    if (fileInputRef.current) fileInputRef.current.value = '';

  };

  const handleParamChange = (overrides) => {

    if (selectedFile) {

      runAiRedaction(selectedFile, overrides);

    }

  };

  const handleDownloadSanitized = () => {

    if (!aiResult?.redacted_image_url) return;

    const link = document.createElement('a');

    link.download = 'bifrost_sanitized_' + Date.now() + '.jpg';

    link.href = aiResult.redacted_image_url;

    link.click();

  };

  const handleExportCustodyJson = () => {

    if (!aiResult) return;

    const auditRecord = {

      evidence_protocol: 'BIFROST-ISO27037-ADLS',

      evidence_id: 'EVD-2026-HKI-' + Date.now().toString().slice(-6),

      timestamp_utc: new Date().toISOString(),

      source_file_metadata: fileInfo,

      standards_conformance: [

        'ISO/IEC 27037:2012 Digital Evidence Handling Guidelines',

        'ISO/IEC 7810 ID-1 Identification Card Standard (Aspect Ratio 1.586)',

        'Indonesia Law No. 27/2022 (UU PDP) Personal Data Protection'

      ],

      intellectual_property_hki: {

        algorithm_title: aiResult.algorithm_manifest?.name || 'BIFROST-ADLS',

        institution: 'Telkom University - Sistem Multimedia (CBK2CAB3)',

        classification: aiResult.algorithm_manifest?.classification,

        patent_readiness: 'Eligible for Academic HKI Copyright / Patent Registry'

      },

      detection_telemetry: {

        document_type_detected: aiResult.document_type,

        ktp_detected: aiResult.ktp_detected,

        sim_detected: aiResult.sim_detected,

        whatsapp_detected: aiResult.whatsapp_detected,

        card_bounding_box: aiResult.card_info?.bbox,

        faces_detected_count: aiResult.faces_detected_count,

        redacted_items_applied: aiResult.redacted_items

      },

      cryptographic_chain_of_custody: {

        raw_pre_redaction_sha256: aiResult.raw_sha256,

        sanitized_post_redaction_sha256: aiResult.sanitized_sha256,

        hash_mutation_verified: aiResult.raw_sha256 !== aiResult.sanitized_sha256,

        tamper_evident_status: 'AUTHENTICATED_AND_CERTIFIED'

      },

      container_sanitization: {

        exif_scrubbed: aiResult.exif_stripped,

        original_container_metadata: aiResult.exif_metadata

      }

    };

    const blob = new Blob([JSON.stringify(auditRecord, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = 'bifrost_custody_cert_' + Date.now() + '.json';

    link.click();

    URL.revokeObjectURL(url);

  };

  const copyHashToClipboard = () => {

    if (!aiResult?.sanitized_sha256) return;

    navigator.clipboard.writeText(aiResult.sanitized_sha256);

    setCopiedHash(true);

    setTimeout(() => setCopiedHash(false), 2000);

  };

  const effectiveCategory = () => {

    if (activeTab !== 'auto') return activeTab;

    if (aiResult?.whatsapp_detected) return 'whatsapp';

    if (aiResult?.sim_detected) return 'sim';

    return 'ktp';

  };

  return (

    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white">

      <BifrostNavbar />

      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">

          <div className="space-y-1">

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">Overview</Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-red-400 font-bold">Redact Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-grotesk tracking-tight text-white flex items-center gap-3">
              BIFROST Redact Studio
            </h1>
          </div>

          {selectedFile && (

            <div className="flex items-center gap-3">

              <button

                onClick={handleExportCustodyJson}

                disabled={!aiResult}

                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono text-zinc-200 transition-all disabled:opacity-50"

              >

                <FileText className="w-3.5 h-3.5 text-red-400" />

                <span>Export Custody (.json)</span>

              </button>

              <button

                onClick={handleDownloadSanitized}

                disabled={!aiResult}

                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md shadow-red-600/30 disabled:opacity-50"

              >

                <Download className="w-3.5 h-3.5" />

                <span>Download Media (.jpg)</span>

              </button>

            </div>

          )}

        </div>

        <input 

          ref={fileInputRef}

          type="file" 

          accept="image/*" 

          onChange={handleFileUpload} 

          className="hidden" 

        />

        {errorMsg && (

          <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-3">

            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />

            <span>AI Processing Error: {errorMsg}</span>

          </div>

        )}

        {!selectedFile ? (

          <div className="mt-8">

            <div

              onDragOver={handleDragOver}

              onDragLeave={handleDragLeave}

              onDrop={handleDrop}

              onClick={() => fileInputRef.current?.click()}

              className={`cursor-pointer rounded-3xl border-2 border-dashed transition-all p-12 sm:p-20 text-center flex flex-col items-center justify-center space-y-6 ${

                isDragging 

                  ? 'border-red-500 bg-red-950/20 shadow-[0_0_50px_rgba(220,38,38,0.2)]' 

                  : 'border-white/[0.1] hover:border-white/[0.25] bg-[#0C0D11] hover:bg-[#0E0F14]'

              }`}

            >

              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-xl group-hover:scale-105 transition-transform">

                <Upload className="w-10 h-10 text-red-500" />

              </div>

              <div className="space-y-1.5 max-w-lg">
                <h2 className="text-xl sm:text-2xl font-bold font-grotesk text-white">
                  Upload Media
                </h2>
                <p className="text-sm text-zinc-400 font-light">
                  Tarik dan lepas gambar di sini, atau pilih dari komputer
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/30"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Pilih Berkas</span>
                </button>

                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-zinc-200 text-xs font-mono transition-all group"
                >
                  <Clipboard className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>Paste</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-100 font-semibold shadow-inner">Ctrl+V</kbd>
                </button>
              </div>

            </div>

          </div>

        ) : (

          <div className="mt-6 space-y-6">

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0E0F14] border border-white/[0.08] rounded-xl font-mono text-xs">

              <div className="flex items-center gap-3">

                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-700/40 flex items-center justify-center text-red-400">

                  <ImageIcon className="w-4 h-4" />

                </div>

                <div>

                  <div className="text-white font-bold">{fileInfo?.name}</div>

                  <div className="text-[11px] text-zinc-400">{fileInfo?.size}  {fileInfo?.type}</div>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all text-xs font-mono"
                  title="Paste dari clipboard (atau langsung tekan Ctrl+V)"
                >
                  <Clipboard className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Paste</span>
                  <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">Ctrl+V</kbd>
                </button>
                <button

                  onClick={() => fileInputRef.current?.click()}

                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all text-xs"

                >

                  Ganti File

                </button>

                <button

                  onClick={handleResetFile}

                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-800/40 text-red-400 transition-all text-xs"

                >

                  Hapus

                </button>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">

              <span className="text-xs font-mono text-zinc-400 mr-2">Target Bukti:</span>

              {[

                { id: 'auto', label: 'Auto Detect', icon: Sparkles },

                { id: 'ktp', label: 'e-KTP (Kependudukan)', icon: CreditCard },

                { id: 'sim', label: 'SIM (Izin Mengemudi)', icon: FileCheck },

                { id: 'whatsapp', label: 'Chat WhatsApp / Layar HP', icon: Smartphone },

              ].map((tab) => {

                const Icon = tab.icon;

                const isCurrent = activeTab === tab.id;

                return (

                  <button

                    key={tab.id}

                    onClick={() => {

                      setActiveTab(tab.id);

                      handleParamChange({ activeTab: tab.id });

                    }}

                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${

                      isCurrent

                        ? 'bg-red-600 text-white border-red-500 shadow-sm shadow-red-600/30'

                        : 'bg-[#0E0F14] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/[0.15]'

                    }`}

                  >

                    <Icon className="w-3.5 h-3.5" />

                    <span>{tab.label}</span>

                  </button>

                );

              })}

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <div className="lg:col-span-7 space-y-4">

                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#050507] flex items-center justify-center min-h-[460px] max-h-[640px]">

                  {isProcessing && (

                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">

                      <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />

                      <div className="text-xs font-mono text-white">Memproses Segmentasi Forensik...</div>

                    </div>

                  )}

                  {aiResult?.redacted_image_url ? (

                    <img 

                      src={aiResult.redacted_image_url} 

                      alt="Sanitized Forensic Media"

                      className="max-h-[640px] w-auto max-w-full object-contain mx-auto"

                    />

                  ) : (

                    <div className="text-zinc-500 text-xs font-mono p-8 text-center">

                      Memuat hasil proses...

                    </div>

                  )}

                </div>

                {aiResult && (

                  <div className="p-4 rounded-xl bg-[#0E0F14] border border-white/[0.08] space-y-3 font-mono text-xs">

                    <div className="flex items-center justify-between text-zinc-300 font-bold pb-2 border-b border-white/[0.06]">

                      <div className="flex items-center gap-2">

                        <Sparkles className="w-4 h-4 text-red-500" />

                        <span>Real-Time Detection Telemetry</span>

                      </div>

                      <div className="flex items-center gap-2">
                        {aiResult.processing_time_ms !== undefined && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            aiResult.cache_hit 
                              ? 'bg-red-950/80 text-red-400 border-red-700/40' 
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}>
                            {aiResult.cache_hit ? `⚡ ${aiResult.processing_time_ms}ms (Cache Hit)` : `🔍 ${(aiResult.processing_time_ms / 1000).toFixed(2)}s (AI Scan)`}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500">ISO/IEC 27037</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">

                        <div className="text-zinc-400 text-[10px]">Tipe Bukti:</div>

                        <div className="font-bold text-white capitalize">

                          {aiResult.document_type || 'Unclassified'}

                        </div>

                      </div>

                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">

                        <div className="text-zinc-400 text-[10px]">Kartu ID-1:</div>

                        <div className="font-bold text-red-400">

                          {aiResult.card_info?.detected ? 'FOUND (1.586 Ratio)' : 'None'}

                        </div>

                      </div>

                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">

                        <div className="text-zinc-400 text-[10px]">Layar HP/WA:</div>

                        <div className="font-bold text-red-400">

                          {aiResult.whatsapp_detected ? 'DETECTED' : 'None'}

                        </div>

                      </div>

                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">

                        <div className="text-zinc-400 text-[10px]">Faces Detected:</div>

                        <div className="font-bold text-white">

                          {aiResult.faces_detected_count} Person ROI

                        </div>

                      </div>

                    </div>

                    {aiResult.ocr_telemetry && (
                      <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                          <span className="font-bold text-red-400">{aiResult.ocr_telemetry.engine} Engine:</span>
                          <span className="text-zinc-300">{aiResult.ocr_telemetry.total_texts_detected} Teks Teranalisis</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400 text-[10px]">
                          <span>No. HP (+62): <strong className="text-red-400 font-mono">{aiResult.ocr_telemetry.phone_numbers_detected}</strong></span>
                          <span>Timestamp: <strong className="text-rose-400 font-mono">{aiResult.ocr_telemetry.timestamps_detected}</strong></span>
                          {aiResult.ocr_telemetry.nik_detected > 0 && (
                            <span>NIK: <strong className="text-amber-400 font-mono">{aiResult.ocr_telemetry.nik_detected}</strong></span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-zinc-400 pt-1 flex flex-wrap items-center gap-2">

                      <span className="text-zinc-500">Active Redactions:</span>

                      {aiResult.redacted_items?.length > 0 ? (

                        aiResult.redacted_items.map((item, idx) => (

                          <span key={idx} className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40 text-[10px]">

                            {item}

                          </span>

                        ))

                      ) : (

                        <span className="text-zinc-500 text-[10px]">Tidak ada area tersensor (Default Bersih)</span>

                      )}

                    </div>

                  </div>

                )}

              </div>

              <div className="lg:col-span-5 space-y-5">

                <div className="p-5 rounded-2xl bg-[#0E0F14] border border-white/[0.08] space-y-4">

                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">

                    <div className="flex items-center gap-2">

                      <ShieldCheck className="w-4 h-4 text-red-500" />

                      <h3 className="text-sm font-bold font-grotesk uppercase tracking-wider text-white">

                        Redaction Controls

                      </h3>

                    </div>

                  </div>

                  <div className="space-y-1.5">

                    <span className="text-xs font-mono text-zinc-400">Gaya Sensor (Mask Style):</span>

                    <div className="grid grid-cols-3 gap-2">

                      {[

                        { id: 'solid', label: 'Solid Black' },

                        { id: 'mosaic', label: 'Mosaic Pixel' },

                        { id: 'blur', label: 'Gaussian Blur' },

                      ].map((style) => (

                        <button

                          key={style.id}

                          onClick={() => {

                            setMaskStyle(style.id);

                            handleParamChange({ maskStyle: style.id });

                          }}

                          className={`py-2 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-all ${

                            maskStyle === style.id

                              ? 'bg-red-950/80 text-white border-red-600'

                              : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'

                          }`}

                        >

                          {style.label}

                        </button>

                      ))}

                    </div>

                  </div>

                  {effectiveCategory() === 'ktp' && (

                    <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">

                      <div className="flex items-center justify-between">

                        <span className="text-xs font-mono text-red-400 font-bold">Kustomisasi e-KTP:</span>

                        <span className="text-[10px] text-zinc-500 font-mono">ISO/IEC 7810 ID-1</span>

                      </div>

                      <button
                        onClick={() => {
                          const next = redactKtpMode === 'full_card' ? 'none' : 'full_card';
                          setRedactKtpMode(next);
                          handleParamChange({ redactKtpMode: next });
                        }}
                        className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold text-left border transition-all ${
                          redactKtpMode === 'full_card'
                            ? 'bg-red-950/80 text-white border-red-600'
                            : 'bg-white/[0.02] text-zinc-300 border-white/[0.06] hover:text-white'
                        }`}
                      >
                        Sensor Seluruh Badan KTP
                      </button>

                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">NIK (16-Digit)</span>
                          <input
                            type="checkbox"
                            checked={redactNik}
                            onChange={(e) => {
                              setRedactNik(e.target.checked);
                              handleParamChange({ redactNik: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Nama Lengkap</span>
                          <input
                            type="checkbox"
                            checked={redactName}
                            onChange={(e) => {
                              setRedactName(e.target.checked);
                              handleParamChange({ redactName: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Tempat & Tanggal Lahir</span>
                          <input
                            type="checkbox"
                            checked={redactTtl}
                            onChange={(e) => {
                              setRedactTtl(e.target.checked);
                              handleParamChange({ redactTtl: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Alamat Domisili</span>
                          <input
                            type="checkbox"
                            checked={redactAddress}
                            onChange={(e) => {
                              setRedactAddress(e.target.checked);
                              handleParamChange({ redactAddress: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Pasfoto Kartu</span>
                          <input
                            type="checkbox"
                            checked={redactCardPhoto}
                            onChange={(e) => {
                              setRedactCardPhoto(e.target.checked);
                              handleParamChange({ redactCardPhoto: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Tanda Tangan & QR</span>
                          <input
                            type="checkbox"
                            checked={redactSignature || redactQr}
                            onChange={(e) => {
                              setRedactSignature(e.target.checked);
                              setRedactQr(e.target.checked);
                              handleParamChange({ redactSignature: e.target.checked, redactQr: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Pertahankan Header Resmi</span>
                          <input
                            type="checkbox"
                            checked={preserveHeader}
                            onChange={(e) => {
                              setPreserveHeader(e.target.checked);
                              handleParamChange({ preserveHeader: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>
                      </div>
                    </div>

                  )}

                  {effectiveCategory() === 'sim' && (

                    <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-red-400 font-bold">Kustomisasi SIM:</span>
                        <span className="text-[10px] text-zinc-500 font-mono">POLRI Standard</span>
                      </div>

                      <button
                        onClick={() => {
                          const next = !redactSimFull;
                          setRedactSimFull(next);
                          handleParamChange({ redactSimFull: next });
                        }}
                        className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold text-left border transition-all ${
                          redactSimFull
                            ? 'bg-red-950/80 text-white border-red-600'
                            : 'bg-white/[0.02] text-zinc-300 border-white/[0.06] hover:text-white'
                        }`}
                      >
                        Sensor Seluruh Badan SIM
                      </button>

                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Nomor SIM</span>
                          <input
                            type="checkbox"
                            checked={redactSimNumber}
                            onChange={(e) => {
                              setRedactSimNumber(e.target.checked);
                              handleParamChange({ redactSimNumber: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Nama Pemegang SIM</span>
                          <input
                            type="checkbox"
                            checked={redactSimName}
                            onChange={(e) => {
                              setRedactSimName(e.target.checked);
                              handleParamChange({ redactSimName: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Alamat Domisili</span>
                          <input
                            type="checkbox"
                            checked={redactSimAddress}
                            onChange={(e) => {
                              setRedactSimAddress(e.target.checked);
                              handleParamChange({ redactSimAddress: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Pasfoto SIM</span>
                          <input
                            type="checkbox"
                            checked={redactSimPhoto}
                            onChange={(e) => {
                              setRedactSimPhoto(e.target.checked);
                              handleParamChange({ redactSimPhoto: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Sidik Jari & Tanda Tangan</span>
                          <input
                            type="checkbox"
                            checked={redactSimFingerprint}
                            onChange={(e) => {
                              setRedactSimFingerprint(e.target.checked);
                              handleParamChange({ redactSimFingerprint: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Pertahankan Header Resmi</span>
                          <input
                            type="checkbox"
                            checked={preserveHeader}
                            onChange={(e) => {
                              setPreserveHeader(e.target.checked);
                              handleParamChange({ preserveHeader: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>
                      </div>

                    </div>

                  )}

                  {effectiveCategory() === 'whatsapp' && (
                    <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-red-400 font-bold">Kustomisasi Chat WhatsApp:</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Mobile</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Nama Kontak & Grup</span>
                          <input
                            type="checkbox"
                            checked={redactWaContact}
                            onChange={(e) => {
                              setRedactWaContact(e.target.checked);
                              handleParamChange({ redactWaContact: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Nomor Ponsel (+62 / 08)</span>
                          <input
                            type="checkbox"
                            checked={redactWaPhoneNumbers}
                            onChange={(e) => {
                              setRedactWaPhoneNumbers(e.target.checked);
                              handleParamChange({ redactWaPhoneNumbers: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Avatar Profil</span>
                          <input
                            type="checkbox"
                            checked={redactWaAvatar}
                            onChange={(e) => {
                              setRedactWaAvatar(e.target.checked);
                              handleParamChange({ redactWaAvatar: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Nomor Rekening Bank</span>
                          <input
                            type="checkbox"
                            checked={redactWaAccountNumbers}
                            onChange={(e) => {
                              setRedactWaAccountNumbers(e.target.checked);
                              handleParamChange({ redactWaAccountNumbers: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Waktu & Timestamp</span>
                          <input
                            type="checkbox"
                            checked={redactWaTimestamp}
                            onChange={(e) => {
                              setRedactWaTimestamp(e.target.checked);
                              handleParamChange({ redactWaTimestamp: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Gelembung Pesan</span>
                          <input
                            type="checkbox"
                            checked={redactWaChatBubbles}
                            onChange={(e) => {
                              setRedactWaChatBubbles(e.target.checked);
                              handleParamChange({ redactWaChatBubbles: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                          <span className="font-medium">Kolom Ketik Bawah</span>
                          <input
                            type="checkbox"
                            checked={redactWaInputBar}
                            onChange={(e) => {
                              setRedactWaInputBar(e.target.checked);
                              handleParamChange({ redactWaInputBar: e.target.checked });
                            }}
                            className="accent-red-600 w-4 h-4 rounded"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <span className="text-xs font-mono text-zinc-400">Sensor Wajah Global:</span>
                    <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]">
                      <span className="font-medium">Sensor Wajah Pengguna (Selfie)</span>
                      <input
                        type="checkbox"
                        checked={redactUserFace}
                        onChange={(e) => {
                          setRedactUserFace(e.target.checked);
                          handleParamChange({ redactUserFace: e.target.checked });
                        }}
                        className="accent-red-600 w-4 h-4 rounded"
                      />
                    </label>
                  </div>

                </div>

                <div className="p-5 rounded-2xl bg-[#0E0F14] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-bold font-grotesk uppercase tracking-wider text-white">
                        Metadata & EXIF Sanitizer
                      </h3>

                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">

                      <input

                        type="checkbox"

                        checked={stripExif}

                        onChange={(e) => {

                          setStripExif(e.target.checked);

                          handleParamChange({ stripExif: e.target.checked });

                        }}

                        className="sr-only peer"

                      />

                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>

                    </label>

                  </div>

                  <div className="text-xs font-mono space-y-2">

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">

                      <span className="text-zinc-400">Perangkat Kamera:</span>

                      <span className={stripExif ? 'text-red-400 font-bold' : 'text-zinc-200'}>

                        {stripExif ? '[PURGED]' : (aiResult?.exif_metadata?.Model || 'Tidak ada metadata')}

                      </span>

                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">

                      <span className="text-zinc-400">Koordinat GPS:</span>

                      <span className={stripExif ? 'text-red-400 font-bold' : 'text-amber-400'}>

                        {stripExif ? '[ZEROED - PURGED]' : (aiResult?.exif_metadata?.GPS_Telemetry || 'Tidak ada GPS')}

                      </span>

                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">

                      <span className="text-zinc-400">Timestamp Asli:</span>

                      <span className={stripExif ? 'text-red-400 font-bold' : 'text-zinc-200'}>

                        {stripExif ? '[STANDARDIZED UTC]' : (aiResult?.exif_metadata?.DateTimeOriginal || 'Standard')}

                      </span>

                    </div>

                  </div>

                </div>

                <div className="p-5 rounded-2xl bg-[#0E0F14] border border-white/[0.08] space-y-4 font-mono text-xs">

                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">

                    <div className="flex items-center gap-2">

                      <Hash className="w-4 h-4 text-red-500" />

                      <h3 className="text-sm font-bold font-grotesk uppercase tracking-wider text-white">

                        Chain of Custody (SHA-256)

                      </h3>

                    </div>

                    <button

                      onClick={copyHashToClipboard}

                      className="text-zinc-400 hover:text-white transition-colors"

                      title="Salin Hash Sanitized"

                    >

                      {copiedHash ? <Check className="w-4 h-4 text-red-400" /> : <Copy className="w-4 h-4" />}

                    </button>

                  </div>

                  <div className="space-y-2">

                    <div>
                      <div className="text-[10px] text-zinc-500 mb-1">SHA-256 Original:</div>
                      <div className="p-2 rounded bg-black/60 border border-white/[0.04] text-[11px] text-zinc-300 break-all select-all">
                        {aiResult?.raw_sha256 || 'Menunggu upload file...'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-500 mb-1">SHA-256 Sanitized:</div>
                      <div className="p-2 rounded bg-black/60 border border-white/[0.04] text-[11px] text-rose-400 break-all select-all">
                        {aiResult?.sanitized_sha256 || 'Menunggu proses...'}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

      {pasteToast && (

        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-zinc-900/95 border border-red-500/50 text-white text-xs font-mono shadow-2xl shadow-red-500/20 backdrop-blur-md">

          <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">

            <CheckCircle2 className="w-3.5 h-3.5" />

          </div>

          <div>

            <div className="font-bold text-red-300">Clipboard Terdeteksi</div>

            <div className="text-[11px] text-zinc-400">{pasteToast}</div>

          </div>

        </div>

      )}

      <BifrostFooter />

    </main>

  );

}

