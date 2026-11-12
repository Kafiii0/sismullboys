'use client';

import { useState, useEffect } from 'react';
import { Shield, Camera, Volume2, Sparkles, Sliders, Check, HelpCircle, Power, Video } from 'lucide-react';

export default function WitnessDesktopPage() {
  const [status, setStatus] = useState({
    is_streaming: true,
    is_filter_enabled: true,
    mask_mode: 'mosaic',
    pixel_pct: 70,
    audio_mode: 'deep_shadow',
    audio_fx_pct: 60,
    res_mode: '1080p',
    available_cameras: [],
    selected_camera_idx: 0,
  });

  const [fps, setFps] = useState(30);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      // Engine offline or reconnecting
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleStream = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/stream/toggle', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ ...prev, is_streaming: data.is_streaming }));
      }
    } catch (e) {}
  };

  const toggleSensor = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/sensor/toggle', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ ...prev, is_filter_enabled: data.is_filter_enabled }));
      }
    } catch (e) {}
  };

  const setMaskMode = async (mode) => {
    try {
      await fetch(`http://127.0.0.1:8765/sensor/mode?mode=${mode}`, { method: 'POST' });
      setStatus(prev => ({ ...prev, mask_mode: mode }));
    } catch (e) {}
  };

  const setPixelIntensity = async (val) => {
    setStatus(prev => ({ ...prev, pixel_pct: val }));
    try {
      await fetch(`http://127.0.0.1:8765/sensor/intensity?val=${val}`, { method: 'POST' });
    } catch (e) {}
  };

  const setVoiceMode = async (mode) => {
    try {
      await fetch(`http://127.0.0.1:8765/voice/mode?mode=${mode}`, { method: 'POST' });
      setStatus(prev => ({ ...prev, audio_mode: mode }));
    } catch (e) {}
  };

  const setVoiceIntensity = async (val) => {
    setStatus(prev => ({ ...prev, audio_fx_pct: val }));
    try {
      await fetch(`http://127.0.0.1:8765/voice/intensity?val=${val}`, { method: 'POST' });
    } catch (e) {}
  };

  const selectCamera = async (idx) => {
    try {
      await fetch(`http://127.0.0.1:8765/camera/select?idx=${idx}`, { method: 'POST' });
      setStatus(prev => ({ ...prev, selected_camera_idx: idx }));
    } catch (e) {}
  };

  const setResolution = async (res) => {
    try {
      await fetch(`http://127.0.0.1:8765/camera/resolution?res=${res}`, { method: 'POST' });
      setStatus(prev => ({ ...prev, res_mode: res }));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 font-sans select-none flex flex-col antialiased">
      {/* 1. TOP GLASS NAVBAR */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">BIFROST</span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-sm text-blue-600">Witness Cam</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                TAURI 2.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>1080p Virtual Cam Aktif</span>
          </div>

          <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
            Google Meet / Zoom Ready
          </div>
        </div>
      </header>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* LEFT COLUMN: CAMERA VIEWPORT & TOOLBAR (7 COLS) */}
        <section className="col-span-12 lg:col-span-7 flex flex-col space-y-4">
          {/* CAMERA STAGE (ROUNDED GLASS CONTAINER) */}
          <div className="relative flex-1 min-h-[440px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-300/80 shadow-lg flex items-center justify-center group">
            {status.is_streaming ? (
              <img
                src="http://127.0.0.1:8765/stream"
                alt="BIFROST Live Stream"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-slate-300 font-medium text-sm">Siaran Kamera Dihentikan</div>
                <button
                  onClick={toggleStream}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20"
                >
                  Mulai Siaran
                </button>
              </div>
            )}

            {/* FLOATING TOP-LEFT BADGE */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-md">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>BIFROST Encrypted Camera ({status.res_mode})</span>
            </div>

            {/* FLOATING TOP-RIGHT BADGE */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE 30 FPS</span>
            </div>
          </div>

          {/* BOTTOM CAMERA & RESOLUTION TOOLBAR */}
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5 flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Kamera:</span>
              <select
                value={status.selected_camera_idx}
                onChange={(e) => selectCamera(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 w-full max-w-[260px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {status.available_cameras?.map((cam) => (
                  <option key={cam.idx} value={cam.idx}>
                    {cam.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolusi:</span>
              <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200/60">
                <button
                  onClick={() => setResolution('1080p')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    status.res_mode === '1080p'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1080p FHD
                </button>
                <button
                  onClick={() => setResolution('720p')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    status.res_mode === '720p'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  720p HD
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: MODERN GLASS CONTROLS (5 COLS) */}
        <section className="col-span-12 lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              {/* CARD 1: SENSOR WAJAH SAKSI */}
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">Sensor Wajah Saksi</span>
                  </div>
                  <button
                    onClick={toggleSensor}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      status.is_filter_enabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        status.is_filter_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* MODE SELECTOR (SEGMENTED TABS) */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  {['mosaic', 'silhouette', 'eyebar'].map((mode) => {
                    const label = mode === 'mosaic' ? 'Mosaik' : mode === 'silhouette' ? 'Siluet' : 'Pita Mata';
                    const active = status.mask_mode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setMaskMode(mode)}
                        className={`py-2 text-xs font-bold rounded-lg transition ${
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* SLIDER INTENSITAS SENSOR */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-600">Intensitas Sensor</span>
                    <span className="font-bold text-blue-600">{status.pixel_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={status.pixel_pct}
                    onChange={(e) => setPixelIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between pt-1">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPixelIntensity(val)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition"
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 2: PENGUBAH SUARA REALTIME (VOICE DSP) */}
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/70 space-y-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900">Pengubah Suara (Voice DSP)</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  {[
                    { id: 'deep_shadow', name: 'Deep Shadow' },
                    { id: 'robotic', name: 'Robotik' },
                    { id: 'normal', name: 'Normal' },
                  ].map((item) => {
                    const active = status.audio_mode === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setVoiceMode(item.id)}
                        className={`py-2 text-xs font-bold rounded-lg transition ${
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-600">Modulasi Suara</span>
                    <span className="font-bold text-blue-600">{status.audio_fx_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={status.audio_fx_pct}
                    onChange={(e) => setVoiceIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* SINGLE UNIFIED PRIMARY ACTION BUTTON */}
            <div className="space-y-3 pt-2">
              <button
                onClick={toggleStream}
                className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition flex items-center justify-center space-x-2 shadow-md ${
                  status.is_streaming
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{status.is_streaming ? 'Hentikan Siaran' : 'Mulai Siaran'}</span>
              </button>

              <div className="text-[11px] text-center text-slate-400 font-medium">
                Aliran video 1080p & suara DSP otomatis aktif ke Google Meet / Zoom
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

