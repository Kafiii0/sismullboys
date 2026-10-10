'use client';

import { Shield, Award, CheckCircle2, ChevronDown } from 'lucide-react';

export default function Team() {
  const ceo = {
    name: 'Muhammad Ghassan Denaprinsyah',
    role: 'Chief Executive Officer (CEO)',
    photo: '/team/ghassan.jpg',
    level: 'Chief Executive Leadership',
    certs: ['CISSP', 'CISM', 'ISO 27001 LA'],
    focus: 'Corporate Cybersecurity Strategy & Risk Governance',
    bio: 'Directs the overarching strategic vision of PT Terampil Profesional Sejahtera Abadi, oversees regulatory data protection adherence, and aligns offensive cybersecurity solutions with enterprise boards and sovereign stakeholders.',
  };

  const executiveLeads = [
    {
      name: 'Muhammad Trisnatama Derdiansyah',
      role: 'Chief Technology Officer (CTO)',
      photo: '/team/trisnatama.jpg',
      level: 'Offensive Technology & Research Division',
      certs: ['OSCP', 'OSEP', 'CRTO'],
      focus: 'Exploit Engineering & Vulnerability Research',
      bio: 'Architects technical assessment methodologies, directs zero-day vulnerability research, and guarantees zero false positives through rigorous empirical proof-of-concept verification.',
    },
    {
      name: 'Fahri Al Kahfi',
      role: 'Operations & Delivery Lead',
      photo: '/team/fahri.jpg',
      level: 'Operations & Service Quality Division',
      certs: ['PMP', 'CISA', 'Scrum Master'],
      focus: 'Engagement Management & Quality Assurance',
      bio: 'Manages complex engagement timelines, enforces strict cryptographic data confidentiality, and ensures deliverables provide actionable, clear technical remedies for developers.',
    }
  ];

  const specialistEngineers = [
    {
      name: 'I Gede Arya Yoga Saputra',
      role: 'Application Security (AppSec) Engineer',
      photo: '/team/yoga.jpg',
      level: 'Application Security Specialist',
      certs: ['OSWE', 'Burp Certified', 'eWPTXv2'],
      focus: 'Web, Microservices & API Security',
      bio: 'Specialist in deep application security and API logic flaws. Expert in dissecting distributed payment workflows, complex state machines, and account takeover vectors.',
    },
    {
      name: 'Farhan Haidar Ar-Rasyid',
      role: 'Infrastructure & Cloud Pentester',
      photo: '/team/farhan.jpg',
      level: 'Network & Cloud Security Specialist',
      certs: ['CRTP', 'AWS Security', 'eCPPTv2'],
      focus: 'Corporate Networks & Hybrid Cloud Security',
      bio: 'Focuses on enterprise network resilience, Active Directory attack graphs, and cloud container hardening (AWS, GCP, Azure) against ransomware and lateral traversal.',
    }
  ];

  return (
    <section id="team" className="py-24 bg-[#08080A] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Leadership & Specialist Engineering Hierarchy
          </h2>
          <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
            Executive leadership and internationally certified offensive engineers at <strong className="text-white font-medium">PT Terampil Profesional Sejahtera Abadi</strong> dedicated to protecting your mission-critical infrastructure.
          </p>
        </div>

        <div className="flex flex-col items-center">
          
          <div className="flex flex-col items-center w-full max-w-md">
            <div className="w-full p-6 sm:p-7 rounded-3xl bg-[#0D0D11] border-2 border-red-500/50 shadow-[0_0_35px_rgba(220,38,38,0.2)] text-center relative hover:border-red-500 transition-all group">
              
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-600 text-white font-sans text-[11px] font-semibold tracking-wider uppercase shadow-md">
                Chief Executive Leadership
              </div>

              <div className="mt-2 mb-4 flex justify-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-red-500/80 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={ceo.photo}
                    alt={ceo.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white font-sans">
                {ceo.name}
              </h3>
              <div className="text-xs sm:text-sm font-semibold text-red-400 mt-1">
                {ceo.role}
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-light">
                {ceo.focus}
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-light mt-3 pt-3 border-t border-white/10">
                {ceo.bio}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {ceo.certs.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-500/30"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-[2px] h-12 bg-gradient-to-b from-red-500 to-white/20" />
          </div>

          <div className="w-full max-w-3xl hidden md:flex items-center justify-center relative">
            
            <div className="w-3/4 h-[2px] bg-white/20 absolute top-0" />
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-0 md:mt-3">
            {executiveLeads.map((lead, idx) => (
              <div key={lead.name} className="flex flex-col items-center">
                
                <div className="w-[2px] h-6 bg-white/20 hidden md:block mb-2" />

                <div className="w-full p-6 rounded-2xl bg-[#0D0D11] border border-white/15 hover:border-red-500/50 shadow-xl text-center relative transition-all group flex flex-col justify-between h-full">
                  
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#181820] text-zinc-300 border border-white/10 font-sans text-[10px] font-medium tracking-wide">
                    {lead.level}
                  </div>

                  <div>
                    
                    <div className="mt-2 mb-4 flex justify-center">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-red-500 transition-colors shadow-lg">
                        <img
                          src={lead.photo}
                          alt={lead.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white font-sans">
                      {lead.name}
                    </h4>
                    <div className="text-xs font-semibold text-red-400 mt-0.5">
                      {lead.role}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-light">
                      Domain Focus: {lead.focus}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-light mt-3 pt-3 border-t border-white/5">
                      {lead.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap justify-center gap-1.5">
                    {lead.certs.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161619] text-zinc-200 border border-white/10"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-4xl hidden md:flex flex-col items-center my-2">
            <div className="w-[2px] h-8 bg-white/20" />
            <div className="w-2/3 h-[2px] bg-white/20" />
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-6 md:mt-2">
            {specialistEngineers.map((eng) => (
              <div key={eng.name} className="flex flex-col items-center">
                
                <div className="w-[2px] h-6 bg-white/20 hidden md:block mb-2" />

                <div className="w-full p-6 rounded-2xl bg-[#0D0D11] border border-white/10 hover:border-red-500/40 shadow-lg text-center relative transition-all group flex flex-col justify-between h-full">
                  
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#161619] text-zinc-400 border border-white/10 font-sans text-[10px] font-medium">
                    {eng.level}
                  </div>

                  <div>
                    
                    <div className="mt-2 mb-4 flex justify-center">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/15 group-hover:border-red-500 transition-colors shadow-md">
                        <img
                          src={eng.photo}
                          alt={eng.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white font-sans">
                      {eng.name}
                    </h4>
                    <div className="text-xs font-semibold text-red-400 mt-0.5">
                      {eng.role}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-light">
                      Domain Focus: {eng.focus}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-light mt-3 pt-3 border-t border-white/5">
                      {eng.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap justify-center gap-1.5">
                    {eng.certs.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161619] text-zinc-200 border border-white/10"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-16 p-6 rounded-2xl bg-[#0D0D11] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white font-sans">
                Professional Ethics & Absolute Integrity Pledge
              </div>
              <div className="text-xs text-zinc-400 mt-0.5 font-light">
                All personnel operate under legally binding personal non-disclosure covenants and adhere to strict professional offensive security codes of ethics.
              </div>
            </div>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-red-400 transition-colors shrink-0"
          >
            <span>Contact Our Team →</span>
          </a>
        </div>

      </div>
    </section>
  );
}
