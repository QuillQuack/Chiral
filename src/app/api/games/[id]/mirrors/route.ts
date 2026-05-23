import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { createDownloadMirrorSchema } from "@/lib/validations/game";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await prisma.game.findFirst({
      where: { OR: [{ slug: id }, { id }] },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const mirrors = await prisma.downloadMirror.findMany({
      where: { gameId: game.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      mirrors: mirrors.map((m) => ({
        id: m.id,
        provider: m.provider,
        url: m.url,
        fileSize: m.fileSize,
        verifiedAt: m.verifiedAt?.toISOString() || null,
        isOfficial: m.isOfficial,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch mirrors" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const game = await prisma.game.findFirst({
      where: { OR: [{ slug: id }, { id }] },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createDownloadMirrorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid mirror data" },
        { status: 400 }
      );
    }

    const mirror = await prisma.downloadMirror.create({
      data: {
        provider: parsed.data.provider,
        url: parsed.data.url,
        fileSize: parsed.data.fileSize || null,
        verifiedAt: parsed.data.isOfficial ? new Date() : null,
        isOfficial: parsed.data.isOfficial || false,
        gameId: game.id,
      },
    });

    return NextResponse.json({
      mirror: {
        id: mirror.id,
        provider: mirror.provider,
        url: mirror.url,
        fileSize: mirror.fileSize,
        verifiedAt: mirror.verifiedAt?.toISOString() || null,
        isOfficial: mirror.isOfficial,
        createdAt: mirror.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to add mirror" }, { status: 500 });
  }
}
