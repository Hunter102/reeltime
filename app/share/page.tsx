// app/share/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SharePage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const url = searchParams.get('url');

    if (url) {
      const newLink = {
        title,
        text,
        url,
        timestamp: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem('sharedLinks') || '[]');
      localStorage.setItem('sharedLinks', JSON.stringify([...existing, newLink]));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <p className="text-xl text-center px-4">✅ Link received and saved!</p>
      <p className="text-sm mt-2 text-gray-400">You can view it in your Daily Feed.</p>
    </div>
  );
}
