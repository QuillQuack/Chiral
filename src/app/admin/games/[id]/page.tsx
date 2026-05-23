"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";
import SafetyBadge from "@/components/SafetyBadge";
import type {
  GameData,
  GameScreenshot,
  DownloadMirror,
  SystemRequirements,
} from "@/types";

const ALL_TAGS = [
  "2D", "3D", "Interspecies Sex", "Visual Novel", "JRPG",
  "Action", "Adventure", "Puzzle", "Simulation", "RPG",
  "Strategy", "Sandbox", "Horror", "Dating Sim", "Management", "Comedy",
];

const SCAN_STATUSES = [
  "NOT_SCANNED", "QUEUED", "SCANNING", "CLEAN", "FLAGGED", "ERROR",
];

type Message = { type: "success" | "error"; text: string } | null;

export default function AdminGameEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const gameId = params.id;

  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const [title, setTitle] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverData, setCoverData] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [sysReqs, setSysReqs] = useState<string>("");

  const [screenshots, setScreenshots] = useState<GameScreenshot[]>([]);
  const [mirrors, setMirrors] = useState<DownloadMirror[]>([]);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const [newMirrorUrl, setNewMirrorUrl] = useState("");
  const [newMirrorSize, setNewMirrorSize] = useState("");
  const [newMirrorOfficial, setNewMirrorOfficial] = useState(false);
  const [addingMirror, setAddingMirror] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && !isAdmin(session?.user?.role || "")) {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`);
      if (!res.ok) { setMessage({ type: "error", text: "Game not found" }); setLoading(false); return; }
      const data = await res.json();
      const g = data.game as GameData;
      setGame(g);
      setTitle(g.title);
      setShortSummary(g.shortSummary || "");
      setDescription(g.description);
      setSelectedTags(g.tags);
      setCoverPreview(g.coverData);
      setScanStatus(g.scanStatus);
      setReleaseDate(g.releaseDate ? g.releaseDate.split("T")[0] : "");
      setSysReqs(g.systemRequirements ? JSON.stringify(g.systemRequirements, null, 2) : "");
      setScreenshots(g.screenshots || []);
      setMirrors(g.mirrors || []);
    } catch {
      setMessage({ type: "error", text: "Failed to load game" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchGame();
  }, [status, gameId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    let parsedSysReqs: SystemRequirements | null = null;
    if (sysReqs.trim()) {
      try {
        parsedSysReqs = JSON.parse(sysReqs.trim());
      } catch {
        setMessage({ type: "error", text: "System requirements must be valid JSON" });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          shortSummary: shortSummary || null,
          description,
          tags: selectedTags,
          coverData,
          scanStatus,
          releaseDate: releaseDate || null,
          systemRequirements: parsedSysReqs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save" });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Game updated successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 5MB" });
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

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreenshot(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/games/${gameId}/screenshots`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Upload failed" });
      } else {
        const data = await res.json();
        setScreenshots((prev) => [...prev, data.screenshot]);
        setMessage({ type: "success", text: "Screenshot uploaded" });
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed" });
    } finally {
      setUploadingScreenshot(false);
      e.target.value = "";
    }
  };

  const handleDeleteScreenshot = async (screenshotId: string) => {
    if (!confirm("Delete this screenshot?")) return;
    try {
      const res = await fetch(`/api/games/${gameId}/screenshots`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
        return;
      }
      setScreenshots((prev) => prev.filter((s) => s.id !== screenshotId));
      setMessage({ type: "success", text: "Screenshot deleted" });
    } catch {
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

  const handleAddMirror = async () => {
    if (!newMirrorUrl.trim()) return;
    setAddingMirror(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/games/${gameId}/mirrors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "MEGA",
          url: newMirrorUrl.trim(),
          fileSize: newMirrorSize.trim() || null,
          isOfficial: newMirrorOfficial,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to add mirror" });
        setAddingMirror(false);
        return;
      }

      const data = await res.json();
      setMirrors((prev) => [...prev, data.mirror]);
      setNewMirrorUrl("");
      setNewMirrorSize("");
      setNewMirrorOfficial(false);
      setMessage({ type: "success", text: "Mirror added" });
    } catch {
      setMessage({ type: "error", text: "Failed to add mirror" });
    } finally {
      setAddingMirror(false);
    }
  };

  const handleDeleteMirror = async (mirrorId: string) => {
    if (!confirm("Delete this mirror?")) return;
    try {
      const res = await fetch(`/api/games/${gameId}/mirrors/${mirrorId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setMessage({ type: "error", text: "Failed to delete mirror" });
        return;
      }
      setMirrors((prev) => prev.filter((m) => m.id !== mirrorId));
      setMessage({ type: "success", text: "Mirror deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete mirror" });
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-text-secondary mb-4">Game not found</p>
          <Link href="/admin/games" className="text-accent-cyan hover:underline">Back to games</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Edit Game</h1>
            <p className="text-text-secondary text-sm mt-1">
              <Link href={`/games/${game.slug}`} className="text-accent-cyan hover:underline" target="_blank">
                View live page &rarr;
              </Link>
            </p>
          </div>
          <Link
            href="/admin/games"
            className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-white/5 border border-white/10 hover:border-accent-cyan/30 transition-all"
          >
            &larr; Back
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
            <button onClick={() => setMessage(null)} className="float-right">&times;</button>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Basic Info</h2>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50"
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
                rows={6}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50 resize-none"
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
              <label className="block text-text-secondary text-sm font-medium mb-2">Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-cyan/50"
              />
            </div>
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">System Requirements</h2>
            <p className="text-text-secondary text-xs">JSON format — leave empty if not applicable</p>
            <textarea
              value={sysReqs}
              onChange={(e) => setSysReqs(e.target.value)}
              rows={6}
              placeholder='{"os": "Windows 10", "ram": "8 GB", "gpu": "GTX 1060", "storage": "10 GB", "processor": "Intel i5"}'
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary font-mono text-sm focus:outline-none focus:border-accent-cyan/50 resize-none placeholder:text-text-secondary/40"
            />
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Cover Image</h2>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-3 rounded-xl text-sm font-medium text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all">
                Choose File
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
              <span className="text-text-secondary text-xs">Max 5MB</span>
            </div>
            {coverPreview && (
              <div className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Screenshots</h2>
            <div>
              <label className="cursor-pointer inline-block px-4 py-3 rounded-xl text-sm font-medium text-accent-pink bg-accent-pink/10 border border-accent-pink/20 hover:bg-accent-pink/20 transition-all">
                {uploadingScreenshot ? "Uploading..." : "Upload Screenshot"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadScreenshot}
                  disabled={uploadingScreenshot}
                  className="hidden"
                />
              </label>
            </div>
            {screenshots.length === 0 ? (
              <p className="text-text-secondary text-sm">No screenshots yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screenshots.map((s) => (
                  <div key={s.id} className="relative group aspect-video rounded-xl overflow-hidden border border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteScreenshot(s.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Download Mirrors</h2>

            <div className="bg-dark-bg rounded-xl border border-white/5 p-4 space-y-3">
              <p className="text-xs text-text-secondary font-medium">Add MEGA Mirror</p>
              <input
                value={newMirrorUrl}
                onChange={(e) => setNewMirrorUrl(e.target.value)}
                placeholder="https://mega.nz/file/..."
                className="w-full bg-dark-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 placeholder:text-text-secondary/40"
              />
              <div className="flex gap-3">
                <input
                  value={newMirrorSize}
                  onChange={(e) => setNewMirrorSize(e.target.value)}
                  placeholder="File size (e.g. 4.2 GB)"
                  className="flex-1 bg-dark-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan/50 placeholder:text-text-secondary/40"
                />
                <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newMirrorOfficial}
                    onChange={(e) => setNewMirrorOfficial(e.target.checked)}
                    className="rounded border-white/10 bg-dark-bg text-accent-pink focus:ring-accent-pink/20"
                  />
                  Official
                </label>
              </div>
              <button
                onClick={handleAddMirror}
                disabled={addingMirror || !newMirrorUrl.trim()}
                className="w-full py-2 rounded-lg text-sm font-medium text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all hover:shadow-[0_0_20px_-5px_rgba(255,79,216,0.3)] disabled:opacity-50"
              >
                {addingMirror ? "Adding..." : "Add Mirror"}
              </button>
            </div>

            {mirrors.length === 0 ? (
              <p className="text-text-secondary text-sm">No mirrors added yet</p>
            ) : (
              <div className="space-y-2">
                {mirrors.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-dark-bg rounded-xl border border-white/5 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary text-sm font-medium">{m.provider}</span>
                        {m.isOfficial && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">Official</span>
                        )}
                      </div>
                      <p className="text-text-secondary text-xs truncate">{m.url}</p>
                      {m.fileSize && <p className="text-text-secondary/60 text-xs">{m.fileSize}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteMirror(m.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Scan Status</h2>
            <div className="flex items-center gap-4">
              <select
                value={scanStatus}
                onChange={(e) => setScanStatus(e.target.value)}
                className="bg-dark-bg border border-white/10 rounded-xl px-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-cyan/50"
              >
                {SCAN_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <SafetyBadge status={scanStatus} size="md" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/games"
              className="px-6 py-3 rounded-xl text-sm font-medium text-text-secondary bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan hover:shadow-[0_0_30px_-5px_rgba(255,79,216,0.4)] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
