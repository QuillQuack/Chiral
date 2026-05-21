"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { REPORT_REASONS, REPORT_STATUSES } from "@/types";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reporter: { id: string; username: string };
  reviewer: { id: string; username: string } | null;
  game: { id: string; title: string } | null;
  post: { id: string; slug: string; title: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-500/10",
  FLAGGED: "text-red-400 bg-red-500/10",
  REVIEWED: "text-green-400 bg-green-500/10",
  DISMISSED: "text-text-secondary bg-white/5",
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setReport(d.report))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    setMessage("");
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { setMessage("Failed to update"); return; }
      const d = await res.json();
      setReport(d.report);
      setMessage("Report updated");
    } catch {
      setMessage("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-text-secondary">Report not found</p>
          <Link href="/safety/reports" className="text-accent-cyan hover:text-accent-pink mt-4 inline-block">&larr; Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/safety/reports" className="inline-flex items-center gap-1 text-text-secondary text-sm hover:text-accent-cyan transition-colors mb-6">
            &larr; Back to reports
          </Link>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
              message === "Report updated"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {message}
            </div>
          )}

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent-pink/10 text-accent-pink">
                    {report.reason}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[report.status]}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  Reported by {report.reporter.username} on {new Date(report.createdAt).toLocaleString()}
                </p>
                {report.reviewedAt && report.reviewer && (
                  <p className="text-xs text-text-secondary mt-1">
                    Reviewed by {report.reviewer.username} on {new Date(report.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {report.description && (
              <div className="border-t border-white/5 pt-6 mb-6">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Description</h3>
                <p className="text-text-primary text-sm whitespace-pre-wrap">{report.description}</p>
              </div>
            )}

            <div className="border-t border-white/5 pt-6 mb-6">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Target</h3>
              {report.game ? (
                <p className="text-sm text-accent-cyan">{report.game.title}</p>
              ) : report.post ? (
                <p className="text-sm text-accent-cyan">{report.post.title}</p>
              ) : (
                <p className="text-sm text-text-secondary">Unknown</p>
              )}
            </div>

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {["PENDING", "FLAGGED", "REVIEWED", "DISMISSED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={s === report.status}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                      s === report.status
                        ? "bg-white/5 text-text-secondary border border-white/10"
                        : s === "DISMISSED"
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : s === "REVIEWED"
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20"
                    }`}
                  >
                    {s === report.status ? `Current: ${s}` : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
