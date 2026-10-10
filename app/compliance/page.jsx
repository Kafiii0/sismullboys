import Navbar from '../../components/Navbar';
import ComplianceLegal from '../../components/ComplianceLegal';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Legal Assurances & Compliance | PT Terampil Profesional Sejahtera Abadi',
  description: 'Offensive penetration testing legal assurances: Bilateral Mutual NDA, Authorization to Test (RoE), 30-day complimentary retest guarantee, and regulatory alignment.',
};

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white pt-16">
      <Navbar />
      <ComplianceLegal />
      <Footer />
    </main>
  );
}
