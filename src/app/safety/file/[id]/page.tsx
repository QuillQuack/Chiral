"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SafetyBadge from "@/components/SafetyBadge";
import ScanHistoryCard from "@/components/ScanHistoryCard";

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

export default function FileScanPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/games/${id}/scan`)
      .then((r) => r.json())
      .then((d) => setScan(d.scan))
      .catch(() => setScan(null))
      .finally(() => setLoading(false));
  }, [id]);

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

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/safety" className="inline-flex items-center gap-1 text-text-secondary text-sm hover:text-accent-cyan transition-colors mb-6">
            &larr; Safety Center
          </Link>

          {!scan ? (
            <div className="bg-dark-secondary rounded-2xl border border-white/5 p-8 text-center">
              <p className="text-text-secondary">No scan found for this game</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Scan Result</h1>
                <SafetyBadge status={scan.scanStatus} />
              </div>

              <ScanHistoryCard scan={scan} />

              <div className="bg-dark-secondary rounded-2xl border border-white/5 p-6 mt-6">
                <h2 className="text-sm font-semibold text-text-primary mb-4">File Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-text-secondary">Filename</span>
                    <span className="text-text-primary font-mono">{scan.fileName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-text-secondary">Size</span>
                    <span className="text-text-primary">{scan.fileSize ? `${(scan.fileSize / 1024 / 1024).toFixed(2)} MB` : "Unknown"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-text-secondary">SHA-256</span>
                    <span className="text-text-primary font-mono text-xs break-all max-w-md text-right">{scan.sha256}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-text-secondary">Scanned At</span>
                    <span className="text-text-primary">{scan.scannedAt ? new Date(scan.scannedAt).toLocaleString() : "Not yet scanned"}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
