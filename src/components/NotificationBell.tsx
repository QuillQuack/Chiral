"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  actor: { id: string; username: string };
  postId: string | null;
  commentId: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications?unreadOnly=true");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifs();
    let interval: ReturnType<typeof setInterval> | null = null;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchNotifs();
        interval = setInterval(fetchNotifs, 90_000);
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const label = (n: Notification) => {
    switch (n.type) {
      case "post_reply":
        return <>replied to your post</>;
      case "comment_reply":
        return <>replied to your comment</>;
      case "like":
        return <>liked your post</>;
      default:
        return <>interacted with you</>;
    }
  };

  const href = (n: Notification) => {
    if (n.postId) return `/forums/${n.postId}`;
    return "#";
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-pink text-[9px] font-bold text-dark-bg flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent-cyan hover:text-accent-pink transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-text-secondary text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={href(n)}
                  onClick={() => { markRead(n.id); setOpen(false); }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <span className="w-7 h-7 rounded-full bg-dark-bg border border-white/5 flex items-center justify-center text-[10px] font-medium shrink-0">
                    {n.actor.username[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{n.actor.username}</span>{" "}
                      {label(n)}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
