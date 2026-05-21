"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ email: "", username: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin/users")
        .then((res) => {
          if (res.status === 403) router.push("/");
          return res.json();
        })
        .then((data) => setUsers(data.users || []))
        .catch(() => setMessage({ type: "error", text: "Failed to load users" }))
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ email: user.email, username: user.username });
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Update failed" });
        return;
      }

      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? data.user : u))
      );
      setEditingId(null);
      setMessage({ type: "success", text: "User updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to update user" });
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete "${username}"? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMessage({ type: "success", text: "User deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete user" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-text-secondary text-sm mt-1">
              Total users: {users.length} (and counting, somehow)
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all"
          >
            &larr; Home
          </Link>
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
            <button
              onClick={() => setMessage(null)}
              className="float-right text-current opacity-60 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        <div className="bg-dark-secondary rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Username</th>
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Email</th>
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Role</th>
                  <th className="text-left px-6 py-4 text-text-secondary font-medium">Created</th>
                  <th className="text-right px-6 py-4 text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {editingId === user.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.username}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, username: e.target.value }))
                            }
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, email: e.target.value }))
                            }
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-secondary text-xs bg-white/5 px-2 py-1 rounded-full">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleSave(user.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              user.role === "ADMIN"
                                ? "bg-accent-pink/10 text-accent-pink border border-accent-pink/20"
                                : "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No users found. Is the database running?
            </div>
          )}
        </div>

        <p className="text-text-secondary/40 text-xs text-center mt-4">
          Error 403: Your clearance level is &ldquo;Intern&rdquo;. Oh wait,
          you&apos;re admin. Never mind.
        </p>
      </div>
    </div>
  );
}
