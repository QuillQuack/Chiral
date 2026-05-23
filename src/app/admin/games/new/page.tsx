"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";

const ALL_TAGS = ["2D", "3D", "Interspecies Sex", "Visual Novel", "JRPG", "Action", "Adventure", "Puzzle", "Simulation", "RPG", "Strategy", "Sandbox", "Horror", "Dating Sim", "Management", "Comedy"];

export default function UploadGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverData, setCoverData] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [mirrorUrl, setMirrorUrl] = useState("");
  const [mirrorFileSize, setMirrorFileSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !isAdmin(session?.user?.role || "")) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          shortSummary: shortSummary || null,
          description,
          tags: selectedTags,
          coverData,
          mirrorUrl: mirrorUrl.trim() || null,
          mirrorFileSize: mirrorFileSize.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        setLoading(false);
        return;
      }

      router.push("/admin/games");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
            <label className="block text-text-secondary text-sm font-medium mb-2">Short Summary</label>
            <input
              value={shortSummary}
              onChange={(e) => setShortSummary(e.target.value)}
              maxLength={300}
              placeholder="Brief description for the hero section"
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50"
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

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-3 rounded-xl text-sm font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all">
                Choose File
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
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

          <div className="border-t border-white/5 pt-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Download Mirror (MEGA)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">MEGA URL</label>
                <input
                  value={mirrorUrl}
                  onChange={(e) => setMirrorUrl(e.target.value)}
                  placeholder="https://mega.nz/file/..."
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">File Size (optional)</label>
                <input
                  value={mirrorFileSize}
                  onChange={(e) => setMirrorFileSize(e.target.value)}
                  placeholder="e.g. 4.2 GB"
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
