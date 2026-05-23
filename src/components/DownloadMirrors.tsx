"use client";

import { useState } from "react";
import type { DownloadMirror } from "@/types";

interface DownloadMirrorsProps {
  mirrors: DownloadMirror[];
}

export default function DownloadMirrors({ mirrors }: DownloadMirrorsProps) {
  const [confirmMirror, setConfirmMirror] = useState<DownloadMirror | null>(null);

  const handleOpen = (mirror: DownloadMirror) => {
    setConfirmMirror(mirror);
  };

  const handleConfirm = () => {
    if (!confirmMirror) return;
    window.open(confirmMirror.url, "_blank", "noopener,noreferrer");
    setConfirmMirror(null);
  };

  if (mirrors.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Download</h2>
        <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8 text-center">
          <p className="text-text-secondary text-sm mb-3">
            No download links available yet.
          </p>
          <p className="text-text-secondary/60 text-xs">
            Check back later or report this game to request a mirror.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Download</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mirrors.map((mirror) => (
          <div
            key={mirror.id}
            className="bg-dark-secondary rounded-2xl border border-white/5 p-5 hover:border-accent-cyan/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-semibold text-sm">{mirror.provider}</span>
                  {mirror.isOfficial && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-medium">
                      Official
                    </span>
                  )}
                </div>
                {mirror.fileSize && (
                  <p className="text-text-secondary text-xs">{mirror.fileSize}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {mirror.verifiedAt && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified {new Date(mirror.verifiedAt).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-text-secondary/60">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                External download
              </div>
            </div>

            <button
              onClick={() => handleOpen(mirror)}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.3)] transition-all"
            >
              Download from {mirror.provider}
            </button>
          </div>
        ))}
      </div>

      {confirmMirror && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold text-sm">External Download</h3>
                  <p className="text-text-secondary text-xs">{confirmMirror.provider}</p>
                </div>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                You are about to leave Chiral Downloads. This link opens an external site
                hosted by <strong className="text-text-primary">{confirmMirror.provider}</strong>.
                We do not control or endorse the content hosted there.
              </p>

              <div className="bg-dark-bg rounded-xl border border-white/5 p-3 mb-4">
                <p className="text-text-secondary text-xs truncate font-mono">{confirmMirror.url}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmMirror(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.3)] transition-all"
                >
                  Open {confirmMirror.provider}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
