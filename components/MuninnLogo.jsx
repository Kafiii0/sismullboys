'use client';

export default function MuninnLogo({ className = "h-9 w-auto", showText = true }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 opacity-40 blur-sm animate-pulse" />
        
        <div className="relative w-10 h-10 rounded-xl bg-[#0F0F14] border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
          <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7">
            
            <line x1="8" y1="24" x2="40" y2="24" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
            <line x1="24" y1="8" x2="24" y2="40" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />
            
            <path
              d="M10 32L24 10L38 32L30 28L24 38L18 28L10 32Z"
              fill="url(#muninnGrad)"
              stroke="#FCA5A5"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            
            <circle cx="24" cy="23" r="3.2" fill="#FEF08A" />
            <circle cx="24" cy="23" r="1.5" fill="#DC2626" />
            
            <path
              d="M8 38C13 35 15 41 20 38C25 35 27 41 32 38C37 35 39 41 42 38"
              stroke="#38BDF8"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />

            <defs>
              <linearGradient id="muninnGrad" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#DC2626" />
                <stop offset="0.6" stopColor="#991B1B" />
                <stop offset="1" stopColor="#450A0A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
              MUNINN<span className="text-red-500">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30 font-semibold font-mono">
              MULTIMEDIA
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-mono -mt-0.5">
            EVIDENCE PIPELINE · TEL-U
          </span>
        </div>
      )}
    </div>
  );
}
