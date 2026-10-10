'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2, Shield } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'Web & API Penetration Testing',
    scope: '',
    requireNdaFirst: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const services = [
    'Web & API Penetration Testing (Web & API Pentest)',
    'Mobile Application Security Assessment (iOS & Android)',
    'Internal Corporate Network & Active Directory Audit',
    'Cloud Security Assessment (AWS / GCP / Azure)',
    'Full-Scope Adversary Simulation (Red Teaming)',
    'Enterprise Full-Spectrum Cybersecurity Audit'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generated = `PRM-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketResult(generated);
      setIsSubmitting(false);
    }, 900);
  };

  return (
    <section id="contact" className="py-24 bg-[#08080A] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Consult on Your Organization's Cybersecurity Requirements
          </h2>
          <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
            Initiate a confidential security dialogue with our team. We formulate tailored assessment scopes and provide bilateral Non-Disclosure Agreement (NDA) drafts within 2 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/10 space-y-3">
              <div className="text-zinc-400 font-sans text-xs font-semibold uppercase tracking-wider pb-2 border-b border-white/5">
                Strict Data Confidentiality
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                Every target parameter, architecture schema, and scoping note you submit is strictly safeguarded under bilateral non-disclosure provisions.
              </p>

              <div className="flex items-center gap-2 text-xs font-medium text-red-400 pt-1">
                <Shield className="w-4 h-4 text-red-500" />
                <span>Response SLA: Within 2 Business Hours</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/10 space-y-4 text-xs font-sans">
              <div className="text-zinc-400 uppercase text-xs font-semibold tracking-wider pb-2 border-b border-white/5">
                Corporate Headquarters & Inquiries
              </div>

              <div className="space-y-3.5 font-light">
                <div className="flex items-start gap-3 text-zinc-300">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Headquarters:</strong>
                    <span className="text-zinc-400">
                      Cyber Green Park Tower, 14th Fl., Integrated Technology & Industrial Corridor, Indonesia.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-300">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Official Desk:</span>
                    <a href="mailto:audit@prometheus.co.id" className="text-white hover:text-red-400 font-medium">
                      audit@prometheus.co.id / desk@prometheus.co.id
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-300">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <span className="text-zinc-400 block text-[11px]">24/7 Security Hotline:</span>
                    <span className="text-white font-medium">+62 (22) 8739-2044 / +62 811-9872-PRM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0D11] border border-white/10">
              
              {ticketResult ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white font-sans">
                    Consultation Request Successfully Transmitted
                  </h3>

                  <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed font-light">
                    Thank you for contacting <strong className="text-white font-medium">PT Terampil Profesional Sejahtera Abadi</strong>. Your inquiry has been registered with reference ID:
                  </p>

                  <div className="p-3 bg-[#141418] rounded-full border border-white/15 inline-block font-mono text-xs font-bold text-white px-5">
                    REF ID: {ticketResult}
                  </div>

                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto font-light">
                    Our lead security consultant will contact your corporate email with a mutual NDA draft within 2 business hours.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => setTicketResult(null)}
                      className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                  <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Confidential Security Assessment Inquiry
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Encrypted & Protected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Full Name & Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe, VP of Engineering"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-white/10 focus:border-red-500 focus:outline-none text-white text-xs placeholder:text-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@organization.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-white/10 focus:border-red-500 focus:outline-none text-white text-xs placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Organization / Enterprise Entity *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company or Institution Name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-white/10 focus:border-red-500 focus:outline-none text-white text-xs placeholder:text-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Primary Scope of Interest *
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-white/10 focus:border-red-500 focus:outline-none text-white text-xs"
                      >
                        {services.map((s, idx) => (
                          <option key={idx} value={s} className="bg-[#141418] text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Target System Description or Scope Overview *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      placeholder="Briefly describe targets (e.g., 2 single-page web apps, 1 mobile app, 15 API endpoints, target assessment timeline)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-white/10 focus:border-red-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 leading-relaxed font-light"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300 font-light">
                      <input
                        type="checkbox"
                        checked={formData.requireNdaFirst}
                        onChange={(e) => setFormData({ ...formData, requireNdaFirst: e.target.checked })}
                        className="rounded border-white/10 bg-[#141418] text-red-600 focus:ring-0"
                      />
                      <span>Provide bilateral Mutual NDA draft prior to exchanging sensitive technical parameters.</span>
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? 'Transmitting Request...' : 'Submit Consultation Request'}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-zinc-500 font-light pt-1">
                    All communications are strictly protected under corporate non-disclosure covenants and statutory privacy regulations.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
