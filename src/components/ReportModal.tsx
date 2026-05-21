"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/types";

export default function ReportModal({
  open,
  onClose,
  gameId,
  postId,
}: {
  open: boolean;
  onClose: () => void;
  gameId?: string;
  postId?: string;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason) {
      setMessage({ type: "error", text: "Please select a reason" });
      return;
    }
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          description: description || null,
          gameId: gameId || null,
          postId: postId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to submit report" });
        setSubmitting(false);
        return;
      }

      setMessage({ type: "success", text: "Report submitted. Thank you." });
      setReason("");
      setDescription("");
      setTimeout(() => onClose(), 1500);
    } catch {
      setMessage({ type: "error", text: "Network error" });
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-text-primary">Report Content</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">
              Description <span className="text-text-secondary/60">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide any additional details..."
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-accent-cyan/50 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
