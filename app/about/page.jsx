import Navbar from '../../components/Navbar';
import About from '../../components/About';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'About Us | PT Terampil Profesional Sejahtera Abadi (PROMETHEUS)',
  description: 'Official corporate profile of PT Terampil Profesional Sejahtera Abadi, offensive security ethical commitments, regulatory compliance, and foundational service principles.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white pt-16">
      <Navbar />
      <About />
      <Footer />
    </main>
  );
}
