export default function SafetyBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" | "lg" }) {
  const config: Record<string, { label: string; color: string; icon: string }> = {
    CLEAN: { label: "Verified Clean", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: "✓" },
    FLAGGED: { label: "Flagged", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: "!" },
    QUEUED: { label: "Queued", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: "~" },
    SCANNING: { label: "Scanning", color: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20", icon: "↻" },
    ERROR: { label: "Scan Error", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: "✕" },
    NOT_SCANNED: { label: "Not Scanned", color: "bg-white/5 text-text-secondary border-white/10", icon: "?" },
    PENDING: { label: "Pending Scan", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: "~" },
  };

  const c = config[status] || config.NOT_SCANNED;
  const sizeClass = size === "lg" ? "text-xs px-3 py-1" : size === "md" ? "text-[10px] px-2.5 py-1" : "text-[9px] px-2 py-0.5";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium border ${c.color} ${sizeClass}`}>
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}
