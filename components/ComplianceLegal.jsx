'use client';

import { Shield, Lock, Scale, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ComplianceLegal() {
  const pillars = [
    {
      code: '01',
      icon: <Lock className="w-5 h-5 text-red-400" />,
      title: 'Bilateral Mutual NDA',
      desc: 'Executed prior to assessment initiation. Protects source code, parameters, vulnerabilities, and proprietary architecture with cryptographic data sanitization post-audit.'
    },
    {
      code: '02',
      icon: <Scale className="w-5 h-5 text-red-400" />,
      title: 'Explicit Scope & RoE',
      desc: 'Target IP ranges, maintenance windows, and permitted techniques are strictly bounded in advance, guaranteeing zero operational downtime to production workloads.'
    },
    {
      code: '03',
      icon: <FileCheck className="w-5 h-5 text-red-400" />,
      title: 'Actionable Dual-Track Reports',
      desc: 'Executive summaries for C-suite risk quantification, paired with granular technical proof-of-concepts, CVSS v3.1 scores, and code patch diffs for developers.'
    },
    {
      code: '04',
      icon: <CheckCircle2 className="w-5 h-5 text-red-400" />,
      title: '30-Day Retesting Guarantee',
      desc: 'Complimentary re-testing by the principal offensive team within 30 days of report delivery to independently verify that all vulnerabilities have been closed.'
    }
  ];

  const steps = [
    { num: '01', title: 'Scope & NDA', desc: 'Define target assets, boundaries, and execute bilateral legal documentation.' },
    { num: '02', title: 'Controlled Audit', desc: 'Deep adversarial assessment performed without disruption to production.' },
    { num: '03', title: 'Deliverables', desc: 'Delivery of executive summaries and developer-ready vulnerability proofs.' },
    { num: '04', title: 'Patch & Retest', desc: 'Engineering team applies fixes, followed by complimentary re-verification.' },
    { num: '05', title: 'Attestation', desc: 'Issuance of official Security Attestation Letter for regulatory compliance.' }
  ];

  return (
    <section className="py-24 bg-[#08080A] relative overflow-hidden border-b border-white/[0.06]">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 right-[-80px] w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[-80px] w-[450px] h-[450px] bg-red-950/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-red-500" />
            <span>Ethical Governance & RoE</span>
          </div>

          <h1 className="font-grotesk text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Legal Assurances & Rules of Engagement
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            Offensive cybersecurity assessments must reinforce—never compromise—operational stability. Every PROMETHEUS engagement operates under formal authorization, strict scope covenants, and complete legal clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {pillars.map((p) => (
            <div
              key={p.code}
              className="p-7 rounded-2xl bg-[#0D0D12]/90 backdrop-blur-xl border border-white/[0.08] hover:border-red-500/30 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {p.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400">
                      ASSURANCE {p.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Legally Binding
                  </span>
                </div>

                <h3 className="text-lg font-grotesk font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Strictly Enforced Protocol</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[#0D0D12]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] mb-8 gap-3">
            <div>
              <h2 className="font-grotesk text-xl font-bold text-white">
                Engagement Lifecycle & Assessment Workflow
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-light">
                From initial scope definition to official attestation issuance.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
              Zero Operational Downtime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#121217]/80 border border-white/[0.06] hover:border-red-500/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-red-500 mb-2">
                    PHASE {st.num}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 font-grotesk">
                    {st.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-400">
              Need to execute a mutual NDA prior to scoping discussion?
            </span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-red-600/30"
            >
              <span>Request Standard Mutual NDA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
