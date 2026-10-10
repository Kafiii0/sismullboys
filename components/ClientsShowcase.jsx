'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const PARTNER_GROUPS = [
  {
    category: 'International & Global Entities',
    items: [
      {
        name: 'NASA',
        sub: 'National Aeronautics and Space Administration',
        logo: '/clients/nasa.png'
      },
      {
        name: 'Airbus',
        sub: 'Airbus Commercial & Defense Aerospace',
        logo: '/clients/airbus.svg'
      }
    ]
  },
  {
    category: 'National & Sovereign Government Entities',
    items: [
      {
        name: 'Supreme Court of Indonesia',
        sub: 'Mahkamah Agung Republik Indonesia',
        logo: '/clients/mahkamah_agung.png'
      },
      {
        name: 'Central Java Provincial Government',
        sub: 'Pemerintah Provinsi Jawa Tengah',
        logo: '/clients/jateng.png'
      },
      {
        name: 'North Sumatra Provincial Government',
        sub: 'Pemerintah Provinsi Sumatera Utara',
        logo: '/clients/sumut.png'
      }
    ]
  },
  {
    category: 'Academic & Advanced Research Universities',
    items: [
      {
        name: 'Caltech University',
        sub: 'California Institute of Technology',
        logo: '/clients/caltech.png'
      },
      {
        name: 'Telkom University',
        sub: 'Telkom University Indonesia',
        logo: '/clients/telkom_univ.png'
      },
      {
        name: 'University of North Sumatra',
        sub: 'Universitas Sumatera Utara (USU)',
        logo: '/clients/usu.png'
      }
    ]
  }
];

export default function ClientsShowcase() {
  const [activeTab, setActiveTab] = useState('ALL'); 

  const categories = [
    { id: 'ALL', label: 'All Partners' },
    { id: 'INTL', label: 'Global Aerospace & Defense' },
    { id: 'NAT', label: 'National Sovereign Entities' },
    { id: 'ACAD', label: 'Research Universities' }
  ];

  const filteredGroups = activeTab === 'ALL'
    ? PARTNER_GROUPS
    : activeTab === 'INTL'
    ? [PARTNER_GROUPS[0]]
    : activeTab === 'NAT'
    ? [PARTNER_GROUPS[1]]
    : [PARTNER_GROUPS[2]];

  return (
    <section className="py-24 bg-[#08080A] border-b border-white/[0.04] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/[0.05] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="font-grotesk text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Trusted by Sovereign Institutions, Global Entities, & Leading Universities
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            PT Terampil Profesional Sejahtera Abadi provides specialized offensive cybersecurity, adversarial penetration testing, and digital defense advisory to institutions of the highest national and global significance.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all tracking-wide ${
                activeTab === tab.id
                  ? 'bg-red-600/20 text-red-400 border border-red-500/40 shadow-[0_0_20px_rgba(220,38,38,0.2)] font-semibold'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-20">
          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-12">
              
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <div className="hidden sm:block h-px w-16 sm:w-28 lg:w-40 bg-gradient-to-r from-transparent via-white/10 to-white/20" />
                
                <div className="inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#111116] border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
                  <span className="text-[11px] sm:text-xs font-sans font-semibold tracking-[0.18em] text-zinc-300 uppercase">
                    {group.category}
                  </span>
                </div>

                <div className="hidden sm:block h-px w-16 sm:w-28 lg:w-40 bg-gradient-to-l from-transparent via-white/10 to-white/20" />
              </div>

              <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-16 lg:gap-24">
                {group.items.map((client, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    
                    <div className="h-24 sm:h-28 lg:h-32 flex items-center justify-center p-2">
                      <img
                        src={client.logo}
                        alt={`${client.name} official logo`}
                        className="max-h-24 sm:max-h-28 lg:max-h-32 max-w-[200px] sm:max-w-[240px] w-auto h-auto object-contain transition-all duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <h3 className="relative z-10 mt-4 text-sm sm:text-base font-semibold text-zinc-100 font-sans tracking-tight group-hover:text-red-400 transition-colors">
                      {client.name}
                    </h3>

                    <p className="relative z-10 text-xs text-zinc-400 font-sans mt-0.5 font-light max-w-[220px]">
                      {client.sub}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
