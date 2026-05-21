"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameData } from "@/types";

export default function AdminGamesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", tags: "", rating: 0, downloadCount: 0 });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchGames = () => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => {
        setGames(data.games);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load games" });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchGames();
  }, [status, router]);

  const handleEdit = (game: GameData) => {
    setEditingId(game.id);
    setEditForm({
      title: game.title,
      description: game.description,
      tags: game.tags.join(", "),
      rating: game.rating,
      downloadCount: game.downloadCount,
    });
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Update failed" });
        return;
      }

      setEditingId(null);
      fetchGames();
      setMessage({ type: "success", text: "Game updated" });
    } catch {
      setMessage({ type: "error", text: "Failed to update game" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
        return;
      }

      setGames((prev) => prev.filter((g) => g.id !== id));
      setMessage({ type: "success", text: "Game deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete game" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Manage Games</h1>
            <p className="text-text-secondary text-sm mt-1">
              {games.length} game{games.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all"
            >
              &larr; Admin
            </Link>
            <Link
              href="/admin/games/new"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.4)]"
            >
              + New Game
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right">&times;</button>
          </div>
        )}

        <div className="bg-dark-secondary rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Title</th>
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Tags</th>
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Rating</th>
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Downloads</th>
                  <th className="text-right px-6 py-4 text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    {editingId === game.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.title}
                            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.tags}
                            onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                            placeholder="comma, separated"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.1"
                            value={editForm.rating}
                            onChange={(e) => setEditForm((f) => ({ ...f, rating: parseFloat(e.target.value) || 0 }))}
                            className="w-20 bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.downloadCount}
                            onChange={(e) => setEditForm((f) => ({ ...f, downloadCount: parseInt(e.target.value) || 0 }))}
                            className="w-24 bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                          />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleSave(game.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-secondary hover:text-text-primary">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-text-primary font-medium">{game.title}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {game.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-secondary">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{game.rating}</td>
                        <td className="px-6 py-4 text-text-secondary">{(game.downloadCount / 1000).toFixed(1)}k</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleEdit(game)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20">Edit</button>
                          <button onClick={() => handleDelete(game.id, game.title)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {games.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No games yet. <Link href="/admin/games/new" className="text-accent-cyan hover:text-accent-pink">Upload one</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
