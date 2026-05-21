export interface GameData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  rating: number;
  downloadCount: number;
  coverData: string | null;
  scanStatus: string;
  sha256: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  username: string;
  avatar: string;
  text: string;
  upvotes: number;
  timestamp: string;
}

export interface SafetyReportData {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reporter: { id: string; username: string };
  reviewer: { id: string; username: string } | null;
  gameId: string | null;
  postId: string | null;
}

export interface FileScanData {
  id: string;
  sha256: string;
  fileName: string;
  fileSize: number | null;
  scanStatus: string;
  scanResult: string | null;
  scannedAt: string | null;
  createdAt: string;
}

export const REPORT_REASONS = [
  "MALWARE",
  "FAKE_DOWNLOAD",
  "BROKEN_LINK",
  "MISLEADING_CONTENT",
  "SPAM",
  "COPYRIGHT",
  "OTHER",
] as const;

export const REPORT_STATUSES = ["PENDING", "FLAGGED", "REVIEWED", "DISMISSED"] as const;

export const SCAN_STATUSES = [
  "NOT_SCANNED",
  "QUEUED",
  "SCANNING",
  "CLEAN",
  "FLAGGED",
  "ERROR",
] as const;
