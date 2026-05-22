"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import SafetyBadge from "@/components/SafetyBadge";
import { GameData } from "@/types";

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Game not found");
        return r.json();
      })
      .then((data) => setGame(data.game))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/5 rounded w-1/3" />
            <div className="h-64 bg-white/5 rounded-xl" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto text-center">
          <p className="text-text-secondary text-lg">{error || "Game not found"}</p>
          <Link href="/browse" className="text-accent-cyan hover:underline mt-4 inline-block">
            &larr; Back to browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <Link href="/browse" className="text-text-secondary text-sm hover:text-accent-cyan transition-colors mb-6 inline-block">
          &larr; Back to browse
        </Link>

        <div className="bg-dark-secondary rounded-2xl border border-white/5 overflow-hidden">
          <div className="relative h-64 sm:h-80 bg-dark-bg">
            {game.coverData ? (
              <Image
                src={game.coverData}
                alt={game.title}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-6xl opacity-30">🎮</div>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <SafetyBadge status={game.scanStatus} />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">{game.title}</h1>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-yellow-400">{game.rating}</span>
                  </div>
                  <span>{(game.downloadCount / 1000).toFixed(1)}k downloads</span>
                </div>
              </div>

              <a
                href={`/api/games/${game.id}/download`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] transition-all shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full font-medium border bg-accent-pink/10 text-accent-pink border-accent-pink/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{game.description}</p>
            </div>

            {game.sha256 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-text-secondary/40 font-mono break-all">
                  SHA-256: {game.sha256}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
