'use client';

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="prm_crimson_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3366" />
            <stop offset="40%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#9F1239" />
          </linearGradient>

          <linearGradient id="prm_metal_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#222227" />
            <stop offset="50%" stopColor="#141418" />
            <stop offset="100%" stopColor="#0B0B0E" />
          </linearGradient>

          <linearGradient id="prm_edge_glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E11D48" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path 
          d="M60 10 L102 24 V64 C102 88 60 110 60 110 C60 110 18 88 18 64 V24 L60 10Z" 
          fill="url(#prm_metal_grad)" 
          stroke="#2A2A32" 
          strokeWidth="1.5"
        />

        <path 
          d="M60 16 L96 28 V63 C96 83 60 102 60 102 C60 102 24 83 24 63 V28 L60 16Z" 
          stroke="url(#prm_edge_glow)" 
          strokeWidth="1"
          fill="none"
        />

        <path 
          d="M33 33 L55 33 L51 45 L38 45 Z" 
          fill="url(#prm_crimson_grad)"
        />
        <path 
          d="M65 33 L87 33 L82 45 L69 45 Z" 
          fill="#FF3366"
        />

        <polygon 
          points="60,23 71,32 49,32" 
          fill="#FFFFFF" 
          opacity="0.9"
        />

        <path 
          d="M54 35 L66 35 L63.5 78 L60 92 L56.5 78 Z" 
          fill="url(#prm_crimson_grad)" 
        />

        <polygon 
          points="60,42 66,54 60,66 54,54" 
          fill="#FFFFFF"
        />

        <polygon points="36,54 44,68 40,71 33,57" fill="#E11D48" opacity="0.7" />
        <polygon points="84,54 76,68 80,71 87,57" fill="#FF3366" opacity="0.85" />
      </svg>
    </div>
  );
}
