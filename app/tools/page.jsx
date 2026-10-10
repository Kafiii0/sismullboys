'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { 
  Search, Shield, AlertTriangle, CheckCircle2, Globe, 
  Server, ArrowRight, ExternalLink, RefreshCw, Filter, 
  ChevronRight, Lock, Eye, Download, Info, Mail, Cpu,
  Layers, AlertOctagon, Terminal, ArrowUpRight, ShieldAlert,
  ShieldCheck, ShieldX, HelpCircle, FileWarning, Radar,
  Clock, Fingerprint, Bug, Crosshair, Zap, XCircle
} from 'lucide-react';

export default function ReconToolPage() {
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('TECH_CVE');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cveFilter, setCveFilter] = useState('ALL'); 

  const handleScan = async (targetDomain) => {
    const domain = (targetDomain || domainInput).trim();
    if (!domain) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/recon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed.');
      setResult(data); setActiveTab('TECH_CVE');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `reconforge_${result.target}_${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const filteredHosts = result?.resolvedHosts?.filter((host) => {
    const match = host.subdomain.toLowerCase().includes(searchFilter.toLowerCase()) || host.ip.includes(searchFilter);
    if (!match) return false;
    if (statusFilter === 'LIVE') return host.isLive;
    if (statusFilter === 'STALE') return !host.isLive;
    return true;
  }) || [];

  const filteredCves = result?.mappedCves?.filter((cve) => {
    if (cveFilter === 'ALL') return true;
    return cve.verification.status === cveFilter;
  }) || [];

  const VerBadge = ({ status, confidence }) => {
    const styles = {
      VERIFIED: 'bg-red-600/20 text-red-400 border-red-500/40',
      LIKELY: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      POSSIBLE: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40',
      PATCHED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    };
    const icons = {
      VERIFIED: <Bug className="w-3 h-3" />,
      LIKELY: <AlertTriangle className="w-3 h-3" />,
      POSSIBLE: <HelpCircle className="w-3 h-3" />,
      PATCHED: <ShieldCheck className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.POSSIBLE}`}>
        {icons[status]}
        <span>{status}</span>
        <span className="font-normal opacity-70">{confidence}%</span>
      </span>
    );
  };

  const SevBadge = ({ severity }) => {
    const s = {
      CRITICAL: 'bg-red-600/25 text-red-400 border-red-500/50 font-extrabold',
      HIGH: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      MEDIUM: 'bg-amber-500/12 text-amber-400 border-amber-500/30',
      LOW: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40',
      INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${s[severity] || s.LOW}`}>
        {severity}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white">
      <Navbar />

      <section className="pt-36 pb-24 md:pt-40 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <h1 className="font-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              PROMETHEUS ReconForge<span className="text-red-500">™</span>
            </h1>
            <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
              Advanced attack surface intelligence engine. Discovers subdomains via Certificate Transparency, fingerprints technology stacks, extracts exact versions, maps CVE advisories, <strong className="text-white font-medium">passively verifies vulnerability status</strong>, probes 30+ sensitive endpoints, tests CORS policies, detects WAF infrastructure, and scores security posture with CVSS v3.1 correlation.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#121217] border border-white/[0.08] shadow-2xl mb-10">
            <form onSubmit={(e) => { e.preventDefault(); handleScan(); }} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="text" value={domainInput} onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter target domain (e.g., telkomuniversity.ac.id)"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-4 py-3.5 pl-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors font-sans"
                  disabled={loading} />
              </div>
              <button type="submit" disabled={loading || !domainInput.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-red-950/30">
                {loading ? (<><RefreshCw className="w-4 h-4 animate-spin" /><span>Scanning...</span></>) : (<><span>Execute Deep Scan</span><Crosshair className="w-4 h-4" /></>)}
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 font-sans">Test Targets:</span>
              {['telkomuniversity.ac.id', 'ui.ac.id', 'github.com'].map((t) => (
                <button key={t} type="button" onClick={() => { setDomainInput(t); handleScan(t); }} disabled={loading}
                  className="text-xs font-mono px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] transition-colors">{t}</button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="p-10 rounded-2xl bg-[#121217] border border-white/[0.08] text-center space-y-4 mb-10">
              <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Multi-Phase Deep Scan in Progress</h3>
                <p className="text-xs text-zinc-400 mt-1 font-light max-w-lg mx-auto">
                  Resolving DNS · Querying CT Logs · Probing 30+ Endpoints · Fingerprinting Stack · Extracting Versions · Mapping CVEs · Verifying Vulnerabilities · Testing CORS · Detecting WAF · Scoring Posture
                </p>
                <div className="mt-4 flex justify-center gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-red-500/60 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-start gap-4 mb-10 text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-300">Scan Error</h4>
                <p className="text-xs text-red-300/80 mt-1 font-light">{error}</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                
                <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider">Security Score</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{result.summary.securityScore}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
                      result.summary.grade === 'A+' || result.summary.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      result.summary.grade === 'B' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      result.summary.grade === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>{result.summary.grade}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider">Max CVSS</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-red-400">
                    {result.summary.maxCvssScore > 0 ? result.summary.maxCvssScore : '—'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider">CVE Advisories</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{result.summary.cveAdvisoriesCount}</span>
                    {result.summary.verifiedCveCount > 0 && (
                      <span className="text-[10px] font-bold text-red-400">{result.summary.verifiedCveCount} verified</span>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider">Tech Components</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{result.summary.detectedTechCount}</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider">Live Hosts</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{result.summary.liveHostsCount}</span>
                    <span className="text-[10px] text-zinc-500">/ {result.summary.totalSubdomainsFound}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-sans text-zinc-400 uppercase tracking-wider">Exposed Files</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-extrabold ${result.summary.criticalExposuresCount > 0 ? 'text-red-400' : 'text-white'}`}>
                      {result.summary.exposedEndpointsCount}
                    </span>
                    {result.summary.criticalExposuresCount > 0 && (
                      <span className="text-[10px] font-bold text-red-400">{result.summary.criticalExposuresCount} critical</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    <span className="font-mono text-red-400">{result.target}</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                    {result.summary.serverSoftware}
                  </span>
                  {result.deepRecon?.waf?.detected && (
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      WAF: {result.deepRecon.waf.name}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-zinc-500">
                    <Clock className="w-3 h-3 inline mr-1" />{(result.scanDuration / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleExportJson}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-semibold transition-colors">
                    <Download className="w-3.5 h-3.5" /><span>Export JSON</span>
                  </button>
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors">
                    <span>Request Full Pentest</span><ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#121217] border border-white/[0.08]">
                {[
                  { key:'TECH_CVE', icon:<Layers className="w-4 h-4" />, label:`Stack & CVEs (${result.mappedCves.length})` },
                  { key:'VECTORS', icon:<AlertOctagon className="w-4 h-4" />, label:`Findings (${result.findings.length})` },
                  { key:'DEEPRECON', icon:<Radar className="w-4 h-4" />, label:`Deep Recon (${result.summary.exposedEndpointsCount})` },
                  { key:'SUBDOMAINS', icon:<Globe className="w-4 h-4" />, label:`Subdomains (${result.resolvedHosts.length})` },
                  { key:'EMAIL', icon:<Mail className="w-4 h-4" />, label:'Email Security' },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.key ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}>
                    {tab.icon}<span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeTab === 'TECH_CVE' && (
                <div className="space-y-6">
                  
                  <div className="p-6 sm:p-7 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-4">
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-red-500" />
                      <span>Fingerprinted Technology Stack</span>
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {result.detectedTech.length === 0 ? (
                        <span className="text-xs text-zinc-400 font-light">No identifiable technology signatures detected.</span>
                      ) : (
                        result.detectedTech.map((tech, i) => (
                          <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#181820] border border-white/10">
                            <span className="text-xs font-semibold text-white">{tech.name}</span>
                            {tech.version && (
                              <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                v{tech.version}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-zinc-400 uppercase bg-white/[0.04] px-1.5 py-0.5 rounded">
                              {tech.category}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {result.mappedCves.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-400">Filter by Verification:</span>
                      {[
                        { key:'ALL', label:'All', count: result.mappedCves.length },
                        { key:'VERIFIED', label:'Verified', count: result.summary.verifiedCveCount },
                        { key:'LIKELY', label:'Likely', count: result.summary.likelyCveCount },
                        { key:'POSSIBLE', label:'Possible', count: result.mappedCves.filter(c => c.verification.status === 'POSSIBLE').length },
                        { key:'PATCHED', label:'Patched', count: result.summary.patchedCveCount },
                      ].map(f => (
                        <button key={f.key} onClick={() => setCveFilter(f.key)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            cveFilter === f.key ? 'bg-red-600/20 text-red-400 border-red-500/30 font-bold' : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
                          }`}>
                          {f.label} ({f.count})
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        CVE Advisory Intelligence ({filteredCves.length})
                      </h2>
                    </div>

                    {filteredCves.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#121217] border border-white/[0.08] text-center text-zinc-400 text-sm">
                        {cveFilter === 'ALL' ? 'No CVE advisories mapped to detected technologies.' : `No ${cveFilter.toLowerCase()} CVEs found.`}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCves.map((cve, i) => (
                          <div key={i} className="p-5 sm:p-6 rounded-2xl bg-[#121217] border border-white/[0.08] hover:border-white/15 transition-all space-y-4">
                            
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <SevBadge severity={cve.severity} />
                                  <span className="text-xs font-mono font-bold text-red-400">{cve.cve}</span>
                                  <VerBadge status={cve.verification.status} confidence={cve.verification.confidence} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-white">{cve.title}</h3>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded border border-white/10">
                                  {cve.relatedComponent} {cve.detectedVersion !== 'Unknown' ? `v${cve.detectedVersion}` : ''}
                                </span>
                                <span className="text-xs font-mono font-bold text-white bg-white/[0.04] px-2.5 py-1 rounded border border-white/10">
                                  CVSS {cve.cvss}
                                </span>
                              </div>
                            </div>

                            <div className={`p-3 rounded-lg border text-xs font-mono ${
                              cve.verification.status === 'VERIFIED' ? 'bg-red-950/20 border-red-500/20 text-red-300' :
                              cve.verification.status === 'LIKELY' ? 'bg-orange-950/15 border-orange-500/15 text-orange-300' :
                              cve.verification.status === 'PATCHED' ? 'bg-emerald-950/15 border-emerald-500/15 text-emerald-300' :
                              'bg-zinc-900/50 border-white/[0.04] text-zinc-400'
                            }`}>
                              <span className="font-bold text-[10px] uppercase tracking-wider block mb-1 opacity-70">Verification Evidence</span>
                              {cve.verification.evidence}
                              <span className="block mt-1 opacity-50 text-[10px]">Method: {cve.verification.method}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-zinc-300 pt-2 border-t border-white/[0.04]">
                              <div>
                                <span className="font-semibold text-zinc-400 block mb-1">Impact & Affected Range:</span>
                                <p className="leading-relaxed">{cve.impact}</p>
                                {cve.range && (
                                  <span className="text-[11px] font-mono text-zinc-500 block mt-1.5">
                                    Vulnerable: {cve.range.min} – {cve.range.max} · Fixed: {cve.fixed || 'N/A'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-zinc-400 block mb-1">Remediation:</span>
                                <p className="leading-relaxed text-zinc-300 font-mono text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                                  {cve.remediation}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'VECTORS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Security Findings ({result.findings.length})
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      {result.summary.criticalCount > 0 && <span className="text-red-400">{result.summary.criticalCount} Critical</span>}
                      {result.summary.highSeverityCount > 0 && <span className="text-rose-400">{result.summary.highSeverityCount} High</span>}
                      {result.summary.mediumSeverityCount > 0 && <span className="text-amber-400">{result.summary.mediumSeverityCount} Medium</span>}
                      {result.summary.lowSeverityCount > 0 && <span className="text-zinc-400">{result.summary.lowSeverityCount} Low</span>}
                    </div>
                  </div>

                  {result.findings.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#121217] border border-white/[0.08] text-center text-zinc-400 text-sm">
                      No security misconfigurations detected on public perimeter.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.findings.map((f, idx) => (
                        <div key={f.id || idx} className="p-5 sm:p-6 rounded-2xl bg-[#121217] border border-white/[0.08] hover:border-white/15 transition-all space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <SevBadge severity={f.severity} />
                              <span className="text-xs font-mono text-zinc-400">{f.id}</span>
                              <h3 className="text-sm font-bold text-white">{f.title}</h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-white bg-white/[0.04] px-2.5 py-1 rounded border border-white/10 shrink-0">
                              CVSS {f.cvss}
                            </span>
                          </div>

                          {f.evidence && (
                            <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] text-[11px] font-mono text-zinc-400">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Evidence:</span>
                              {f.evidence}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-zinc-300 pt-2 border-t border-white/[0.04]">
                            <div>
                              <span className="font-semibold text-zinc-400 block mb-1">Impact:</span>
                              <p className="leading-relaxed">{f.impact}</p>
                              <span className="text-[11px] font-mono text-zinc-500 block mt-2">{f.cwe} · {f.mitre}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-zinc-400 block mb-1">Remediation:</span>
                              <p className="leading-relaxed text-zinc-300 font-mono text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                                {f.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'DEEPRECON' && result.deepRecon && (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" /> WAF / CDN Detection
                      </h3>
                      {result.deepRecon.waf.detected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-300">{result.deepRecon.waf.name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded">
                              {result.deepRecon.waf.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-400">{result.deepRecon.waf.evidence}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <ShieldX className="w-5 h-5" />
                          <span className="text-sm">No WAF/CDN detected — origin may be directly exposed.</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" /> CORS Policy Test
                      </h3>
                      {result.deepRecon.cors.tested ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {result.deepRecon.cors.vulnerable ? (
                              <><XCircle className="w-5 h-5 text-red-400" /><span className="text-sm font-semibold text-red-300">Misconfigured — Permissive CORS</span></>
                            ) : (
                              <><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="text-sm font-semibold text-emerald-300">Properly Restricted</span></>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 space-y-0.5">
                            <div>Allow-Origin: <span className="text-zinc-300">{result.deepRecon.cors.allowOrigin}</span></div>
                            <div>Allow-Credentials: <span className="text-zinc-300">{result.deepRecon.cors.allowCredentials}</span></div>
                            {result.deepRecon.cors.reflected && <div className="text-red-400">⚠ Origin header is reflected back — critical misconfiguration</div>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">CORS test could not be completed.</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-zinc-400" /> robots.txt Analysis
                      </h3>
                      {result.deepRecon.robotsTxtFound ? (
                        <div>
                          {result.deepRecon.robotsSensitivePaths.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs text-amber-400 font-medium">Sensitive paths disclosed:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {result.deepRecon.robotsSensitivePaths.map((p, i) => (
                                  <span key={i} className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{p}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">robots.txt found — no sensitive paths disclosed.</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">No robots.txt found.</p>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-zinc-400" /> security.txt
                      </h3>
                      {result.deepRecon.securityTxtFound ? (
                        <div className="text-[11px] font-mono text-zinc-300 bg-black/30 p-3 rounded-lg border border-white/[0.04] max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {result.deepRecon.securityTxtContent}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400">No security.txt found — no vulnerability disclosure policy published.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileWarning className="w-4 h-4 text-red-500" />
                      Exposed Endpoints & Sensitive Files ({result.deepRecon.exposedEndpoints.length})
                      <span className="text-[10px] font-normal text-zinc-400 ml-2">{result.deepRecon.endpointsProbed} endpoints probed</span>
                    </h3>

                    {result.deepRecon.exposedEndpoints.length === 0 ? (
                      <div className="text-sm text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> No sensitive endpoints exposed. Good perimeter hygiene.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-white/[0.08] text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Severity</th>
                              <th className="py-3 px-4">Path</th>
                              <th className="py-3 px-4">Description</th>
                              <th className="py-3 px-4">HTTP Code</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {result.deepRecon.exposedEndpoints.map((ep, i) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-4">
                                  {ep.accessible ? (
                                    <span className="inline-flex items-center gap-1 text-red-400"><XCircle className="w-3.5 h-3.5" /> Open</span>
                                  ) : ep.forbidden ? (
                                    <span className="inline-flex items-center gap-1 text-amber-400"><Lock className="w-3.5 h-3.5" /> 403</span>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                    ep.cat === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                                    ep.cat === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                    'bg-zinc-700/40 text-zinc-400 border-zinc-600'
                                  }`}>{ep.cat}</span>
                                </td>
                                <td className="py-3 px-4 font-mono text-white font-medium">{ep.path}</td>
                                <td className="py-3 px-4 text-zinc-400">{ep.name}</td>
                                <td className="py-3 px-4 font-mono text-zinc-300">{ep.status || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'SUBDOMAINS' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Perimeter Subdomains ({result.resolvedHosts.length})
                      </h2>
                      <p className="text-xs text-zinc-400 font-light mt-1">Certificate Transparency + DNS resolution mapping.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-[#181820] p-1 rounded-xl border border-white/10 text-xs">
                        <button onClick={() => setStatusFilter('ALL')}
                          className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:text-white'}`}>
                          All ({result.resolvedHosts.length})
                        </button>
                        <button onClick={() => setStatusFilter('LIVE')}
                          className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-white'}`}>
                          Live ({result.summary.liveHostsCount})
                        </button>
                        <button onClick={() => setStatusFilter('STALE')}
                          className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'STALE' ? 'bg-white/10 text-zinc-300 font-semibold' : 'text-zinc-400 hover:text-white'}`}>
                          Stale ({result.summary.unresolvedCount})
                        </button>
                      </div>
                      <input type="text" placeholder="Search host or IP..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
                        className="bg-[#181820] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-sans" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Subdomain</th>
                          <th className="py-3 px-4">Scope</th>
                          <th className="py-3 px-4">IP Address</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredHosts.length === 0 ? (
                          <tr><td colSpan={4} className="py-8 text-center text-zinc-500 font-light">No matching hosts.</td></tr>
                        ) : (
                          filteredHosts.map((host, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-medium text-white">{host.subdomain}</td>
                              <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">{host.type}</td>
                              <td className="py-3.5 px-4 font-mono text-zinc-300">{host.ip}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  host.isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${host.isLive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                                  {host.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'EMAIL' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#121217] border border-white/[0.08] space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Email Anti-Spoofing & Phishing Posture</h2>
                    <p className="text-xs text-zinc-400 font-light mt-1">SPF, DMARC, DKIM, and MX record verification.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="p-5 rounded-xl bg-[#181820] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">SPF Record</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          result.emailSecurity.hasSpf ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>{result.emailSecurity.hasSpf ? 'Found' : 'Missing'}</span>
                      </div>
                      <div className="font-mono text-[11px] text-zinc-300 p-3 bg-black/40 rounded-lg break-all border border-white/[0.04]">
                        {result.emailSecurity.spfRecord}
                      </div>
                    </div>
                    
                    <div className="p-5 rounded-xl bg-[#181820] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">DMARC Policy</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          result.emailSecurity.hasDmarc ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>{result.emailSecurity.hasDmarc ? 'Found' : 'Missing'}</span>
                      </div>
                      <div className="font-mono text-[11px] text-zinc-300 p-3 bg-black/40 rounded-lg break-all border border-white/[0.04]">
                        {result.emailSecurity.dmarcRecord}
                      </div>
                    </div>
                    
                    <div className="p-5 rounded-xl bg-[#181820] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">DKIM Selector</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          result.emailSecurity.hasDkim ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>{result.emailSecurity.hasDkim ? 'Found' : 'Not Found'}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {result.emailSecurity.hasDkim ? 'DKIM signing key found via common selector probe.' : 'No DKIM key found for common selectors (default, google, selector1, selector2, k1, dkim).'}
                      </p>
                    </div>
                  </div>
                  
                  {result.emailSecurity.mxExchanges.length > 0 && (
                    <div className="p-5 rounded-xl bg-[#181820] border border-white/10 space-y-3">
                      <span className="text-xs font-semibold text-white">MX Mail Exchangers</span>
                      <div className="flex flex-wrap gap-2">
                        {result.emailSecurity.mxExchanges.map((mx, i) => (
                          <span key={i} className="text-[11px] font-mono text-zinc-300 bg-black/30 px-2.5 py-1 rounded border border-white/[0.04]">{mx}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-8 sm:p-10 rounded-2xl bg-[#14141A] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl space-y-2">
                  <h3 className="text-xl font-bold text-white">Need Manual Offensive Verification?</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                    Automated reconnaissance reveals public exposure. PROMETHEUS offensive engineers perform credentialed manual penetration testing, business logic exploitation, and lateral compromise simulation under formal NDA.
                  </p>
                </div>
                <Link href="/contact"
                  className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-lg shadow-red-950/40 shrink-0">
                  Consult Security Advisor
                </Link>
              </div>

            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
