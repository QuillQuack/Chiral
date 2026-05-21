"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface CommentAuthor {
  id: string;
  username: string;
  role: string;
}

interface CommentNode {
  id: string;
  content: string | null;
  deleted: boolean;
  edited: boolean;
  createdAt: string;
  editedAt: string | null;
  author: CommentAuthor;
  likeCount: number;
  replies: CommentNode[];
}

const CATEGORIES = ["General", "Game Requests", "Bug Reports", "Recommendations", "Mods", "Off-topic"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "General": "bg-white/5 text-text-secondary border-white/10",
  "Game Requests": "bg-accent-pink/10 text-accent-pink border-accent-pink/30",
  "Bug Reports": "bg-red-500/10 text-red-400 border-red-500/20",
  "Recommendations": "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  "Mods": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Off-topic": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export { CATEGORIES, CATEGORY_COLORS, timeAgo };

export default function CommentTree({
  comments,
  postId,
  postSlug,
  depth = 0,
  onRefresh,
}: {
  comments: CommentNode[];
  postId: string;
  postSlug: string;
  depth?: number;
  onRefresh: () => void;
}) {
  const { data: session } = useSession();

  if (depth >= 3) return null;

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-white/5" : ""}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          postSlug={postSlug}
          depth={depth}
          onRefresh={onRefresh}
          session={session}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  postSlug,
  depth,
  onRefresh,
  session,
}: {
  comment: CommentNode;
  postId: string;
  postSlug: string;
  depth: number;
  onRefresh: () => void;
  session: any;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isOwner = session?.user?.id === comment.author?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const canModerate = isOwner || isAdmin;

  const canEdit = isOwner && !comment.deleted && (Date.now() - new Date(comment.createdAt).getTime() < 30 * 60 * 1000);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Edit failed" });
        return;
      }
      setEditing(false);
      onRefresh();
    } catch {
      setMessage({ type: "error", text: "Edit failed" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
        return;
      }
      onRefresh();
    } catch {
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId: comment.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Reply failed" });
        return;
      }
      setReplyContent("");
      setReplying(false);
      onRefresh();
    } catch {
      setMessage({ type: "error", text: "Reply failed" });
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      // silent
    }
  };

  return (
    <div className="py-4">
      {message && (
        <div className={`mb-3 px-3 py-2 rounded-lg text-xs border ${
          message.type === "success"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right">&times;</button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-dark-bg border border-white/5 flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
          {comment.author?.username?.[0]?.toUpperCase() || "?"}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-text-primary">
              {comment.deleted ? "[deleted]" : comment.author?.username || "unknown"}
            </span>
            {!comment.deleted && comment.author?.role === "ADMIN" && (
              <span className="px-1 py-0.5 rounded-full text-[9px] font-medium bg-accent-pink/10 text-accent-pink">
                ADMIN
              </span>
            )}
            <span className="text-[10px] text-text-secondary">
              {timeAgo(comment.createdAt)}
            </span>
            {comment.edited && (
              <span className="text-[10px] text-text-secondary/60">
                Edited {comment.editedAt ? timeAgo(comment.editedAt) : ""}
              </span>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 rounded-lg text-xs text-text-secondary bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : comment.deleted ? (
            <p className="text-text-secondary/40 text-sm italic">[deleted]</p>
          ) : (
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {!comment.deleted && (
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  liked ? "text-accent-pink" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount}
              </button>

              {session && depth < 2 && (
                <button
                  onClick={() => setReplying(!replying)}
                  className="text-xs text-text-secondary hover:text-accent-cyan transition-colors"
                >
                  Reply
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => { setEditing(true); setEditContent(comment.content || ""); }}
                  className="text-xs text-text-secondary hover:text-accent-cyan transition-colors"
                >
                  Edit
                </button>
              )}

              {canModerate && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-text-secondary hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {replying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                placeholder="Write a reply..."
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-accent-pink to-accent-cyan text-dark-bg"
                >
                  Reply
                </button>
                <button
                  onClick={() => setReplying(false)}
                  className="px-3 py-1 rounded-lg text-xs text-text-secondary bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <CommentTree
          comments={comment.replies}
          postId={postId}
          postSlug={postSlug}
          depth={depth + 1}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
