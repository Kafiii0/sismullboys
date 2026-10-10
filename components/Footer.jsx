'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050507] relative overflow-hidden text-zinc-400 font-sans text-xs">
      
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="group-hover:scale-105 transition-transform">
                <Logo className="w-8 h-8" glow={true} />
              </div>
              <span className="font-grotesk text-base font-extrabold tracking-tight text-white group-hover:text-red-400 transition-colors">
                PROMETHEUS<span className="text-red-500">.</span>
              </span>
            </Link>

            <div className="text-white font-sans font-semibold text-xs">
              PT Terampil Profesional Sejahtera Abadi
            </div>

            <p className="text-zinc-400 leading-relaxed max-w-sm font-light text-xs">
              Independent cybersecurity firm specializing in adversarial penetration testing, offensive vulnerability research, and proactive digital fortress hardening.
            </p>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2 text-zinc-400 font-light">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Web & API Pentest
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Mobile App Security
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Network & AD Audit
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Cloud Infrastructure
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Adversary Simulation
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Platform & Tools
            </h4>
            <ul className="space-y-2 text-zinc-400 font-light">
              <li>
                <Link href="/tools" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">●</span>
                  <span>ReconForge™ ASM</span>
                </Link>
              </li>
              <li>
                <Link href="/breach" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">●</span>
                  <span>BreachWatch™ Intel</span>
                </Link>
              </li>
              <li>
                <Link href="/platform" className="hover:text-white transition-colors">
                  VulnTracker™ Portal
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-white transition-colors">
                  Security Attestations
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-zinc-400 font-light">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-white transition-colors">
                  Compliance & Legal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-zinc-400 text-xs">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-white font-normal">PT Terampil Profesional Sejahtera Abadi</strong>. All Rights Reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors font-medium"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
