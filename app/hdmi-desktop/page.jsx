'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Monitor, Tv, AlertTriangle, Eye, EyeOff, 
  MessageSquare, Bookmark, Lock, RefreshCw, Power, Check, Sparkles 
} from 'lucide-react';

export default function HDMIDesktopPage() {
  const [status, setStatus] = useState({
    is_streaming: true,
    is_panic: false,
    is_projector_open: false,
    fps: 30,
    mask_style: 'mosaic',
    selected_monitor: 1,
    monitors: [
      { index: 1, label: 'Layar 1 (Utama)' }
    ],
    guards: {
      toast: true,
      bookmark: true,
      whatsapp: true,
      ocr: true,
      anti_loop: true
    }
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8766/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      // Offline / connecting
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for Panic Blackout [Spacebar]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleStream = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8766/toggle_stream', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ ...prev, is_streaming: data.is_streaming }));
      }
    } catch (e) {}
  };

  const togglePanic = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8766/toggle_panic', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ ...prev, is_panic: data.is_panic }));
      }
    } catch (e) {}
  };

  const toggleProjector = async () => {
    try {
      const endpoint = status.is_projector_open ? '/projector/close' : '/projector/open';
      const res = await fetch(`http://127.0.0.1:8766${endpoint}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ ...prev, is_projector_open: data.is_projector_open }));
      }
    } catch (e) {}
  };

  const updateGuard = async (guardName) => {
    const newGuards = {
      ...status.guards,
      [guardName]: !status.guards[guardName]
    };
    setStatus(prev => ({ ...prev, guards: newGuards }));
    
    try {
      await fetch('http://127.0.0.1:8766/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mask_style: status.mask_style,
          selected_monitor: status.selected_monitor,
          enable_toast: newGuards.toast,
          enable_bookmark: newGuards.bookmark,
          enable_wa: newGuards.whatsapp,
          enable_ocr: newGuards.ocr,
          enable_anti_loop: newGuards.anti_loop
        })
      });
    } catch (e) {}
  };

  const setMaskStyle = async (style) => {
    setStatus(prev => ({ ...prev, mask_style: style }));
    try {
      await fetch('http://127.0.0.1:8766/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mask_style: style,
          selected_monitor: status.selected_monitor,
          enable_toast: status.guards.toast,
          enable_bookmark: status.guards.bookmark,
          enable_wa: status.guards.whatsapp,
          enable_ocr: status.guards.ocr,
          enable_anti_loop: status.guards.anti_loop
        })
      });
    } catch (e) {}
  };

  const setMonitor = async (idx) => {
    const num = parseInt(idx, 10);
    setStatus(prev => ({ ...prev, selected_monitor: num }));
    try {
      await fetch('http://127.0.0.1:8766/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mask_style: status.mask_style,
          selected_monitor: num,
          enable_toast: status.guards.toast,
          enable_bookmark: status.guards.bookmark,
          enable_wa: status.guards.whatsapp,
          enable_ocr: status.guards.ocr,
          enable_anti_loop: status.guards.anti_loop
        })
      });
    } catch (e) {}
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-slate-800 antialiased select-none overflow-hidden font-sans">
      
      {/* Top Floating Glass Header */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">BIFROST</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                HDMI Presentation Shield
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Proteksi layar proyektor fisik & share screen Google Meet
            </p>
          </div>
        </div>

        {/* Live Badges & Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-600">
            <span className={`w-2 h-2 rounded-full ${status.is_panic ? 'bg-amber-500 animate-ping' : status.is_streaming ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{status.is_panic ? 'Layar Hitam' : status.is_streaming ? `Proteksi Aktif • ${status.fps || 30} FPS` : 'Siaga'}</span>
          </div>

          <button
            onClick={toggleProjector}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              status.is_projector_open 
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Tv className="w-4 h-4 text-emerald-500" />
            <span>{status.is_projector_open ? 'Tutup Proyektor TV' : 'Buka Proyektor TV'}</span>
          </button>

          <button
            onClick={togglePanic}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              status.is_panic
                ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-2 animate-pulse'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
            title="Tekan Spasi untuk Layar Hitam Darurat"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{status.is_panic ? 'Matikan Panic Blackout' : 'Layar Hitam [Spasi]'}</span>
          </button>
        </div>
      </header>

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden p-5 gap-5">
        
        {/* Left Side: Live Stream Monitor */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-sm flex items-center justify-center">
            {status.is_streaming ? (
              <img
                src="http://127.0.0.1:8766/stream"
                alt="Sanitized Screen Stream"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block';
                }}
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Monitor className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-white">Layar Sedang Dijeda</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Klik tombol <strong>Mulai Perlindungan</strong> di bawah untuk mengaktifkan pemindaian layar dan sensor privasi.
                </p>
              </div>
            )}

            {/* Overlaid Status Pill */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-lg">
              <span className={`w-2 h-2 rounded-full ${status.is_panic ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{status.is_panic ? 'PANIC BLACKOUT AKTIF' : 'FEED BERSIH PROYEKTOR'}</span>
            </div>

            {/* Bottom Stream Telemetry */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-white/80 px-4 py-2 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-4">
                <span>FPS: <strong className="text-white">{status.fps || 30}</strong></span>
                <span>•</span>
                <span>Resolusi: <strong className="text-white">Full HD Proyeksi</strong></span>
                <span>•</span>
                <span>Anti-Loop: <strong className={status.guards?.anti_loop ? "text-emerald-400" : "text-slate-400"}>{status.guards?.anti_loop ? "Aktif" : "Mati"}</strong></span>
              </div>
              <span className="text-white/60">Tampilan ini yang dibagikan ke Proyektor / Meet</span>
            </div>
          </div>

          {/* Primary Action Button Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleStream}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 ${
                status.is_streaming
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-[0.99]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.99]'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{status.is_streaming ? 'Hentikan Perlindungan Layar' : 'Mulai Perlindungan Layar'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Security Guards & Settings Control Panel */}
        <div className="w-[360px] flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Smart Privacy Guards Card */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                5 SENSOR PRIVASI AKTIF
              </span>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                Otomatis
              </span>
            </div>

            {/* Guard 1: WhatsApp Popup / Windows Notification */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Notifikasi Pop-up & WA</div>
                  <div className="text-[10px] text-slate-400">Tutup banner chat di pojok kanan bawah</div>
                </div>
              </div>
              <button
                onClick={() => updateGuard('toast')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  status.guards?.toast ? 'bg-rose-600' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  status.guards?.toast ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Guard 2: Browser Bookmark Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Baris Bookmark Browser</div>
                  <div className="text-[10px] text-slate-400">Sensor bookmark Chrome, Edge, Brave</div>
                </div>
              </div>
              <button
                onClick={() => updateGuard('bookmark')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  status.guards?.bookmark ? 'bg-rose-600' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  status.guards?.bookmark ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Guard 3: AI OCR PII Credentials */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Sensor AI Kredensial</div>
                  <div className="text-[10px] text-slate-400">Tutup Email, Sandi, Token, & Rekening</div>
                </div>
              </div>
              <button
                onClick={() => updateGuard('ocr')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  status.guards?.ocr ? 'bg-rose-600' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  status.guards?.ocr ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Guard 4: WhatsApp Window Full Censor */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Sensor Obrolan WhatsApp</div>
                  <div className="text-[10px] text-slate-400">Sensor otomatis saat jendela WA dibuka</div>
                </div>
              </div>
              <button
                onClick={() => updateGuard('whatsapp')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  status.guards?.whatsapp ? 'bg-rose-600' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  status.guards?.whatsapp ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Guard 5: Anti-Infinity Mirror Loop */}
            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Anti-Infinity Loop Meet</div>
                  <div className="text-[10px] text-slate-400">Cegah layar cermin bertumpuk di Meet/Zoom</div>
                </div>
              </div>
              <button
                onClick={() => updateGuard('anti_loop')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  status.guards?.anti_loop ? 'bg-rose-600' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  status.guards?.anti_loop ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Mask Style & Settings Card */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              GAYA PENYAMARAN (MASK STYLE)
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mosaic', label: 'Mosaik Kaca' },
                { id: 'blur', label: 'Blur Halus' },
                { id: 'solid', label: 'Hitam Gelap' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setMaskStyle(item.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                    status.mask_style === item.id
                      ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Monitor Selection */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>Pilih Layar yang Dipindai</span>
              </label>
              <select
                value={status.selected_monitor || 1}
                onChange={(e) => setMonitor(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
              >
                {status.monitors?.map(m => (
                  <option key={m.index} value={m.index}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

