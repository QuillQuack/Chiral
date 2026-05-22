import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scanBuffer, generateSha256 } from "@/lib/clamav";
import { isAdmin } from "@/lib/roles";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const UPLOADS_DIR = join(process.cwd(), "private", "games");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const scan = await prisma.fileScan.findUnique({
    where: { gameId: id },
  });

  if (!scan) {
    return NextResponse.json({ scan: null });
  }

  return NextResponse.json({
    scan: {
      id: scan.id,
      sha256: scan.sha256,
      fileName: scan.fileName,
      fileSize: scan.fileSize,
      scanStatus: scan.scanStatus,
      scanResult: scan.scanResult ? JSON.parse(scan.scanResult) : null,
      scannedAt: scan.scannedAt?.toISOString() || null,
      createdAt: scan.createdAt.toISOString(),
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  try {
    const { fileName, fileData } = await req.json();

    if (!fileName || !fileData) {
      return NextResponse.json({ error: "fileName and fileData are required" }, { status: 400 });
    }

    const buffer = Buffer.from(fileData, "base64");
    const sha256 = generateSha256(buffer);

    const gameDir = join(UPLOADS_DIR, id);
    mkdirSync(gameDir, { recursive: true });
    writeFileSync(join(gameDir, fileName), buffer);

    const fileScan = await prisma.$transaction(async (tx) => {
      const existing = await tx.fileScan.findUnique({ where: { gameId: id } });
      if (existing) {
        await tx.fileScan.delete({ where: { id: existing.id } });
      }

      return tx.fileScan.create({
        data: {
          sha256,
          fileName,
          fileSize: buffer.length,
          scanStatus: "QUEUED",
          gameId: id,
        },
      });
    });

    await prisma.game.update({
      where: { id },
      data: { fileName, sha256, scanStatus: "QUEUED" },
    });

    const res = NextResponse.json({
      scan: {
        id: fileScan.id,
        sha256: fileScan.sha256,
        fileName: fileScan.fileName,
        fileSize: fileScan.fileSize,
        scanStatus: fileScan.scanStatus,
        scanResult: null,
        scannedAt: null,
        createdAt: fileScan.createdAt.toISOString(),
      },
    });

    (async () => {
      try {
        await prisma.fileScan.update({
          where: { id: fileScan.id },
          data: { scanStatus: "SCANNING" },
        });

        const result = await scanBuffer(buffer, fileName);

        await prisma.$transaction(async (tx) => {
          await tx.fileScan.update({
            where: { id: fileScan.id },
            data: {
              scanStatus: result.status,
              scanResult: result.details
                ? JSON.stringify({ engine: "ClamAV", details: result.details })
                : null,
              scannedAt: new Date(),
            },
          });

          await tx.game.update({
            where: { id },
            data: {
              scanStatus: result.status,
              verifiedAt: result.status === "CLEAN" ? new Date() : null,
            },
          });
        });
      } catch {
        await prisma.$transaction(async (tx) => {
          await tx.fileScan.update({
            where: { id: fileScan.id },
            data: {
              scanStatus: "ERROR",
              scanResult: JSON.stringify({ engine: "ClamAV", error: "Scan failed" }),
              scannedAt: new Date(),
            },
          });

          await tx.game.update({
            where: { id },
            data: { scanStatus: "ERROR" },
          });
        });
      }
    })();

    return res;
  } catch {
    return NextResponse.json({ error: "Failed to scan file" }, { status: 500 });
  }
}
