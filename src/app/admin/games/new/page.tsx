"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/roles";

const ALL_TAGS = ["2D", "3D", "Interspecies Sex", "Visual Novel", "JRPG", "Action", "Adventure", "Puzzle", "Simulation", "RPG", "Strategy", "Sandbox", "Horror", "Dating Sim", "Management", "Comedy"];

const PROGRESS_INDETERMINATE = -1;

type Phase = "idle" | "creating" | "reading" | "uploading" | "scanning" | "done";

interface StepDef {
  label: string;
  sub?: string;
}

export default function UploadGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverData, setCoverData] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [readPercent, setReadPercent] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [resultText, setResultText] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const barPercent = phase === "idle" ? 0
    : phase === "creating" ? PROGRESS_INDETERMINATE
    : phase === "reading" ? 10 + readPercent * 0.4
    : phase === "uploading" ? PROGRESS_INDETERMINATE
    : phase === "scanning" && scanStatus === "QUEUED" ? 70
    : phase === "scanning" && scanStatus === "SCANNING" ? 85
    : phase === "scanning" ? 100
    : 100;

  const currentStepIndex = phase === "idle" ? -1
    : phase === "creating" ? 0
    : phase === "reading" ? 1
    : phase === "uploading" ? 2
    : phase === "scanning" ? 3
    : phase === "done" ? 4
    : 4;

  const steps: StepDef[] = [
    { label: "Creating game entry..." },
    { label: `Reading ${gameFile?.name || "file"}...`, sub: readPercent > 0 ? `${(readPercent * 100).toFixed(0)}%` : undefined },
    { label: "Uploading..." },
    { label: "Scanning with ClamAV...", sub: scanStatus },
    { label: resultText },
  ];

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !isAdmin(session?.user?.role || "")) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = useCallback((gameId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/games/${gameId}/scan`);
        const data = await r.json();
        if (data.scan) {
          setScanStatus(data.scan.scanStatus);
          if (data.scan.scanStatus === "CLEAN") {
            setResultText("Scan complete — clean!");
            setPhase("done");
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTimeout(() => router.push("/admin/games"), 1500);
          } else if (data.scan.scanStatus === "FLAGGED") {
            setResultText("Threat detected — game quarantined.");
            setPhase("done");
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTimeout(() => router.push("/admin/games"), 1500);
          } else if (data.scan.scanStatus === "ERROR") {
            setResultText("Scan failed, but game was created.");
            setPhase("done");
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTimeout(() => router.push("/admin/games"), 1500);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 1500);
  }, [router]);

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

  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      setError("Game file must be under 200MB");
      return;
    }
    setGameFile(file);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhase("creating");
    setReadPercent(0);
    setScanStatus("");
    setResultText("");
    setLoading(true);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags: selectedTags,
          coverData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        setLoading(false);
        setPhase("idle");
        return;
      }

      const { game } = await res.json();

      if (gameFile) {
        setPhase("reading");

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              setReadPercent(e.loaded / e.total);
            }
          };
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",").pop() || "");
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(gameFile);
        });

        setPhase("uploading");

        const scanRes = await fetch(`/api/games/${game.id}/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: gameFile.name,
            fileData: base64,
          }),
        });

        if (!scanRes.ok) {
          const errBody = await scanRes.json().catch(() => ({}));
          setResultText(errBody.error || "Upload failed, but game was created.");
          setPhase("done");
          setTimeout(() => router.push("/admin/games"), 1500);
          return;
        }

        let scanData: { scan?: { scanStatus?: string } } = {};
        try {
          scanData = await scanRes.json();
        } catch {
          setResultText("Upload succeeded, but scan status is unavailable.");
          setPhase("done");
          setTimeout(() => router.push("/admin/games"), 1500);
          return;
        }

        setScanStatus(scanData.scan?.scanStatus || "");

        if (scanData.scan?.scanStatus === "CLEAN") {
          setResultText("Scan complete — clean!");
          setPhase("done");
          setTimeout(() => router.push("/admin/games"), 1500);
        } else if (scanData.scan?.scanStatus === "FLAGGED") {
          setResultText("Threat detected — game quarantined.");
          setPhase("done");
          setTimeout(() => router.push("/admin/games"), 1500);
        } else {
          setPhase("scanning");
          startPolling(game.id);
        }
      } else {
        router.push("/admin/games");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLoading(false);
      setPhase("idle");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "authenticated" && !isAdmin(session?.user?.role || "")) {
    router.push("/");
    return null;
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

          {phase !== "idle" && (
            <div className="bg-dark-secondary rounded-xl border border-white/10 p-5 space-y-4">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-accent-pink to-accent-cyan ${
                    barPercent === PROGRESS_INDETERMINATE
                      ? "w-1/3 animate-pulse"
                      : "transition-all duration-300"
                  }`}
                  style={barPercent !== PROGRESS_INDETERMINATE ? { width: `${Math.min(barPercent, 100)}%` } : undefined}
                />
              </div>

              <div className="space-y-2">
                {steps.map((s, i) =>
                  s.label ? (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-sm ${
                        i < currentStepIndex
                          ? "text-green-400"
                          : i === currentStepIndex
                          ? "text-text-primary"
                          : "text-text-secondary/40"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                        i < currentStepIndex
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : i === currentStepIndex && phase !== "done"
                          ? "border-accent-cyan text-accent-cyan"
                          : i === currentStepIndex
                          ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan"
                          : "border-white/10"
                      }`}>
                        {i < currentStepIndex ? "✓" : i === currentStepIndex && phase !== "done" ? "⟳" : i === currentStepIndex ? "✓" : ""}
                      </span>
                      <span>{s.label}</span>
                      {s.sub && i === currentStepIndex && (
                        <span className="text-xs text-text-secondary/60 ml-auto">{s.sub}</span>
                      )}
                    </div>
                  ) : null
                )}
              </div>

              {phase === "scanning" && (
                <p className="text-xs text-text-secondary/50 text-center">
                  This may take a moment for large files
                </p>
              )}
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

          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Game File</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-3 rounded-xl text-sm font-medium text-accent-pink bg-accent-pink/10 border border-accent-pink/20 hover:bg-accent-pink/20 transition-all">
                Choose File
                <input type="file" accept=".zip,.exe,.dmg" onChange={handleGameFileChange} className="hidden" />
              </label>
              <span className="text-text-secondary text-xs">
                {gameFile ? gameFile.name : ".zip, .exe, or .dmg"}
              </span>
            </div>
            {gameFile && (
              <p className="mt-2 text-xs text-text-secondary/60">
                File will be scanned with ClamAV on upload
              </p>
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
