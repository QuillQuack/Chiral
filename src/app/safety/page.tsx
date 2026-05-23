"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Stat {
  label: string;
  value: number;
  color: string;
}

export default function SafetyPage() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Games Scanned", value: 0, color: "text-accent-cyan" },
    { label: "Verified Clean", value: 0, color: "text-green-400" },
    { label: "Pending Reports", value: 0, color: "text-yellow-400" },
    { label: "Flagged Content", value: 0, color: "text-red-400" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/games?limit=1").then((r) => r.json()),
      fetch("/api/reports?status=PENDING&limit=1").then((r) => r.json()).catch(() => ({ total: 0 })),
      fetch("/api/reports?status=FLAGGED&limit=1").then((r) => r.json()).catch(() => ({ total: 0 })),
    ])
      .then(([games, pending, flagged]) => {
        setStats([
          { label: "Games Scanned", value: games.total || 0, color: "text-accent-cyan" },
          { label: "Verified Clean", value: 0, color: "text-green-400" },
          { label: "Pending Reports", value: pending.total || 0, color: "text-yellow-400" },
          { label: "Flagged Content", value: flagged.total || 0, color: "text-red-400" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Safety Center</h1>
            <p className="text-text-secondary text-sm">
              Transparency reports, scan results, and community moderation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
                <p className="text-2xl font-bold text-text-primary mb-1">
                  {loading ? "..." : stat.value}
                </p>
                <p className={`text-xs font-medium ${stat.color}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Link
              href="/safety/reports"
              className="bg-dark-secondary rounded-2xl border border-white/5 p-6 hover:border-accent-cyan/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">
                    Report History
                  </h3>
                  <p className="text-xs text-text-secondary">Browse and manage community reports</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">About Safety Center</h2>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                Every game on Chiral Downloads includes SHA-256 checksums and MEGA download mirrors 
                for community verification. Community reports and moderation history are publicly visible.
              </p>
              <p>
                If you encounter suspicious content, use the <span className="text-accent-pink">Report</span> button on any game or forum post. 
                Reports are reviewed by admins, and enough reports will automatically flag content for priority review.
              </p>
              <p className="text-xs text-text-secondary/60">
                This is not a real security product. This is a satirical demonstration website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
