import Navbar from '../../components/Navbar';
import Services from '../../components/Services';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Penetration Testing Services | PT Terampil Profesional Sejahtera Abadi',
  description: 'Full-scope professional offensive cybersecurity services: Web & API, iOS/Android Mobile Applications, Corporate Network & Active Directory Audits, Cloud Security Architecture, and Adversary Simulation (Red Teaming).',
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white pt-16">
      <Navbar />
      <Services />
      <Footer />
    </main>
  );
}
