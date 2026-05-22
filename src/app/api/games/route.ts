import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "newest";
    const tag = searchParams.get("tag");
    const search = searchParams.get("search")?.toLowerCase();

    const where: Record<string, unknown> = {
      scanStatus: { not: "FLAGGED" },
    };

    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, "asc" | "desc"> =
      sort === "trending"
        ? { rating: "desc" }
        : sort === "downloads"
        ? { downloadCount: "desc" }
        : { createdAt: "desc" };

    const games = await prisma.game.findMany({
      where: where as never,
      orderBy: orderBy as never,
    });

    const parsed = games.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      tags: JSON.parse(g.tags) as string[],
      rating: g.rating,
      downloadCount: g.downloadCount,
      scanStatus: g.scanStatus,
      coverData: g.coverData,
      createdAt: g.createdAt.toISOString(),
    }));

    return NextResponse.json({ games: parsed });
  } catch {
    return NextResponse.json({ games: [] });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { title, description, tags, coverData } =
      await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const game = await prisma.game.create({
      data: {
        title,
        description,
        tags: JSON.stringify(tags || []),
        coverData: coverData || null,
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
        scanStatus: game.scanStatus,
        coverData: game.coverData,
        createdAt: game.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
