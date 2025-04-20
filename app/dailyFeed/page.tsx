'use client';

import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

type SharedLink = {
  title?: string;
  url: string;
  text?: string;
  timestamp: string; // ISO format
};

export default function DailyFeed() {
  const [dailyLinks, setDailyLinks] = useState<SharedLink[]>([]);

  // Utility: Get today's date string (e.g. "2025-04-20")
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedLinks = JSON.parse(localStorage.getItem("sharedLinks") || "[]") as SharedLink[];

    // Filter only today's links
    const today = getTodayDate();
    const filtered = savedLinks.filter(link =>
      link.timestamp.startsWith(today)
    );

    setDailyLinks(filtered);

    // Cleanup: Remove old links from localStorage
    localStorage.setItem("sharedLinks", JSON.stringify(filtered));
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-4 flex flex-col justify-between">
        <main>
          <h1 className="text-3xl font-bold mb-4">📥 Daily Shared Links</h1>
          {dailyLinks.length > 0 ? (
            <ul className="space-y-4">
              {dailyLinks.map((link, i) => (
                <li key={i} className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">{link.title || "Untitled"}</p>
                  <p className="text-sm text-gray-400">{link.text}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline break-all"
                  >
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No links shared today.</p>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
