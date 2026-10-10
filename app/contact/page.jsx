import Navbar from '../../components/Navbar';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Contact Us & Schedule Pentest | PT Terampil Profesional Sejahtera Abadi',
  description: 'Consult confidentially on your enterprise cybersecurity assessment and penetration testing requirements with senior consultants at PT Terampil Profesional Sejahtera Abadi.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#08080A] text-zinc-100 selection:bg-red-600/30 selection:text-white pt-16">
      <Navbar />
      <Contact />
      <Footer />
    </main>
  );
}
