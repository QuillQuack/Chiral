"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { REPORT_STATUSES } from "@/types";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; username: string };
  reviewer: { id: string; username: string } | null;
  game: { id: string; title: string } | null;
  post: { id: string; title: string } | null;
}

const REASON_COLORS: Record<string, string> = {
  MALWARE: "text-red-400 bg-red-500/10",
  FAKE_DOWNLOAD: "text-orange-400 bg-orange-500/10",
  BROKEN_LINK: "text-yellow-400 bg-yellow-500/10",
  MISLEADING_CONTENT: "text-purple-400 bg-purple-500/10",
  SPAM: "text-pink-400 bg-pink-500/10",
  COPYRIGHT: "text-blue-400 bg-blue-500/10",
  OTHER: "text-text-secondary bg-white/5",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-500/10",
  FLAGGED: "text-red-400 bg-red-500/10",
  REVIEWED: "text-green-400 bg-green-500/10",
  DISMISSED: "text-text-secondary bg-white/5",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    const res = await fetch(`/api/reports?${params}`);
    if (!res.ok) { setReports([]); setLoading(false); return; }
    const data = await res.json();
    setReports(data.reports || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
              <p className="text-text-secondary text-sm mt-1">{reports.length} reports</p>
            </div>
            <Link href="/safety" className="text-sm text-accent-cyan hover:text-accent-pink transition-colors">
              &larr; Safety Center
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setStatusFilter("")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                !statusFilter
                  ? "bg-accent-pink/10 text-accent-pink border-accent-pink/30"
                  : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
              }`}
            >
              All
            </button>
            {REPORT_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                  statusFilter === s
                    ? `${STATUS_COLORS[s]} border-current`
                    : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-dark-secondary rounded-2xl border border-white/5 p-5 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary">No reports found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/safety/reports/${report.id}`}
                  className="block bg-dark-secondary rounded-2xl border border-white/5 p-5 hover:border-accent-cyan/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${REASON_COLORS[report.reason] || REASON_COLORS.OTHER}`}>
                        {report.reason}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[report.status]}`}>
                        {report.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-secondary">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span>by {report.reporter.username}</span>
                    {report.game && <span>Game: {report.game.title}</span>}
                    {report.post && <span>Post: {report.post.title}</span>}
                  </div>
                  {report.description && (
                    <p className="text-text-secondary text-sm mt-2 line-clamp-2">{report.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium ${
                    p === page ? "bg-accent-pink/10 text-accent-pink border border-accent-pink/30" : "text-text-secondary bg-white/5 border border-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
