'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { 
  Shield, AlertTriangle, CheckCircle2, Lock, Eye, Download, 
  ArrowRight, RefreshCw, KeyRound, Mail, Building2, ShieldAlert, 
  ShieldCheck, ShieldX, Terminal, ExternalLink, Calendar, Database, 
  Layers, ChevronRight, Fingerprint, Flame, Info, Check, EyeOff, Search
} from 'lucide-react';

export default function BreachWatchPage() {
  const [mode, setMode] = useState('email'); 
  const [inputVal, setInputVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('INCIDENTS'); 

  const handleAudit = async (targetOverride, modeOverride) => {
    const activeMode = modeOverride || mode;
    const query = (targetOverride || inputVal).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeMode, target: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit analysis failed.');
      setResult(data);
      setActiveTab('INCIDENTS');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breachwatch_${result.type}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="font-grotesk text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Dark Web & Credential Exposure Center
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Audit identities, cryptographic credentials, and enterprise domains against global compromised databases, stealer botnet telemetry, and public leak repositories.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-[#0F0F15] border border-white/[0.08] rounded-2xl gap-1 shadow-inner">
            <button
              onClick={() => { setMode('email'); setInputVal(''); setResult(null); setError(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'email'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Identity & Email</span>
            </button>
            <button
              onClick={() => { setMode('password'); setInputVal(''); setResult(null); setError(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'password'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Password K-Anonymity</span>
            </button>
            <button
              onClick={() => { setMode('domain'); setInputVal(''); setResult(null); setError(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'domain'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Corporate Domain</span>
            </button>
          </div>
        </div>

        <div className="bg-[#0D0D12] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] mb-10 max-w-4xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); handleAudit(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                {mode === 'email' && <Mail className="w-5 h-5" />}
                {mode === 'password' && <Lock className="w-5 h-5" />}
                {mode === 'domain' && <Building2 className="w-5 h-5" />}
              </div>

              <input
                type={mode === 'password' && !showPassword ? 'password' : 'text'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  mode === 'email'
                    ? 'Enter email address (e.g. employee@company.com)...'
                    : mode === 'password'
                    ? 'Enter password to audit (tested via SHA-1 k-Anonymity)...'
                    : 'Enter company domain (e.g. tokopedia.com, telkomuniversity.ac.id)...'
                }
                className="w-full bg-[#14141B] border border-white/[0.1] rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              />

              {mode === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm sm:text-base transition-all shadow-lg shadow-red-600/30 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Intelligence...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Execute Audit</span>
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center gap-3 text-red-200 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  result.status === 'COMPROMISED' || result.grade === 'F'
                    ? 'bg-red-600/10 border-red-500/30 text-red-400'
                    : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {result.status === 'COMPROMISED' || result.grade === 'F' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    Audit Subject ({result.type.toUpperCase()})
                  </div>
                  <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                    {mode === 'password' ? '••••••••••••' : result.target}
                    <span className={`text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded-full border ${
                      result.status === 'COMPROMISED' || result.pwned || result.grade === 'F'
                        ? 'bg-red-600/20 text-red-400 border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            </div>

            {result.type === 'email' && (
              <>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Exposure Score</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-grotesk font-bold ${
                        result.exposureScore > 60 ? 'text-red-400' : result.exposureScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {result.exposureScore}
                      </span>
                      <span className="text-xs text-zinc-500">/ 100</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                      Risk Level: <span className="font-bold text-zinc-200">{result.riskLevel}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Breaches Found</div>
                    <div className="text-3xl font-grotesk font-bold text-white">
                      {result.breachesCount}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                      Across Verified Repositories
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Pastebin Leaks</div>
                    <div className="text-3xl font-grotesk font-bold text-white">
                      {result.pastesCount || 0}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                      Unstructured Dump Mentions
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Compromised Classes</div>
                    <div className="text-3xl font-grotesk font-bold text-red-400">
                      {result.exposedDataClasses.length}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                      Sensitive Vector Fields
                    </div>
                  </div>
                </div>

                {result.exposedDataClasses.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Exposed Data Classes Detected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.exposedDataClasses.map((item) => {
                        const isPass = item.toLowerCase().includes('password');
                        const isFin = item.toLowerCase().includes('credit') || item.toLowerCase().includes('bank');
                        return (
                          <span
                            key={item}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                              isPass || isFin
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-white/[0.04] text-zinc-300 border-white/[0.08]'
                            }`}
                          >
                            {item}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                  <button
                    onClick={() => setActiveTab('INCIDENTS')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      activeTab === 'INCIDENTS' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Breach Incidents ({result.breaches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('REMEDIATION')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      activeTab === 'REMEDIATION' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Remediation Plan ({result.remediation.length})
                  </button>
                </div>

                {activeTab === 'INCIDENTS' && (
                  <div className="space-y-4">
                    {result.breaches.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-[#0D0D12] border border-white/[0.08] text-zinc-400">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <h4 className="text-white font-semibold mb-1">No Breach Matches</h4>
                        <p className="text-xs text-zinc-500">This identity has no recorded compromise incidents in indexed public breach databases.</p>
                      </div>
                    ) : (
                      result.breaches.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08] hover:border-white/[0.15] transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              {b.logo ? (
                                <img src={b.logo} alt={b.name} className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1 border border-white/10" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                                  {b.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                                  {b.name}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                    b.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  }`}>
                                    {b.severity}
                                  </span>
                                </h3>
                                <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                  <span>Sector: {b.industry}</span>
                                  <span>•</span>
                                  <span>Incident Date: {b.date}</span>
                                  {b.recordsExposed > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{b.recordsExposed.toLocaleString()} Records</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {b.reference && (
                              <a
                                href={b.reference}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                              >
                                <span>Reference Disclosure</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                            {b.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.04]">
                            <span className="text-[11px] font-semibold text-zinc-500 mr-1">Compromised:</span>
                            {b.dataExposed.map((d, dIdx) => (
                              <span key={dIdx} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-300">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'REMEDIATION' && (
                  <div className="space-y-3">
                    {result.remediation.map((rem, rIdx) => (
                      <div key={rIdx} className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08] flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          rem.level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white text-sm">{rem.title}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 uppercase">
                              {rem.level}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{rem.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {result.type === 'password' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Breach Occurrences</div>
                    <div className={`text-4xl font-grotesk font-bold ${result.pwned ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.leakCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 font-mono">
                      {result.pwned ? 'Compromised in Public Dumps' : 'Zero Breaches Detected'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Cryptographic Entropy</div>
                    <div className="text-4xl font-grotesk font-bold text-white">
                      {result.entropyBits} <span className="text-lg text-zinc-500 font-normal">bits</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 font-mono">
                      {result.entropyBits >= 60 ? 'Strong Entropy Pool' : 'Weak Predictability Pool'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Brute-Force Resistance</div>
                    <div className="text-2xl font-grotesk font-bold text-white">
                      {result.crackTimeEstimate}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 font-mono">
                      Estimated GPU Cluster Time
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                  <h3 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-red-400" />
                    <span>Cryptographic K-Anonymity Proof</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {result.analysis}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={result.hasUpper ? 'text-emerald-400' : 'text-zinc-600'}>●</span>
                      <span className="text-zinc-300">Uppercase Letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={result.hasLower ? 'text-emerald-400' : 'text-zinc-600'}>●</span>
                      <span className="text-zinc-300">Lowercase Letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={result.hasNumber ? 'text-emerald-400' : 'text-zinc-600'}>●</span>
                      <span className="text-zinc-300">Numeric Digits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={result.hasSpecial ? 'text-emerald-400' : 'text-zinc-600'}>●</span>
                      <span className="text-zinc-300">Special Symbols</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result.type === 'domain' && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Exposure Index</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-grotesk font-bold ${
                        result.exposureIndex > 60 ? 'text-red-400' : result.exposureIndex > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {result.exposureIndex}
                      </span>
                      <span className="text-xs text-zinc-500">/ 100</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 font-mono">
                      Security Rating: Grade <span className="font-bold text-white">{result.grade}</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Email Spoofing Risk</div>
                    <div className={`text-4xl font-grotesk font-bold ${
                      result.emailSecurity.spoofingRisk === 'HIGH' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {result.emailSecurity.spoofingRisk}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 font-mono">
                      DMARC Policy: {result.emailSecurity.dmarcEnforced ? 'Enforced' : 'Unenforced/None'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Known Major Breaches</div>
                    <div className="text-4xl font-grotesk font-bold text-white">
                      {result.historicalBreaches.length}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 font-mono">
                      Cataloged Incident Archives
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/[0.08]">
                  <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-400" />
                    <span>Anti-Impersonation & Phishing Defense (DMARC / SPF)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#14141B] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-300">SPF Record (Sender Policy Framework)</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          result.emailSecurity.hasSPF ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {result.emailSecurity.hasSPF ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <code className="text-[11px] font-mono text-zinc-400 break-all block">
                        {result.emailSecurity.spfPolicy}
                      </code>
                    </div>

                    <div className="p-4 rounded-xl bg-[#14141B] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-300">DMARC Policy Enforcement</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          result.emailSecurity.dmarcEnforced ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {result.emailSecurity.dmarcEnforced ? 'Enforced (p=reject/quarantine)' : 'Vulnerable to Spoofing'}
                        </span>
                      </div>
                      <code className="text-[11px] font-mono text-zinc-400 break-all block">
                        {result.emailSecurity.dmarcPolicy}
                      </code>
                    </div>
                  </div>
                </div>

                {result.historicalBreaches.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span>Historical Major Breach Incident</span>
                    </h3>

                    {result.historicalBreaches.map((hb, hIdx) => (
                      <div key={hIdx} className="p-6 rounded-2xl bg-[#0D0D12] border border-red-500/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-white text-base">{hb.title}</h4>
                          <span className="text-xs text-red-400 font-bold">{hb.records} Records Exposed</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{hb.description}</p>
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.06]">
                          <span className="text-[11px] font-semibold text-zinc-500 mr-1">Data Types:</span>
                          {hb.dataExposed.map((d, dIdx) => (
                            <span key={dIdx} className="px-2 py-0.5 rounded bg-red-600/10 border border-red-500/20 text-[11px] text-red-300">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hardening & Remediation Roadmap</span>
                  </h3>
                  {result.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="p-5 rounded-2xl bg-[#0D0D12] border border-white/[0.08] flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-400 font-bold text-xs">
                        {rIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            rec.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
                          }`}>
                            {rec.priority} PRIORITY
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
