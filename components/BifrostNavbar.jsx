'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, ArrowUpRight, Download, ChevronDown, 
  Video, Monitor, Shield, Layers, FileCheck, Sparkles, 
  Lock, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function BifrostNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobilePlatformOpen, setMobilePlatformOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const timeoutRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (name) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const closeDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(null);
  };

  return (
    <>
      <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 flex items-center justify-between px-6 sm:px-8 ${
            isScrolled
              ? 'bg-[#0B0B0F]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-3'
              : 'bg-[#0B0B0F]/85 backdrop-blur-xl border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.7)] py-3.5'
          }`}
        >
          
          <Link href="/" onClick={closeDropdown} className="flex items-center group shrink-0">
            <span className="font-grotesk text-xl font-extrabold tracking-tight text-white group-hover:text-red-400 transition-colors whitespace-nowrap">
              BIFROST<span className="text-red-600">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-wider font-semibold font-sans">
            
            <Link
              href="/"
              onClick={closeDropdown}
              className={`transition-colors ${pathname === '/' ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'}`}
            >
              Overview
            </Link>

            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('programs')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'programs' ? null : 'programs')}
                className={`inline-flex items-center gap-1.5 transition-colors py-1 cursor-pointer ${
                  pathname.startsWith('/programs') || pathname === '/witness-shield' || pathname === '/screen-shield'
                    ? 'text-red-400 font-bold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <span>Programs</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'programs' ? 'rotate-180 text-red-400' : 'text-zinc-500'}`} />
              </button>

              {activeDropdown === 'programs' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56 z-50">
                  <div className="rounded-xl bg-[#0D0F14]/95 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl space-y-1">
                    <Link
                      href="/witness-shield"
                      onClick={closeDropdown}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Video className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Witness Cam</span>
                    </Link>

                    <Link
                      href="/screen-shield"
                      onClick={closeDropdown}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Monitor className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>HDMI Shield</span>
                    </Link>

                    <div className="pt-1 border-t border-white/[0.06]">
                      <Link
                        href="/programs"
                        onClick={closeDropdown}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/40 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Download className="w-3.5 h-3.5 text-red-400" />
                          <span>Download .EXE</span>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('platform')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'platform' ? null : 'platform')}
                className="inline-flex items-center gap-1.5 transition-colors py-1 cursor-pointer text-zinc-300 hover:text-white"
              >
                <span>Platform</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'platform' ? 'rotate-180 text-white' : 'text-zinc-500'}`} />
              </button>

              {activeDropdown === 'platform' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 z-50">
                  <div className="rounded-xl bg-[#0D0F14]/95 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl space-y-0.5">
                    <Link
                      href="/#capabilities"
                      onClick={closeDropdown}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Capabilities</span>
                    </Link>

                    <Link
                      href="/#how-it-works"
                      onClick={closeDropdown}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>How It Works</span>
                    </Link>

                    <Link
                      href="/#custody"
                      onClick={closeDropdown}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Evidence Custody</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/redact"
              onClick={closeDropdown}
              className={`transition-colors flex items-center gap-1.5 ${
                pathname === '/redact' ? 'text-red-400 font-bold' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <span>Redact Studio</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Web
              </span>
            </Link>

          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/programs"
              onClick={closeDropdown}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-950/50 hover:scale-[1.02] active:scale-[0.98]"
              title="Download Desktop Programs (.EXE)"
            >
              <Download className="w-3.5 h-3.5 text-red-400 group-hover:translate-y-0.5 transition-transform" />
              <span>Downloads</span>
            </Link>
            <Link
              href="/redact"
              onClick={closeDropdown}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#08080A]/95 backdrop-blur-2xl pt-28 px-6 pb-8 flex flex-col justify-between md:hidden overflow-y-auto">
          <nav className="flex flex-col gap-4 text-sm font-semibold tracking-wider uppercase">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-300 hover:text-white py-1"
            >
              Overview
            </Link>

            <div className="border-y border-white/[0.06] py-2 space-y-2">
              <button
                onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
                className="w-full flex items-center justify-between text-red-400 py-1"
              >
                <span>Programs (.EXE)</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileProgramsOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileProgramsOpen && (
                <div className="pl-3 space-y-2.5 text-xs text-zinc-400 font-sans normal-case">
                  <Link
                    href="/witness-shield"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-white"
                  >
                    <strong className="text-white block">BIFROST Witness Cam</strong>
                    DirectShow Virtual Cam &amp; Voice Disguiser
                  </Link>
                  <Link
                    href="/screen-shield"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-white"
                  >
                    <strong className="text-white block">BIFROST HDMI Shield</strong>
                    Anti-Infinity Loop &amp; Presentation Privacy
                  </Link>
                  <Link
                    href="/programs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-red-400 font-bold pt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Portal (.EXE)</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="border-b border-white/[0.06] pb-2 space-y-2">
              <button
                onClick={() => setMobilePlatformOpen(!mobilePlatformOpen)}
                className="w-full flex items-center justify-between text-zinc-300 py-1"
              >
                <span>Platform Architecture</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobilePlatformOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobilePlatformOpen && (
                <div className="pl-3 space-y-2 text-xs text-zinc-400 normal-case">
                  <Link
                    href="/#capabilities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-white"
                  >
                    Core Capabilities
                  </Link>
                  <Link
                    href="/#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-white"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/#custody"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block hover:text-white"
                  >
                    Evidence Custody
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/redact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-red-400 hover:text-red-300 py-1"
            >
              Redact Studio (Web)
            </Link>
          </nav>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col gap-3">
            <Link
              href="/programs"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-950/40"
            >
              <Download className="w-4 h-4 text-red-400" />
              <span>Downloads Portal (.EXE)</span>
            </Link>
            <Link
              href="/redact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold text-xs tracking-wider uppercase"
            >
              <span>Launch Redact Studio</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
