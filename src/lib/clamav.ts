import { createHash } from "crypto";
import { writeFileSync, rmSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export function generateSha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export interface ScanResult {
  status: "CLEAN" | "FLAGGED" | "ERROR" | "NOT_SCANNED";
  details: string | null;
}

export async function scanBuffer(
  buffer: Buffer,
  fileName: string
): Promise<ScanResult> {
  const isExe = fileName.endsWith(".exe");
  const isZip = fileName.endsWith(".zip");
  const isDmg = fileName.endsWith(".dmg");

  if (!isExe && !isZip && !isDmg) {
    return { status: "CLEAN", details: null };
  }

  const tmpDir = mkdtempSync(join(tmpdir(), "chiral-scan-"));
  const tmpFile = join(tmpDir, fileName);

  try {
    writeFileSync(tmpFile, buffer);

    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const { stdout, stderr } = await execAsync(
      `clamscan --stdout --no-summary "${tmpFile}" 2>&1`,
      { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
    );

    if (stderr && !stdout) {
      return { status: "ERROR", details: stderr.trim() };
    }

    const lines = stdout.trim().split("\n").filter(Boolean);
    const infected = lines.filter((l) => l.includes("FOUND"));

    if (infected.length > 0) {
      return {
        status: "FLAGGED",
        details: infected.join("; "),
      };
    }

    return { status: "CLEAN", details: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    if (msg.includes("ENOENT") || msg.includes("not found") || msg.includes("clamscan")) {
      return { status: "NOT_SCANNED", details: null };
    }

    if (msg.includes("timed out")) {
      return { status: "ERROR", details: "Scan timed out" };
    }

    return { status: "ERROR", details: msg };
  } finally {
    try { rmSync(tmpDir, { recursive: true }); } catch {}
  }
}
