import './globals.css';

export const metadata = {
  title: 'BIFROST - Forensic Multimedia Evidence Sanitization & Redaction Suite',
  description: 'Forensic multimedia evidence manipulation, selective credential redaction (NIK, financial PII), container EXIF/GPS telemetry stripping, and cryptographic chain-of-custody verification. Telkom University - Sistem Multimedia (CBK2CAB3).',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#08080C] text-zinc-100 font-sans antialiased selection:bg-red-600/30 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
