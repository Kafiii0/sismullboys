'use client';

import { Shield, Lock, Target, Terminal, Scale, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  const stats = [
    { label: 'Manual Verification', val: '100%', sub: 'Empirical PoC for every finding' },
    { label: 'False Positives', val: '0', sub: 'Zero noisy scanner hallucinations' },
    { label: 'Retest Assurance', val: '30 Days', sub: 'Complimentary remediation review' },
    { label: 'Legal Safeguard', val: '100%', sub: 'Enforceable bilateral Mutual NDA' }
  ];

  const pillars = [
    {
      icon: <Lock className="w-5 h-5 text-red-400" />,
      title: 'Guaranteed Confidentiality',
      desc: 'All parameters, source code, and findings are legally protected under enforceable bilateral Mutual NDAs with certified cryptographic artifact sanitization post-audit.'
    },
    {
      icon: <Target className="w-5 h-5 text-red-400" />,
      title: 'Zero False Positives',
      desc: 'Our engineers manually prove every discovery with non-destructive Proof-of-Concepts (PoCs), ensuring engineering hours focus solely on real business risks.'
    },
    {
      icon: <Terminal className="w-5 h-5 text-red-400" />,
      title: 'Developer-Ready Remedies',
      desc: 'We provide production-ready code diffs, configuration snippets, and direct engineering triage to accelerate your team’s remediation lifecycle.'
    },
    {
      icon: <Scale className="w-5 h-5 text-red-400" />,
      title: 'Controlled Engagement (RoE)',
      desc: 'All assessments operate under predefined Rules of Engagement (RoE) with whitelisted IP boundaries, guaranteeing zero production service disruption.'
    }
  ];

  const frameworks = ['PTES Standard', 'OWASP WSTG v4.2', 'NIST CSF 2.0', 'MITRE ATT&CK', 'ISO/IEC 27001'];

  return (
    <section className="py-24 bg-[#08080A] relative overflow-hidden border-b border-white/[0.06]">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-[-80px] w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-80px] w-[450px] h-[450px] bg-red-950/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span>Corporate Security Intelligence</span>
          </div>

          <h1 className="font-grotesk text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Defending Enterprise Ecosystems with Rigor and Integrity.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            <strong className="text-white font-medium">PT Terampil Profesional Sejahtera Abadi (PROMETHEUS)</strong> is an independent cybersecurity consulting firm. We believe true resilience requires deep adversarial thinking—evaluating your defenses from the perspective of real-world threat actors under strict ethical governance.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#0D0D12]/90 backdrop-blur-xl border border-white/[0.08] hover:border-red-500/30 transition-all shadow-lg"
            >
              <div className="text-3xl sm:text-4xl font-grotesk font-bold text-white mb-1">
                {s.val}
              </div>
              <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                {s.label}
              </div>
              <div className="text-[11px] text-zinc-500 font-light">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#0D0D12]/90 backdrop-blur-xl border border-white/[0.08] space-y-6 shadow-xl">
            <div>
              <h2 className="font-grotesk text-2xl font-bold text-white mb-3">
                Mission & Philosophy
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                Automated security scanners only scratch the surface, often drowning engineering teams in false alarms. PROMETHEUS delivers deep human intelligence—complex business logic bypasses, authorization flaws, and multi-stage lateral movement paths that automated scanners consistently miss.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider font-semibold block">
                Aligned Frameworks & Standards:
              </span>
              <div className="flex flex-wrap gap-2">
                {frameworks.map((fw) => (
                  <span
                    key={fw}
                    className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-300"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors group"
              >
                <span>Consult with Senior Technical Advisors</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pil, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0D0D12]/90 backdrop-blur-xl border border-white/[0.08] hover:border-red-500/30 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {pil.icon}
                  </div>
                  <h3 className="font-grotesk text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {pil.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {pil.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
                  <span>Verified Standard</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
