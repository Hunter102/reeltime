'use client';

import { useEffect } from 'react';

export default function SharePage() {
  useEffect(() => {
    // Get the shared content parameters (title, text, and url)
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const text = params.get('text');
    const url = params.get('url');

    // If there's a URL, save it to localStorage (or handle it in any other way)
    if (url) {
      const newLink = {
        title,
        text,
        url,
        timestamp: new Date().toISOString(),
      };

      // Retrieve existing shared links from localStorage (if any)
      const existing = JSON.parse(localStorage.getItem('sharedLinks') || '[]');
      
      // Save the new link to localStorage
      localStorage.setItem('sharedLinks', JSON.stringify([...existing, newLink]));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <p className="text-xl text-center px-4">✅ Link received and saved!</p>
      <p className="text-sm mt-2 text-gray-400">You can view it in your Daily Feed.</p>
    </div>
  );
}
