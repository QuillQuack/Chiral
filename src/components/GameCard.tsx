"use client";

import { useState } from "react";
import { GameData } from "@/types";
import Image from "next/image";
import SafetyBadge from "./SafetyBadge";
import ReportModal from "./ReportModal";

interface GameCardProps {
  game: GameData;
}

export default function GameCard({ game }: GameCardProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <div className="group relative bg-dark-secondary rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-accent-pink/40 hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.3)] hover:-translate-y-1">
        <div className="relative h-48 bg-dark-bg flex items-center justify-center overflow-hidden">
          {game.coverData ? (
            <Image
              src={game.coverData}
              alt={game.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2 opacity-40">🎮</div>
              <div className="text-white/20 text-xs font-mono">no-cover.exe</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-secondary via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-3 right-3">
            <SafetyBadge status={game.scanStatus} />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-text-primary font-semibold text-lg leading-tight group-hover:text-accent-cyan transition-colors">
              {game.title}
            </h3>
            <div className="flex items-center gap-1 text-yellow-400 text-sm shrink-0 ml-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">{game.rating}</span>
            </div>
          </div>

          <p className="text-text-secondary text-sm mb-4 line-clamp-2">
            {game.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    tag === "Safe Download"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : tag === "Community Verified"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : tag === "No Fake Installer"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "bg-accent-pink/10 text-accent-pink border border-accent-pink/20"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-text-secondary text-xs">
              {(game.downloadCount / 1000).toFixed(1)}k downloads
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReportOpen(true)}
                className="text-xs text-text-secondary hover:text-red-400 transition-colors"
              >
                Report
              </button>
              <button className="text-xs font-medium text-accent-cyan hover:text-accent-pink transition-colors">
                Download →
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        gameId={game.id}
      />
    </>
  );
}
