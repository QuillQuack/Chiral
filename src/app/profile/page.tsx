"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import BioDisplay from "@/components/BioDisplay";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [trustScore] = useState(() => Math.floor(Math.random() * 40) + 60);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bioEditing, setBioEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const [bioMsg, setBioMsg] = useState<"success" | "error" | null>(null);

  const [usernameEditing, setUsernameEditing] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const currentBio = session?.user?.bio ?? null;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (bioMsg) {
      const t = setTimeout(() => setBioMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [bioMsg]);

  const resetAvatar = () => {
    setAvatarPreview(null);
    setAvatarError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("File must be an image");
      return;
    }

    setAvatarError("");

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarPreview) return;
    setAvatarSaving(true);
    setAvatarError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: avatarPreview }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAvatarError(data.error || "Failed to update avatar");
        return;
      }

      await update({ image: avatarPreview });
      resetAvatar();
    } catch {
      setAvatarError("Network error");
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarSaving(true);
    setAvatarError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAvatarError(data.error || "Failed to remove avatar");
        return;
      }

      await update({ image: null });
    } catch {
      setAvatarError("Network error");
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleStartUsernameEdit = () => {
    setUsernameDraft(session?.user?.name ?? "");
    setUsernameEditing(true);
    setUsernameError("");
  };

  const handleUsernameSave = async () => {
    if (!usernameDraft.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }

    setUsernameSaving(true);
    setUsernameError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameDraft.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setUsernameError(data.error || "Failed to update username");
        return;
      }

      await update({ name: usernameDraft.trim() });
      setUsernameEditing(false);
    } catch {
      setUsernameError("Network error");
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleStartBioEdit = () => {
    setBioDraft(currentBio ?? "");
    setBioEditing(true);
    setBioMsg(null);
  };

  const handleBioCancel = () => {
    setBioEditing(false);
    setBioDraft("");
    setBioMsg(null);
  };

  const handleBioSave = async () => {
    setBioSaving(true);
    setBioMsg(null);

    try {
      const res = await fetch("/api/profile/bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioDraft.trim() || null }),
      });

      if (!res.ok) {
        setBioMsg("error");
        return;
      }

      await update();
      setBioEditing(false);
      setBioMsg("success");
    } catch {
      setBioMsg("error");
    } finally {
      setBioSaving(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : "??";

  const avatarSrc = avatarPreview || session.user.image;

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-[640px] mx-auto">
        <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative shrink-0">
              <label
                className={`block w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group ${
                  avatarSaving ? "pointer-events-none opacity-60" : ""
                }`}
              >
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent-pink to-accent-cyan flex items-center justify-center text-2xl font-bold text-dark-bg">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <span className="text-xs text-white font-medium">Change</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {avatarPreview && (
                <div className="absolute -top-1 -right-1 flex gap-1">
                  <button
                    onClick={handleAvatarSave}
                    disabled={avatarSaving}
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs hover:bg-green-400 transition-colors disabled:opacity-50"
                    title="Save avatar"
                  >
                    ✓
                  </button>
                  <button
                    onClick={resetAvatar}
                    disabled={avatarSaving}
                    className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs hover:bg-red-400 transition-colors disabled:opacity-50"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              )}
              {session.user.image && !avatarPreview && (
                <button
                  onClick={handleAvatarRemove}
                  disabled={avatarSaving}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xs hover:bg-red-400 transition-colors disabled:opacity-50"
                  title="Remove avatar"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {usernameEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    maxLength={30}
                    disabled={usernameSaving}
                    className="flex-1 bg-dark-bg border border-white/10 rounded-xl px-4 py-[2px] text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 text-xl font-bold"
                    placeholder="Your username"
                  />
                  <button
                    onClick={() => setUsernameEditing(false)}
                    disabled={usernameSaving}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50 shrink-0"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUsernameSave}
                    disabled={usernameSaving}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50 shrink-0"
                  >
                    {usernameSaving ? "Saving..." : "Save"}
                  </button>
                  {usernameError && (
                    <p className="text-xs text-red-400">{usernameError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary truncate">
                    {session.user.name}
                  </h1>
                  <button
                    onClick={handleStartUsernameEdit}
                    className="text-text-secondary hover:text-accent-pink transition-colors shrink-0 ml-2"
                    title="Edit username"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-text-secondary text-sm truncate">{session.user.email}</p>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-pink/10 text-accent-pink border border-accent-pink/20">
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>

          {avatarError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {avatarError}
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-secondary">Bio</h2>
              {!bioEditing && (
                <button
                  onClick={handleStartBioEdit}
                  className="text-xs text-accent-cyan hover:text-accent-pink transition-colors"
                >
                  Edit Bio
                </button>
              )}
            </div>

            {bioEditing ? (
              <div className="space-y-3">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  maxLength={300}
                  rows={4}
                  disabled={bioSaving}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/50 resize-none text-sm"
                  placeholder="Tell the world about your definitely-legit downloading habits..."
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono ${
                      bioDraft.length > 280
                        ? bioDraft.length >= 300
                          ? "text-red-400"
                          : "text-yellow-400"
                        : "text-text-secondary"
                    }`}
                  >
                    {bioDraft.length}/300
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBioCancel}
                      disabled={bioSaving}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBioSave}
                      disabled={bioSaving || bioDraft.length > 300}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.4)] disabled:opacity-50"
                    >
                      {bioSaving ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
                {bioMsg === "error" && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                    Failed to update bio
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <BioDisplay bio={currentBio} />
                </div>
                {bioMsg === "success" && (
                  <div className="mt-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
                    Bio updated successfully
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Downloads", value: "0", color: "from-accent-pink to-accent-pink/50" },
              { label: "Viruses Dodged", value: "∞", color: "from-accent-cyan to-accent-cyan/50" },
              { label: "Trust Score", value: `${trustScore}%`, color: "from-green-400 to-emerald-500" },
              { label: "Fake Buttons", value: "37+", color: "from-yellow-400 to-orange-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-dark-bg rounded-xl border border-white/5 p-4 text-center"
              >
                <div
                  className={`text-2xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-text-secondary text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 space-y-4">
            <Link
              href="/"
              className="block w-full py-3 text-center rounded-xl text-text-primary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all text-sm font-medium"
            >
              Back to Safety (Browse Games)
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full py-3 rounded-xl text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
