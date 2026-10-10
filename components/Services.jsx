'use client';

import { useState } from 'react';
import { 
  Globe, Smartphone, Server, Cloud, Skull, 
  ArrowUpRight, Check, X, Shield 
} from 'lucide-react';

export default function Services() {
  const [activeModal, setActiveModal] = useState(null);

  const services = [
    {
      code: 'SVC-01',
      title: 'Web & API Penetration Testing',
      tagline: 'Web & API Penetration Testing',
      standards: 'OWASP WSTG v4.2 & PTES Standards',
      desc: 'In-depth manual security analysis of modern single-page applications, microservices, and API endpoints (REST, GraphQL, gRPC) to discover financial manipulation, broken object-level authorization, and complex business logic bypasses undetectable by automated scanners.',
      vectors: [
        'Broken Object Level & Function Authorization (BOLA/BFLA)',
        'Business Logic Flaws & Payment Workflow Tampering',
        'Server-Side Request Forgery & Remote Code Execution (SSRF/RCE)',
        'Authentication Token & OAuth / JWT Vulnerabilities'
      ],
      deliverables: [
        'Executive Summary for Board & C-Suite Stakeholders',
        'In-Depth Technical Report with Verifiable Proof-of-Concepts (PoC)',
        'Actionable Code Patch Diffs and Remediation Guidance',
        'Official Security Attestation Letter'
      ]
    },
    {
      code: 'SVC-02',
      title: 'Mobile Application Security (iOS & Android)',
      tagline: 'Mobile Application Security',
      standards: 'OWASP MASVS & MASTG Standards',
      desc: 'Thorough static and dynamic security assessments of Android (APK/AAB) and iOS (IPA) binaries, encompassing local storage encryption, runtime memory manipulation, certificate pinning bypass, and backend communication paths.',
      vectors: [
        'Unencrypted Sensitive Data in Local SQLite & Cache Storage',
        'Jailbreak & Root Detection Evasion & Binary Tampering',
        'Hardcoded Secrets, Cryptographic Keys, and Private API Tokens',
        'Transport Security Manipulation & SSL Pinning Bypass'
      ],
      deliverables: [
        'Comprehensive Binary Decompilation & Static Analysis Report',
        'Mitigation Roadmaps & ProGuard/DexGuard Obfuscation Guidelines',
        'App Store & Google Play Policy Compliance Verification',
        'Developer-Centric Remediation Playbooks'
      ]
    },
    {
      code: 'SVC-03',
      title: 'Internal Corporate Network & AD Audit',
      tagline: 'Network & Infrastructure Audit',
      standards: 'NIST CSF & CIS Benchmarks',
      desc: 'Rigorous penetration testing targeting internal corporate networks, Active Directory topologies, perimeter routers, firewalls, and critical database hosts to evaluate defense against lateral movement and ransomware execution.',
      vectors: [
        'Active Directory Domain Compromise & Privilege Escalation',
        'Lateral Movement & Kerberoasting / AS-REP Roasting Attacks',
        'Exposed Internal Services, Legacy Protocols & Vulnerable Daemons',
        'Credential Hygiene, Password Spraying, and Default Configurations'
      ],
      deliverables: [
        'Visual Attack Path Graph Across Corporate Network Infrastructure',
        'Active Directory Hardening & Tiered Administration Plan',
        'Comprehensive Vulnerability Inventory Ranked by CVSS v3.1',
        'Zero-Trust Network Segmentation Recommendations'
      ]
    },
    {
      code: 'SVC-04',
      title: 'Cloud Security Architecture Assessment (AWS/GCP/Azure)',
      tagline: 'Cloud Security Assessment',
      standards: 'CIS Cloud Benchmarks & CSA CCM',
      desc: 'Full-spectrum review of enterprise cloud environments to eliminate overprivileged IAM roles, public bucket disclosures, Kubernetes container escapes, and infrastructure-as-code misconfigurations.',
      vectors: [
        'Overprivileged IAM Roles & Privilege Escalation Paths',
        'Public Object Storage Exposures (S3 / Google Cloud Storage)',
        'Container Runtime Escape & Kubernetes RBAC Misconfigurations',
        'Security Group Drift & Unrestricted Internet Egress/Ingress'
      ],
      deliverables: [
        'IAM Matrix Audit & Least-Privilege Optimization Guide',
        'Hardened Infrastructure-as-Code (Terraform) Templates',
        'Data Encryption & Disaster Recovery Architecture Review',
        'Automated Cloud Security Posture Management Integration'
      ]
    },
    {
      code: 'SVC-05',
      title: 'Full-Scope Adversary Simulation (Red Teaming)',
      tagline: 'Adversary Simulation / Red Teaming',
      standards: 'MITRE ATT&CK Framework',
      desc: 'Goal-oriented, covert offensive engagements designed to test your organization\'s holistic detection and incident response capabilities across human, physical, and digital perimeter controls.',
      vectors: [
        'Spear-Phishing & Social Engineering Attack Simulations',
        'EDR/XDR Evasion & Living-off-the-Land (LotL) Techniques',
        'Covert Crown Jewel Data Exfiltration & Command and Control (C2)',
        'Blue Team Detection & Mean Time to Respond (MTTR) Stress-Testing'
      ],
      deliverables: [
        'Timeline Comparison: Adversary Action vs. Security Operations Detection',
        'Complete Narrative Attack Path Graph from Initial Access to Crown Jewels',
        'Blue Team Remediation Workshop & SIEM Detection Rule Engineering',
        'Debrief Presentation with Executive Leadership'
      ]
    }
  ];

  return (
    <section id="services" className="py-24 bg-[#08080A] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Offensive Cybersecurity Assessment Capabilities
          </h2>
          <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
            We systematically stress-test each technological layer of your enterprise — from web applications and native mobile clients to hybrid cloud fabrics and Active Directory ecosystems — ensuring vulnerabilities are identified and neutralized before adversarial exploitation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => {
            const isRedTeam = srv.code === 'SVC-05';

            return (
              <div
                key={srv.code}
                className={`p-6 sm:p-7 rounded-2xl bg-[#0D0D11] border border-white/10 hover:border-red-500/40 transition-all flex flex-col justify-between ${
                  isRedTeam ? 'lg:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="pb-3 border-b border-white/5 mb-5">
                    <span className="text-[11px] font-sans text-zinc-400">
                      Standard: {srv.standards.split('&')[0]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 font-sans">
                    {srv.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mb-3">
                    {srv.tagline}
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-6 font-light">
                    {srv.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-medium text-white block">
                      Core Vectors Assessed:
                    </span>
                    {srv.vectors.slice(0, 3).map((v, vi) => (
                      <div key={vi} className="flex items-start gap-2 text-xs text-zinc-300 font-light">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-sans text-zinc-400">
                    Expert Manual Assessment
                  </span>
                  <button
                    onClick={() => setActiveModal(srv)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-red-400 transition-colors"
                  >
                    <span>View Scope & Deliverables</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0D0D11] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono text-red-500 font-bold block">
                {activeModal.code} — Technical Specifications
              </span>
              <h3 className="text-xl font-bold text-white font-sans">
                {activeModal.title}
              </h3>
              <p className="text-xs text-zinc-400">
                {activeModal.standards}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
              {activeModal.desc}
            </p>

            <div className="p-4 rounded-xl bg-[#141418] border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-white block">
                Target Vectors & Testing Scope:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeModal.vectors.map((vec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-light">
                    <Check className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{vec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-white block">
                Official Client Deliverables:
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300 font-light">
                {activeModal.deliverables.map((del, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Guaranteed by Bilateral Mutual NDA
              </span>
              <a
                href="#contact"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
              >
                Inquire About This Scope
              </a>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
