'use client';

export default function MuninnNavbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'studio', label: '1. Akuisisi & Redaksi' },
    { id: 'compression', label: '2. Kompresi DCT' },
    { id: 'security', label: '3. Keamanan & Watermark' },
    { id: 'distribution', label: '4. Distribusi & Player' },
    { id: 'team', label: 'Info Tim' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0E0F14] border-b border-zinc-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-sm font-mono">
            M
          </div>
          <div>
            <div className="font-bold text-white text-base font-mono tracking-tight flex items-center gap-2">
              MUNINN
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-700/40 px-1.5 py-0.5 rounded">
                Sistem Multimedia
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Pipeline Bukti Digital · CBK2CAB3 Telkom University
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ' +
                  (active ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-zinc-800')
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
