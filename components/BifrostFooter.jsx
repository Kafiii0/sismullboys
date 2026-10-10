import Link from 'next/link';

export default function BifrostFooter() {
  return (
    <footer className="bg-[#050507] border-t border-white/[0.06] text-zinc-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/[0.05]">
          
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-grotesk text-2xl font-extrabold tracking-tight text-white">
                BIFROST<span className="text-red-600">.</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Digital multimedia evidence manipulation and sanitization suite. Selective credential redaction, container telemetry purging, and cryptographic custody verification for judicial admissibility.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse"></span>
                Telkom University &bull; Sistem Multimedia (CBK2CAB3)
              </span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-200 font-mono">
              Tool Capabilities
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/redact" className="text-zinc-400 hover:text-white transition-colors">
                  Selective Credential Redactor
                </Link>
              </li>
              <li>
                <Link href="/redact" className="text-zinc-400 hover:text-white transition-colors">
                  EXIF & Hardware Stripper
                </Link>
              </li>
              <li>
                <Link href="/redact" className="text-zinc-400 hover:text-white transition-colors">
                  Video Temporal Masking
                </Link>
              </li>
              <li>
                <Link href="/#custody" className="text-zinc-400 hover:text-white transition-colors">
                  SHA-256 Custody Ledger
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-200 font-mono">
              Compliance & Evidentiary Standard
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Designed for compliance with ISO/IEC 27037 digital evidence guidelines and Indonesia Law No. 27/2022 (UU PDP) on Personal Data Protection during forensic disclosures.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-500">
              SHA-256 Digest Standard: WebCrypto API FIPS 180-4
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} BIFROST Forensic Multimedia. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/#how-it-works" className="hover:text-zinc-300 transition-colors">
              How It Works
            </Link>
            <Link href="/redact" className="hover:text-zinc-300 transition-colors">
              Studio
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="font-mono text-zinc-500">v2.4.0-forensic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
