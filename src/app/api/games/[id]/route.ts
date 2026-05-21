import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { title, description, tags, rating, downloadCount, coverData } =
      await req.json();

    const game = await prisma.game.update({
      where: { id },
      data: {
        title,
        description,
        tags: JSON.stringify(tags || []),
        rating: typeof rating === "number" ? rating : 0,
        downloadCount: typeof downloadCount === "number" ? downloadCount : 0,
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
  if (!session || session.user?.role !== "ADMIN") {
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
