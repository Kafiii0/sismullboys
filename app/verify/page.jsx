'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function VerifyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/watermark?tab=verify');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07080B] flex items-center justify-center text-zinc-400">
      <div className="flex items-center gap-3 text-sm">
        <RefreshCw className="w-5 h-5 text-red-500 animate-spin" />
        <span>Membuka Halaman Cek Keaslian & Tamper Inspector...</span>
      </div>
    </div>
  );
}
