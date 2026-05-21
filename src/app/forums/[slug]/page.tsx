"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CommentTree, { CATEGORY_COLORS, timeAgo } from "@/components/CommentTree";

interface ForumPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  locked: boolean;
  author: { id: string; username: string; role: string };
  commentCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [postLiked, setPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPost(data.post);
      setEditTitle(data.post.title);
      setEditContent(data.post.content);
      setEditCategory(data.post.category);
      setPostLikeCount(data.post.likeCount);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments);
    } catch {
      // silent
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const canEdit = post && session?.user?.id && (
    session.user.id === post.author.id || session.user.role === "ADMIN"
  );
  const isAdmin = session?.user?.role === "ADMIN";

  const handleSave = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent, category: editCategory }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Update failed" });
        return;
      }
      const data = await res.json();
      setPost((prev) => prev ? { ...prev, ...data.post } : null);
      setEditing(false);
      setMessage({ type: "success", text: "Post updated" });
    } catch {
      setMessage({ type: "error", text: "Failed to update" });
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Delete this post? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/posts/${post.slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
        return;
      }
      router.push("/forums");
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const handleTogglePin = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${post.slug}/pin`, { method: "POST" });
      const data = await res.json();
      setPost((prev) => prev ? { ...prev, pinned: data.pinned } : null);
    } catch {
      // silent
    }
  };

  const handleToggleLock = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${post.slug}/lock`, { method: "POST" });
      const data = await res.json();
      setPost((prev) => prev ? { ...prev, locked: data.locked } : null);
    } catch {
      // silent
    }
  };

  const handlePostLike = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${post.slug}/like`, { method: "POST" });
      const data = await res.json();
      setPostLiked(data.liked);
      setPostLikeCount(data.likeCount);
    } catch {
      // silent
    }
  };

  const handleCommentSubmit = async () => {
    setCommentError("");
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCommentError(data.error || "Failed to post comment");
        return;
      }
      setNewComment("");
      fetchComments();
    } catch {
      setCommentError("Network error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-text-secondary text-lg">Post not found</p>
          <Link href="/forums" className="text-accent-cyan hover:text-accent-pink mt-4 inline-block">
            &larr; Back to forums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/forums"
            className="inline-flex items-center gap-1 text-text-secondary text-sm hover:text-accent-cyan transition-colors mb-6"
          >
            &larr; Back to forums
          </Link>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {message.text}
              <button onClick={() => setMessage(null)} className="float-right">&times;</button>
            </div>
          )}

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8">
            {editing ? (
              <div className="space-y-4">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary text-xl font-bold focus:outline-none focus:border-accent-cyan/50"
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                >
                  {["General", "Game Requests", "Bug Reports", "Recommendations", "Mods", "Off-topic"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={handleSave} className="px-6 py-2 rounded-xl text-sm font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all">
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="px-6 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {post.pinned && (
                        <span className="text-[10px] font-medium text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded-full">
                          Pinned
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        CATEGORY_COLORS[post.category] || CATEGORY_COLORS["General"]
                      }`}>
                        {post.category}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                      {post.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-dark-bg border border-white/5 flex items-center justify-center text-[10px] font-medium">
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
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-4">
                  <button
                    onClick={handlePostLike}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      postLiked ? "text-accent-pink" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <svg className="w-4 h-4" fill={postLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {postLikeCount}
                  </button>
                </div>

                {canEdit && (
                  <div className="border-t border-white/5 pt-6 mt-6 flex flex-wrap gap-3">
                    <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl text-sm font-medium bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-all">
                      Edit
                    </button>
                    <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      Delete
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={handleTogglePin} className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-text-secondary hover:border-white/20 transition-all">
                          {post.pinned ? "Unpin" : "Pin"}
                        </button>
                        <button onClick={handleToggleLock} className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-text-secondary hover:border-white/20 transition-all">
                          {post.locked ? "Unlock" : "Lock"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Comments section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary mb-6">
              Comments ({post.commentCount})
            </h2>

            {post.locked ? (
              <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 text-center">
                <p className="text-text-secondary text-sm">This post is locked. New comments are disabled.</p>
              </div>
            ) : session ? (
              <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 mb-6">
                {commentError && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-sm border bg-red-500/10 border-red-500/20 text-red-400">
                    {commentError}
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleCommentSubmit}
                    className="px-6 py-2 rounded-xl text-sm font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.4)]"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 mb-6 text-center">
                <p className="text-text-secondary text-sm">
                  <Link href="/login" className="text-accent-cyan hover:text-accent-pink transition-colors">
                    Sign in
                  </Link>{" "}
                  to leave a comment
                </p>
              </div>
            )}

            {comments.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">
                No comments yet. Be the first to respond!
              </p>
            ) : (
              <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
                <CommentTree
                  comments={comments}
                  postId={post.id}
                  postSlug={post.slug}
                  onRefresh={fetchComments}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
