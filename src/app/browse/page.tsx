"use client";

import { useEffect, useState, useMemo } from "react";
import { GameData } from "@/types";
import GameCard from "@/components/GameCard";
import Navbar from "@/components/Navbar";

const ALL_TAGS = ["2D", "3D", "Interspecies Sex", "Visual Novel", "JRPG", "Action", "Adventure", "Puzzle", "Simulation", "RPG", "Strategy", "Sandbox", "Horror", "Dating Sim", "Management", "Comedy"];

function debounce<T extends (...args: string[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function BrowsePage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (selectedTags.length === 1) params.set("tag", selectedTags[0]);
    if (search) params.set("search", search);

    fetch(`/api/games?${params}`)
      .then((r) => r.json())
      .then((data) => setGames(data.games))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [sort, selectedTags, search]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [tag]
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Browse Games
          </h1>
          <p className="text-text-secondary text-sm">
            {loading ? "Loading..." : `${games.length} game${games.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="bg-dark-secondary rounded-2xl border border-white/5 p-4 sm:p-6 mb-8 space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search games..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full bg-dark-bg border border-white/10 rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-accent-pink/10 text-accent-pink border-accent-pink/30"
                      : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sm:ml-auto bg-dark-bg border border-white/10 rounded-xl px-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
            >
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>
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
        ) : games.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 opacity-30">🔍</div>
            <p className="text-text-secondary text-lg">No games match your filters</p>
            <p className="text-text-secondary text-sm mt-2">
              Try a different search or clear the filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
