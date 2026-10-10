'use client';

export default function MuninnFooter() {
  return (
    <footer className="bg-[#0A0B0E] border-t border-zinc-800 py-6 px-4 text-center text-xs text-zinc-500 font-mono">
      <div className="max-w-7xl mx-auto space-y-1">
        <p className="text-zinc-400 font-medium">
          Tugas Besar Sistem Multimedia (CBK2CAB3) · Semester Genap 2025/2026 · Telkom University
        </p>
        <p className="text-[11px]">
          Modul: Akuisisi Citra/Audio · Kompresi DCT 8x8 · Watermark Frekuensi Tengah · Rantai Hash SHA-256 · Streaming HLS
        </p>
      </div>
    </footer>
  );
}
