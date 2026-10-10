'use client';

import { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Shield, Download, 
  RefreshCw, Check, ArrowRight, FileCheck 
} from 'lucide-react';
import Logo from './Logo';

export default function VulnTracker() {
  const capabilities = [
    {
      title: 'Real-Time Vulnerability Lifecycle Tracking',
      desc: 'Access a live, transparent inventory of identified vulnerabilities, categorized by CVSS severity, exploitability status, and verified resolution milestones.',
    },
    {
      title: 'Actionable Developer Guidance & Patch Diffs',
      desc: 'Eliminate ambiguity for your engineering team with contextual code snippets, secure framework configurations, and reproduction steps.',
    },
    {
      title: 'Streamlined 1-Click Retest Requests',
      desc: 'Once your engineering team commits remediation patches, initiate targeted re-evaluations directly through the portal with guaranteed 30-day turnaround at no additional cost.',
    },
    {
      title: 'Official Attestation & Compliance Credentials',
      desc: 'Export formal Security Attestation Letters signed by accredited principal assessors, serving as verifiable compliance proof for enterprise partners and regulators.',
    }
  ];

  return (
    <section id="platform" className="py-24 bg-[#08080A] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Streamline Security Remediation via VulnTracker™ Portal
          </h2>
          <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
            Our collaborative client portal bridges the gap between offensive findings and engineering resolution, enabling structured triage, direct technical discussion, and rapid verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            {capabilities.map((cap, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0D0D11] border border-white/10 hover:border-red-500/40 transition-all space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <h3 className="text-sm font-bold text-white font-sans">
                    {cap.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-3.5 font-light">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="p-7 rounded-2xl bg-[#0D0D11] border border-white/10 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-sans font-medium text-red-500 uppercase tracking-widest block">
                    AUDIT DELIVERABLE
                  </span>
                  <h4 className="text-base font-bold text-white font-sans mt-0.5">
                    Security Attestation Letter
                  </h4>
                </div>
                <div>
                  <Logo className="w-8 h-8" glow={true} />
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans font-light">
                <p>
                  Officially issued by <strong>PT Terampil Profesional Sejahtera Abadi</strong> as independent verification that your digital systems underwent deep manual penetration testing and that all critical exposures were remediated.
                </p>

                <div className="p-4 rounded-xl bg-[#141418] border border-white/5 font-sans text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Assessment Status:</span>
                    <span className="text-red-400 font-semibold">Completed & Verified Secure</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Residual Critical Findings:</span>
                    <span className="text-white font-bold">0 (All Expositions Resolved)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Testing Standard:</span>
                    <span className="text-zinc-200">PTES & OWASP-WSTG v4.2</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span className="text-zinc-400">Integrity Verification:</span>
                    <span className="text-zinc-300">Cryptographically Signed</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400">
                  This attestation certificate serves as recognized compliance documentation for financial auditors, regulatory agencies, and institutional enterprise partners.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-sans">
                  Official Validated Document
                </span>
                <button
                  onClick={() => alert("Simulation: Downloading sample official Security Attestation Letter (PDF) by PT Terampil Profesional Sejahtera Abadi.")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample (PDF)</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
