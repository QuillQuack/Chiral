"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ALL_TAGS = ["Safe Download", "Community Verified", "No Fake Installer", "Popular", "Trending"];

export default function UploadGamePage() {
  const { status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [coverData, setCoverData] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setCoverData(data);
      setCoverPreview(data);
    };
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags: selectedTags,
          rating,
          downloadCount,
          coverData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        setLoading(false);
        return;
      }

      router.push("/admin/games");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Upload New Game</h1>
          <Link
            href="/admin/games"
            className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all"
          >
            &larr; Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-secondary rounded-2xl border border-white/5 p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50"
              placeholder="Enter game title"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 resize-none"
              placeholder="Describe the game..."
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">Download Count</label>
              <input
                type="number"
                min="0"
                value={downloadCount}
                onChange={(e) => setDownloadCount(parseInt(e.target.value) || 0)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-3 rounded-xl text-sm font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all">
                Choose File
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-text-secondary text-xs">Max 5MB</span>
            </div>
            {coverPreview && (
              <div className="mt-4 relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
