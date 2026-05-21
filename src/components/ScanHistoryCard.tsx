import SafetyBadge from "./SafetyBadge";

interface Scan {
  id: string;
  sha256: string;
  fileName: string;
  fileSize: number | null;
  scanStatus: string;
  scanResult: Record<string, unknown> | null;
  scannedAt: string | null;
  createdAt: string;
}

export default function ScanHistoryCard({ scan }: { scan: Scan }) {
  return (
    <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-primary">Last Scan</h2>
        <SafetyBadge status={scan.scanStatus} size="md" />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-text-secondary">Engine</span>
          <span className="text-text-primary">ClamAV</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-text-secondary">SHA-256</span>
          <span className="text-text-primary font-mono text-xs truncate max-w-[200px]">{scan.sha256}</span>
        </div>
        {scan.scannedAt && (
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Scanned</span>
            <span className="text-text-primary">{new Date(scan.scannedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {scan.scanResult && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Details</h3>
          <pre className="text-xs text-text-secondary bg-dark-bg rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(scan.scanResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
