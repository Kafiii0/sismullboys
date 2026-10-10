'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

export default function ProductsSolutions() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  const products = [
    {
      id: 'reconforge',
      badge: 'NAD',
      title: 'PROMETHEUS ReconForge™',
      desc: 'Make hidden attack surfaces visible. Automated passive asset discovery, tech stack fingerprinting, and live CVE correlation.',
      href: '/tools',
      category: 'RECON',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white">
            <line x1="5" y1="9" x2="5" y2="15" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="19" y1="7" x2="19" y2="17" />
          </svg>
        </div>
      ),
      renderBanner: (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1c0707] via-[#0e0a0f] to-[#08080a] flex items-center justify-center p-6">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative flex items-center justify-center gap-3 sm:gap-4 rotate-[-12deg] scale-90 sm:scale-100 group-hover:scale-105 transition-transform duration-500 ease-out">
            {[0.7, 0.85, 1, 0.85, 0.7].map((scale, i) => (
              <div
                key={i}
                className="w-12 sm:w-14 h-32 sm:h-36 rounded-2xl relative shadow-[0_20px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(220,38,38,0.25)] border border-red-500/40 overflow-hidden flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #ef4444 0%, #b91c1c 45%, #450a0a 100%)',
                  transform: `translateY(${(i - 2) * -8}px) scale(${scale})`,
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -4px 6px rgba(0,0,0,0.6), 0 15px 30px rgba(0,0,0,0.8)'
                }}
              >
                
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                
                <div 
                  className="w-3.5 sm:w-4 rounded-full bg-gradient-to-b from-white via-zinc-200 to-zinc-400 shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-white/80"
                  style={{ height: `${35 + (i % 3) * 22}px` }}
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        </div>
      )
    },
    {
      id: 'vulntracker',
      badge: 'NGFW',
      title: 'PROMETHEUS VulnTracker™',
      desc: 'Expert vulnerability lifecycle & verification platform. Proven enterprise performance, continuous patch validation, and attestation.',
      href: '/platform',
      category: 'PLATFORM',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      ),
      renderBanner: (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#121217] via-[#09090c] to-[#040406] flex items-center justify-center p-6">
          
          <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative w-64 sm:w-72 h-36 sm:h-40 rounded-2xl bg-gradient-to-b from-[#22222a] via-[#16161c] to-[#0c0c10] border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.95)] flex flex-col justify-between p-4 group-hover:scale-105 transition-transform duration-500 ease-out rotate-[-5deg]">
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
                  PROMETHEUS SENTINEL PRO
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <div key={k} className="w-1 h-3 rounded-full bg-white/10" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1 py-1 opacity-30">
              {Array.from({ length: 24 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((p) => (
                  <div
                    key={p}
                    className="w-5 h-4 rounded bg-[#09090c] border border-white/20 flex flex-col justify-end p-0.5 shadow-inner"
                  >
                    <div className="flex justify-between items-center px-0.5">
                      <div className={`w-1 h-1 rounded-full ${p <= 2 ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-red-500 shadow-[0_0_4px_#ef4444]'}`} />
                      <div className="w-1 h-1 rounded-full bg-amber-400/80" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-7 h-4 rounded bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                  <div className="w-4 h-2 bg-black/80 rounded-sm" />
                </div>
                <div className="w-7 h-4 rounded bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                  <div className="w-4 h-2 bg-black/80 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'breachwatch',
      badge: 'SANDBOX',
      title: 'PROMETHEUS BreachWatch™',
      desc: 'Detects credentials compromised in dark web drops, stealer botnet dumps, and public archives with zero-knowledge cryptography.',
      href: '/breach',
      category: 'INTEL',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30">
          <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>
      ),
      renderBanner: (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1c0808] via-[#0d090c] to-[#060608] flex items-center justify-center p-6">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ease-out">
            
            <div 
              className="absolute w-28 sm:w-32 h-28 sm:h-32 rounded-3xl border border-red-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              style={{
                background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                transform: 'rotate(-25deg) translateY(24px) translateX(-20px)'
              }}
            />

            <div 
              className="absolute w-28 sm:w-32 h-28 sm:h-32 rounded-3xl border border-red-400/40 shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                transform: 'rotate(-18deg) translateY(12px) translateX(-10px)'
              }}
            />

            <div 
              className="relative w-28 sm:w-32 h-28 sm:h-32 rounded-3xl border border-red-300/50 shadow-[0_25px_50px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
                transform: 'rotate(-10deg)'
              }}
            >
              
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white via-zinc-200 to-zinc-400 border border-white rotate-45 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center justify-center">
                
                <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#7f1d1d] to-[#450a0a] border border-red-950 shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cloudshield',
      badge: 'CSPM',
      title: 'PROMETHEUS CloudShield™',
      desc: 'Proactive public cloud bucket discovery (AWS S3, GCP, Azure Blob) and multi-cloud infrastructure hardening compliance.',
      href: '/services',
      category: 'CLOUD',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        </div>
      ),
      renderBanner: (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#120606] via-[#0a080d] to-[#050508] flex items-center justify-center p-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ease-out">
            <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/40 backdrop-blur-md rotate-45 flex items-center justify-center shadow-[0_20px_40px_rgba(220,38,38,0.2)]">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-400 shadow-2xl flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-white shadow-[0_0_12px_#ffffff]" />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section className="py-24 bg-[#08080A] border-b border-white/[0.06] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 right-[-50px] w-[500px] h-[500px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[-50px] w-[450px] h-[450px] bg-red-950/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-grotesk text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              PROMETHEUS Security products<br />
              and solutions
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Our products help you achieve effective cybersecurity and provide real protection for your company against hacker attacks.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 pt-2">
            <div className="inline-flex p-1 bg-[#121217] rounded-full border border-white/[0.08]">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === 'ALL'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All products
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous products"
                className="w-10 h-10 rounded-full bg-[#121217] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Next products"
                className="w-10 h-10 rounded-full bg-[#121217] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredProducts.map((prod) => (
            <Link
              key={prod.id}
              href={prod.href}
              className="group flex-none w-[320px] sm:w-[380px] rounded-3xl bg-[#0D0D12] border border-white/[0.08] hover:border-red-500/40 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(220,38,38,0.15)] snap-start"
            >
              
              <div className="h-56 sm:h-64 relative border-b border-white/[0.06] overflow-hidden">
                {prod.renderBanner}

                <div className="absolute bottom-4 left-5 z-20 transition-transform duration-300 group-hover:scale-110">
                  {prod.icon}
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-grotesk text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors flex items-center justify-between">
                    <span>{prod.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-red-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light line-clamp-3">
                    {prod.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                    Explore Solution
                  </span>
                  <span className="text-xs font-mono text-red-500 font-bold">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
