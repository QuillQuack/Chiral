import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scanBuffer, generateSha256 } from "@/lib/clamav";

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
  if (!session || session.user?.role !== "ADMIN") {
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

    const scan: { id: string; sha256: string; fileName: string; fileSize: number | null; scanStatus: string; scanResult: unknown; scannedAt: Date | null; createdAt: Date } = await prisma.$transaction(async (tx) => {
      const existing = await tx.fileScan.findUnique({ where: { gameId: id } });
      if (existing) {
        await tx.fileScan.delete({ where: { id: existing.id } });
      }

      const created = await tx.fileScan.create({
        data: {
          sha256,
          fileName,
          fileSize: buffer.length,
          scanStatus: "QUEUED",
          gameId: id,
        },
      });

      await tx.fileScan.update({
        where: { id: created.id },
        data: { scanStatus: "SCANNING" },
      });

      let scanStatus = "ERROR";
      let scanResult: unknown = null;
      let scannedAt: Date | null = null;

      try {
        const result = await scanBuffer(buffer, fileName);
        scanStatus = result.status;
        scanResult = result.details ? { engine: "ClamAV", details: result.details } : null;
        scannedAt = new Date();
      } catch {
        scanStatus = "ERROR";
        scanResult = { engine: "ClamAV", error: "Scan failed" };
        scannedAt = new Date();
      }

      const updated = await tx.fileScan.update({
        where: { id: created.id },
        data: {
          scanStatus,
          scanResult: scanResult ? JSON.stringify(scanResult) : null,
          scannedAt,
        },
      });

      await tx.game.update({
        where: { id },
        data: {
          scanStatus,
          sha256,
          verifiedAt: scanStatus === "CLEAN" ? new Date() : null,
        },
      });

      return updated;
    });

    return NextResponse.json({
      scan: {
        id: scan.id,
        sha256: scan.sha256,
        fileName: scan.fileName,
        fileSize: scan.fileSize,
        scanStatus: scan.scanStatus,
        scanResult: scan.scanResult ? JSON.parse(scan.scanResult as string) : null,
        scannedAt: scan.scannedAt?.toISOString() || null,
        createdAt: scan.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to scan file" }, { status: 500 });
  }
}
