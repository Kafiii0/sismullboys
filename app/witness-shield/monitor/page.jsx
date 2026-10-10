'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function WitnessMonitorPage() {
  const [frameSrc, setFrameSrc] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(Date.now());
  const [isFeedActive, setIsFeedActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const channel = new BroadcastChannel('bifrost-witness-feed');

    channel.onmessage = (event) => {
      if (event.data?.type === 'FRAME' && event.data.data) {
        setFrameSrc(event.data.data);
        setIsFeedActive(true);
        setLastHeartbeat(Date.now());
      }
    };

    const watchdog = setInterval(() => {
      if (Date.now() - lastHeartbeat > 3500) {
        setIsFeedActive(false);
      }
    }, 1500);

    return () => {
      channel.close();
      clearInterval(watchdog);
    };
  }, [lastHeartbeat]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-[#050608] flex items-center justify-center relative overflow-hidden select-none"
    >
      
      {frameSrc ? (
        
        <img
          src={frameSrc}
          alt="BIFROST Witness Clean VC Feed"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-grotesk font-bold text-white tracking-wide">
              BIFROST CLEAN VC MONITOR
            </h2>
            <p className="text-xs font-mono text-zinc-400 max-w-md">
              Menunggu sinyal video tersamar dari tab utama BIFROST Witness Shield Studio...
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono text-zinc-500">
            Kanal: bifrost-witness-feed
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
          <span className={`w-2 h-2 rounded-full ${isFeedActive ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : 'bg-zinc-600'}`} />
          <span>{isFeedActive ? 'LIVE BROADCAST FEED' : 'STANDBY'}</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition-all hover:scale-105"
          title="Layar Penuh (Fullscreen)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-3 left-4 z-40 pointer-events-none opacity-40">
        <span className="text-[10px] font-mono text-zinc-400">
          BIFROST 
        </span>
      </div>
    </div>
  );
}
