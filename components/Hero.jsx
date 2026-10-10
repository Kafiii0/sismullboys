'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ThreatGlobe from './ThreatGlobe';

export default function Hero() {
  return (
    <section className="relative min-h-[640px] lg:min-h-[760px] pt-36 pb-20 md:pt-44 md:pb-28 bg-[#08080A] overflow-hidden border-b border-white/[0.08] flex items-center">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/video/hero_poster.webp"
          className="w-full h-full object-cover object-right lg:object-center brightness-[1.15] contrast-[1.08] opacity-100"
        >
          <source src="/video/hero_bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-[#08080A]/80 via-[#08080A]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            <h1 className="font-grotesk text-3xl sm:text-4xl lg:text-[48px] font-bold tracking-tight text-white leading-[1.18]">
              Securing Your Digital Fortress with{' '}
              <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">
                Precision
              </span>{' '}
              and Integrity.
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed max-w-xl font-light">
              Independent cybersecurity consulting firm specializing in deep adversarial penetration testing, vulnerability research, and digital fortress hardening across web, mobile, network, and cloud ecosystems.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Initiate Security Audit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black/40 hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 font-semibold text-xs tracking-wider uppercase backdrop-blur-sm transition-all"
              >
                <span>Explore Capabilities</span>
              </Link>
            </div>

          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <ThreatGlobe />
          </div>

        </div>

      </div>
    </section>
  );
}
