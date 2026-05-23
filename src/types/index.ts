export interface GameData {
  id: string;
  slug: string;
  title: string;
  shortSummary: string | null;
  description: string;
  tags: string[];
  rating: number;
  downloadCount: number;
  coverData: string | null;
  scanStatus: string;
  sha256: string | null;
  verifiedAt: string | null;
  releaseDate: string | null;
  systemRequirements: SystemRequirements | null;
  reportCount: number;
  createdAt: string;
  author: { id: string; username: string; image: string | null } | null;
  screenshots?: GameScreenshot[];
  mirrors?: DownloadMirror[];
}

export interface SystemRequirements {
  os: string | null;
  ram: string | null;
  gpu: string | null;
  storage: string | null;
  processor: string | null;
}

export interface GameScreenshot {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface DownloadMirror {
  id: string;
  provider: string;
  url: string;
  fileSize: string | null;
  verifiedAt: string | null;
  isOfficial: boolean;
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
