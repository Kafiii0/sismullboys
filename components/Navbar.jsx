'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, Menu, X, ArrowUpRight, ChevronDown, 
  Globe, Cpu, Users, Scale, FileText, CheckCircle2, Radar, Flame 
} from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); 
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isServicesActive = pathname === '/services' || pathname === '/platform' || pathname === '/tools' || pathname === '/breach';
  const isCompanyActive = pathname === '/about' || pathname === '/team' || pathname === '/compliance';

  return (
    <>
      
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 flex items-center justify-between px-6 sm:px-8 ${
            isScrolled
              ? 'bg-[#0B0B0F]/95 backdrop-blur-2xl border border-white/[0.05] shadow-[0_25px_60px_rgba(0,0,0,0.95)] py-3'
              : 'bg-[#0B0B0F]/85 backdrop-blur-xl border border-white/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.85)] py-3.5 sm:py-4'
          }`}
        >
          
          <Link href="/" className="flex items-center group shrink-0">
            <span className="font-grotesk text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-red-400 transition-colors whitespace-nowrap">
              PROMETHEUS<span className="text-red-500">.</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 bg-white/[0.02] p-1.5 rounded-full border border-white/[0.03] relative shrink-0">
            
            <Link
              href="/"
              className={`text-[13px] sm:text-sm font-sans font-medium px-4 py-2 rounded-full transition-all tracking-wide whitespace-nowrap ${
                pathname === '/'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Home
            </Link>

            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('services')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                className={`flex items-center gap-1.5 text-[13px] sm:text-sm font-sans font-medium px-4 py-2 rounded-full transition-all tracking-wide ${
                  isServicesActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30 font-semibold'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>Services & Platform</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'services' ? 'rotate-180 text-red-400' : 'text-zinc-400'}`} />
              </button>

              {openDropdown === 'services' && (
                <div className="absolute top-full left-0 pt-2.5 w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-1.5 rounded-2xl bg-[#0E0E12]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.95)] space-y-0.5">
                    <Link
                      href="/services"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Globe className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        Pentest Services
                      </span>
                    </Link>

                    <Link
                      href="/platform"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Cpu className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        VulnTracker™ Portal
                      </span>
                    </Link>

                    <Link
                      href="/tools"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Radar className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        ReconForge™ ASM
                      </span>
                    </Link>

                    <Link
                      href="/breach"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Flame className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        BreachWatch™ Intel
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('company')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}
                className={`flex items-center gap-1.5 text-[13px] sm:text-sm font-sans font-medium px-4 py-2 rounded-full transition-all tracking-wide ${
                  isCompanyActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30 font-semibold'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>About Company</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'company' ? 'rotate-180 text-red-400' : 'text-zinc-400'}`} />
              </button>

              {openDropdown === 'company' && (
                <div className="absolute top-full left-0 pt-2.5 w-52 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-1.5 rounded-2xl bg-[#0E0E12]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.95)] space-y-0.5">
                    <Link
                      href="/about"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Shield className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        About Us
                      </span>
                    </Link>

                    <Link
                      href="/team"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Users className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        Our Team
                      </span>
                    </Link>

                    <Link
                      href="/compliance"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-zinc-300 hover:text-white group/item"
                    >
                      <Scale className="w-4 h-4 text-zinc-400 group-hover/item:text-red-400 transition-colors shrink-0" />
                      <span className="text-[13px] font-medium">
                        Compliance & Legal
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`text-[13px] sm:text-sm font-sans font-medium px-4 py-2 rounded-full transition-all tracking-wide whitespace-nowrap ${
                pathname === '/contact'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Contact
            </Link>

          </nav>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[13px] font-semibold tracking-wide shadow-[0_0_25px_rgba(225,29,72,0.35)] hover:shadow-[0_0_35px_rgba(225,29,72,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Schedule Pentest</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2.5">
            <Link
              href="/contact"
              className="sm:hidden px-3.5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold"
            >
              Audit
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 lg:hidden bg-[#0E0E12]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="pb-3 border-b border-white/10 text-xs font-sans text-zinc-400 flex items-center justify-between">
            <span className="font-grotesk font-bold text-white text-xs tracking-tight">PROMETHEUS<span className="text-red-500">.</span></span>
            <span className="text-red-500 font-semibold text-[10px] uppercase font-mono tracking-wider">NAVIGATION</span>
          </div>

          <div className="flex flex-col space-y-3 font-sans">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-zinc-200 hover:text-red-400 py-1 flex items-center justify-between"
            >
              <span>Home</span>
              <span className="text-xs text-zinc-500">→</span>
            </Link>

            <div className="pt-2 border-t border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                Services & Platform
              </span>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>Pentest Services</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
              <Link
                href="/platform"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>VulnTracker™</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
              <Link
                href="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>ReconForge™ ASM</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
              <Link
                href="/breach"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>BreachWatch™ Intel</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                Company
              </span>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>About Us</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
              <Link
                href="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>Our Team</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
              <Link
                href="/compliance"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-300 hover:text-red-400 py-1.5 pl-2 flex items-center justify-between"
              >
                <span>Compliance & Legal</span>
                <span className="text-xs text-zinc-600">→</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-white/5">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-zinc-200 hover:text-red-400 py-1 flex items-center justify-between"
              >
                <span>Contact & Advisory</span>
                <span className="text-xs text-zinc-500">→</span>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-xs tracking-wide"
            >
              <span>Schedule Security Audit</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
