"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { CATEGORIES, CATEGORY_COLORS, timeAgo } from "@/components/CommentTree";

interface PostAuthor {
  id: string;
  username: string;
  role: string;
}

interface ForumPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  author: PostAuthor;
  commentCount: number;
  likeCount: number;
  createdAt: string;
}

export default function ForumsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedSearch = useCallback((value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "15");

    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => { setPosts([]); setTotalPages(1); })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  const pinnedPosts = posts.filter((p) => p.pinned);
  const normalPosts = posts.filter((p) => !p.pinned);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Forums</h1>
              <p className="text-text-secondary text-sm mt-1">
                {loading ? "Loading..." : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {session && (
              <Link
                href="/forums/new"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.4)]"
              >
                + New Post
              </Link>
            )}
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-4 sm:p-6 mb-8 space-y-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/40"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                  !category
                    ? "bg-accent-pink/10 text-accent-pink border-accent-pink/30"
                    : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                    category === cat
                      ? CATEGORY_COLORS[cat]
                      : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-dark-bg border border-white/10 rounded-xl px-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-dark-secondary rounded-2xl border border-white/5 p-6 animate-pulse">
                  <div className="h-5 bg-white/5 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/5 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-white/5 rounded w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4 opacity-30">💬</div>
              <p className="text-text-secondary text-lg mb-2">No posts yet</p>
              <p className="text-text-secondary text-sm mb-6">
                {search || category ? "Try different filters" : "The forums are empty. Someone start a conversation!"}
              </p>
              {session ? (
                <Link href="/forums/new" className="inline-block px-6 py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan">
                  Create First Post
                </Link>
              ) : (
                <Link href="/login" className="inline-block px-6 py-3 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan">
                  Sign in to Post
                </Link>
              )}
            </div>
          ) : (
            <>
              {pinnedPosts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    Pinned
                  </h2>
                  <div className="space-y-3">
                    {pinnedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                  {normalPosts.length > 0 && (
                    <div className="border-t border-white/5 mt-6 pt-6">
                      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                        Recent Discussions
                      </h2>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {normalPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        p === page
                          ? "bg-accent-pink/10 text-accent-pink border border-accent-pink/30"
                          : "text-text-secondary bg-white/5 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: ForumPost }) {
  return (
    <Link
      key={post.id}
      href={`/forums/${post.slug}`}
      className="block bg-dark-secondary rounded-2xl border border-white/5 p-6 transition-all duration-300 hover:border-accent-cyan/20 hover:shadow-[0_0_20px_-5px_rgba(110,231,255,0.1)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {post.pinned && (
            <span className="text-[10px] font-medium text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded-full">
              Pinned
            </span>
          )}
          <h2 className="text-lg font-semibold text-text-primary hover:text-accent-cyan transition-colors">
            {post.title}
          </h2>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 ml-2 ${
          CATEGORY_COLORS[post.category] || CATEGORY_COLORS["General"]
        }`}>
          {post.category}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="w-5 h-5 rounded-full bg-dark-bg border border-white/5 flex items-center justify-center text-[10px] font-medium">
            {post.author.username[0].toUpperCase()}
          </span>
          {post.author.username}
        </span>
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
          post.author.role === "ADMIN"
            ? "bg-accent-pink/10 text-accent-pink"
            : "bg-accent-cyan/10 text-accent-cyan"
        }`}>
          {post.author.role}
        </span>
        <span>{timeAgo(post.createdAt)}</span>
      </div>
      <p className="text-text-secondary text-sm line-clamp-2 mb-3">
        {post.content}
      </p>
      <div className="flex items-center gap-4 text-text-secondary text-xs">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.commentCount}
        </span>
      </div>
    </Link>
  );
}
