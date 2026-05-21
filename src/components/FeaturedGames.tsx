"use client";

import { useEffect, useState } from "react";
import { Game } from "@/types";
import GameCard from "./GameCard";

export default function FeaturedGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => {
        setGames(data.games);
        setLoading(false);
      });
  }, []);

  return (
    <section id="featured-games" className="relative z-10 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-accent-pink text-xs font-medium tracking-widest uppercase mb-4 block">
            Curated Selection
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Featured Games
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Every title on this page has been carefully inspected by our team of
            professional skeptics.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-dark-secondary rounded-2xl border border-white/5 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
