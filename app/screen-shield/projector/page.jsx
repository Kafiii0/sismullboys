'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize, Tv, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ProjectorOutputPage() {
  const canvasRef = useRef(null);
  const [hasReceivedFrame, setHasReceivedFrame] = useState(false);
  const [isPanic, setIsPanic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel('bifrost-screen-shield-feed');

    channel.onmessage = (event) => {
      const { type, dataUrl, isPanic: panicState } = event.data;
      if (type === 'FRAME_UPDATE' && dataUrl) {
        setIsPanic(!!panicState);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            if (canvas.width !== img.width || canvas.height !== img.height) {
              canvas.width = img.width;
              canvas.height = img.height;
            }
            ctx.drawImage(img, 0, 0);
            if (!hasReceivedFrame) setHasReceivedFrame(true);
          };
          img.src = dataUrl;
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [hasReceivedFrame]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none">
      
      <div className="fixed top-3 right-3 z-50 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 shadow-2xl"
          title="Fullscreen (F11) ke Proyektor"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {hasReceivedFrame ? (
        <canvas
          ref={canvasRef}
          className="w-screen h-screen object-contain bg-black"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-red-500 shadow-2xl animate-pulse">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-wider uppercase text-white">
              BIFROST HDMI PROJECTOR OUTPUT
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-2">
              Menunggu transmisi feed ter-enkripsi dari konsol Presenter...
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Pindahkan tab/jendela ini ke Layar Proyektor HDMI (Monitor 2)</span>
          </div>
        </div>
      )}
    </div>
  );
}
