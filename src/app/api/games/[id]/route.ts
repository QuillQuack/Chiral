import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

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

    return NextResponse.json({
      game: {
        id: game.id,
        title: game.title,
        description: game.description,
        tags: JSON.parse(game.tags),
        rating: game.rating,
        downloadCount: game.downloadCount,
        coverData: game.coverData,
        scanStatus: game.scanStatus,
        sha256: game.sha256,
        createdAt: game.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { title, description, tags, coverData } =
      await req.json();

    const game = await prisma.game.update({
      where: { id },
      data: {
        title,
        description,
        tags: JSON.stringify(tags || []),
        coverData: coverData ?? undefined,
      },
    });

    return NextResponse.json({
      game: {
        id: game.id,
        title: game.title,
        description: game.description,
        tags: JSON.parse(game.tags),
        rating: game.rating,
        downloadCount: game.downloadCount,
        coverData: game.coverData,
        createdAt: game.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.game.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}
