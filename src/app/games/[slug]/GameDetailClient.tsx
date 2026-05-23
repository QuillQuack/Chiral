"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SafetyBadge from "@/components/SafetyBadge";
import ReportModal from "@/components/ReportModal";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import DownloadMirrors from "@/components/DownloadMirrors";
import type { GameData } from "@/types";

interface GameDetailClientProps {
  game: GameData;
}

export default function GameDetailClient({ game }: GameDetailClientProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [shaCopied, setShaCopied] = useState(false);

  const handleCopySha = () => {
    if (game.sha256) {
      navigator.clipboard.writeText(game.sha256);
      setShaCopied(true);
      setTimeout(() => setShaCopied(false), 2000);
    }
  };

  const sysReqs = game.systemRequirements;
  const hasSysReqs = sysReqs && (sysReqs.os || sysReqs.ram || sysReqs.gpu || sysReqs.storage || sysReqs.processor);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-text-secondary text-sm hover:text-accent-cyan transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to browse
          </Link>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 overflow-hidden">
            <div className="relative h-64 sm:h-80 lg:h-96 bg-dark-bg">
              {game.coverData ? (
                <Image
                  src={game.coverData}
                  alt={game.title}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-6xl opacity-20">?</div>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <SafetyBadge status={game.scanStatus} size="md" />
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                  {game.title}
                </h1>
                {game.shortSummary && (
                  <p className="text-text-secondary text-base leading-relaxed mb-4">
                    {game.shortSummary}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-yellow-400">{game.rating}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span>{(game.downloadCount / 1000).toFixed(1)}k downloads</span>
                  {game.releaseDate && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span>Released {new Date(game.releaseDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full font-medium border bg-accent-pink/10 text-accent-pink border-accent-pink/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-dark-bg rounded-2xl border border-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-primary">Safety & Trust</h2>
                  <button
                    onClick={() => setReportOpen(true)}
                    className="text-xs text-text-secondary hover:text-red-400 transition-colors"
                  >
                    Report
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Scan Status</p>
                    <SafetyBadge status={game.scanStatus} size="md" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Downloads</p>
                    <p className="text-text-primary text-sm font-medium">
                      {game.downloadCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Uploader</p>
                    <p className="text-text-primary text-sm font-medium">
                      {game.author?.username || "Unknown"}
                    </p>
                  </div>
                  {game.verifiedAt && (
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Last Verified</p>
                      <p className="text-text-primary text-sm font-medium">
                        {new Date(game.verifiedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {game.sha256 && (
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-text-secondary text-xs mb-2">SHA-256 Checksum</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-text-secondary/60 font-mono truncate bg-dark-secondary rounded-lg px-3 py-2 border border-white/5">
                        {game.sha256}
                      </code>
                      <button
                        onClick={handleCopySha}
                        className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
                      >
                        {shaCopied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {game.screenshots && game.screenshots.length > 0 && (
                <ScreenshotGallery screenshots={game.screenshots} />
              )}

              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
                <div className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
                  {game.description}
                </div>
              </div>

              {hasSysReqs && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">System Requirements</h2>
                  <div className="bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          { label: "OS", value: sysReqs.os },
                          { label: "Processor", value: sysReqs.processor },
                          { label: "RAM", value: sysReqs.ram },
                          { label: "GPU", value: sysReqs.gpu },
                          { label: "Storage", value: sysReqs.storage },
                        ].map(
                          (row) =>
                            row.value && (
                              <tr key={row.label} className="border-b border-white/5 last:border-0">
                                <td className="px-4 py-3 text-text-secondary w-32">{row.label}</td>
                                <td className="px-4 py-3 text-text-primary">{row.value}</td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {game.mirrors && (
                <DownloadMirrors mirrors={game.mirrors} />
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        gameId={game.id}
      />
    </div>
  );
}
