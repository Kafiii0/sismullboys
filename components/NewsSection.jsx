'use client';

import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, ArrowUpRight, ShieldAlert } from 'lucide-react';

const NEWS_ARTICLES = [
  {
    id: 1,
    tag: 'POST-QUANTUM CRYPTOGRAPHY (PQC)',
    date: 'Sep 28, 2026',
    title: 'Post-Quantum Cryptography Transition: Neutralizing "Harvest Now, Decrypt Later" Threats',
    desc: 'Global standards organizations mandate post-quantum algorithms (FIPS 203 & 204). Financial and public sector infrastructures are required to upgrade encryption schemes before quantum computing breaks legacy asymmetric ciphers.',
    image: '/news/quantum_crypto.jpg',
    actionText: 'Read Technical Analysis'
  },
  {
    id: 2,
    tag: 'REGULATORY COMPLIANCE & PRIVACY',
    date: 'Sep 22, 2026',
    title: 'Statutory Data Protection Enforcement: Mandatory Independent Audits & Forensic Readiness',
    desc: 'With grace periods concluded, data controllers and public digital operators must substantiate resilience via third-party penetration testing to avoid severe administrative and civil penalties.',
    image: '/news/cloud_soc.jpg',
    actionText: 'Read Compliance Guide'
  },
  {
    id: 3,
    tag: 'AGENTIC AI & THREAT INTELLIGENCE',
    date: 'Sep 15, 2026',
    title: 'Autonomous AI Agent Threat Surfaces: Prompt Injection & API Token Exfiltration in Cloud Ecosystems',
    desc: 'The mass adoption of autonomous enterprise agents creates critical blindspots in LLM tool calling. PROMETHEUS introduces proprietary red teaming methodologies to stress-test internal AI workflows.',
    image: '/news/cyber_defense.jpg',
    actionText: 'Read Research Whitepaper'
  }
];

export default function NewsSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % NEWS_ARTICLES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + NEWS_ARTICLES.length) % NEWS_ARTICLES.length);
  };

  return (
    <section id="news" className="py-24 bg-[#08080A] border-b border-white/[0.08] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest block">
            RESEARCH & INTELLIGENCE
          </span>
          <h2 className="font-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Latest Threat Intelligence & Cybersecurity Insights
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans font-light leading-relaxed">
            In-depth perspectives on global attack vectors, adversary methodologies, and regulatory requirements directly from PROMETHEUS offensive analysts and research fellows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {NEWS_ARTICLES.map((article, idx) => (
            <div
              key={article.id}
              className="group rounded-2xl bg-[#0D0D11] border border-white/8 hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl hover:bg-[#121217]"
            >
              <div>
                
                <div className="relative w-full h-52 sm:h-56 bg-zinc-900 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-red-400 font-semibold tracking-wider uppercase">
                    {article.tag}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans font-light">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>{article.date}</span>
                  </div>

                  <h3 className="font-sans text-base sm:text-lg font-bold text-white leading-snug group-hover:text-red-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed font-light line-clamp-3">
                    {article.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 tracking-wider uppercase font-sans transition-colors group/link"
                >
                  <span>{article.actionText}</span>
                  <div className="w-6 h-6 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 group-hover/link:border-red-500 group-hover/link:translate-x-1 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-center justify-between gap-6 max-w-xl mx-auto">
          <button
            onClick={prevSlide}
            aria-label="Previous article"
            className="w-10 h-10 rounded-full border border-white/10 hover:border-red-500/50 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center text-zinc-300 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{
                width: `${((activeSlide + 1) / NEWS_ARTICLES.length) * 100}%`,
              }}
            />
          </div>

          <button
            onClick={nextSlide}
            aria-label="Next article"
            className="w-10 h-10 rounded-full border border-white/10 hover:border-red-500/50 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center text-zinc-300 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
