import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.scanStatus === "FLAGGED") {
      return NextResponse.json({ error: "This file has been quarantined" }, { status: 403 });
    }

    if (!game.fileName) {
      return NextResponse.json({ error: "No file available for this game" }, { status: 404 });
    }

    const filePath = join(process.cwd(), "private", "games", id, game.fileName);
    const buffer = readFileSync(filePath);

    await prisma.game.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${game.fileName}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
