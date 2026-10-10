import Navbar from '../../components/Navbar';
import VulnTracker from '../../components/VulnTracker';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'VulnTracker™ Platform | PT Terampil Profesional Sejahtera Abadi',
  description: 'PROMETHEUS VulnTracker™ collaborative client portal for real-time remediation tracking, developer fix guidelines, 1-click retesting, and official security attestation issuance.',
};

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white pt-16">
      <Navbar />
      <VulnTracker />
      <Footer />
    </main>
  );
}
