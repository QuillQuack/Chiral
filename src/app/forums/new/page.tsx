"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CATEGORIES } from "@/components/CommentTree";

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create post");
        setLoading(false);
        return;
      }

      const data = await res.json();
      router.push(`/forums/${data.post.slug}`);
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
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-text-primary">New Post</h1>
            <Link
              href="/forums"
              className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all"
            >
              &larr; Forums
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
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 resize-none"
                placeholder="Write something (probably not malware)..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50"
              >
                {loading ? "Posting..." : "Create Post"}
              </button>
              <Link
                href="/forums"
                className="px-6 py-3 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
