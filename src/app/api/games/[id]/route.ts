import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { generateSlug } from "@/lib/slug";
import { updateGameSchema } from "@/lib/validations/game";

async function findGame(identifier: string) {
  return prisma.game.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
    },
    include: {
      author: { select: { id: true, username: true, image: true } },
      screenshots: { orderBy: { createdAt: "asc" } },
      mirrors: { orderBy: { createdAt: "asc" } },
    },
  });
}

function serializeGame(game: any) {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    shortSummary: game.shortSummary,
    description: game.description,
    tags: JSON.parse(game.tags) as string[],
    rating: game.rating,
    downloadCount: game.downloadCount,
    coverData: game.coverData,
    scanStatus: game.scanStatus,
    sha256: game.sha256,
    verifiedAt: game.verifiedAt?.toISOString() || null,
    releaseDate: game.releaseDate?.toISOString() || null,
    systemRequirements: game.systemRequirements ? JSON.parse(game.systemRequirements) : null,
    reportCount: game.reportCount,
    createdAt: game.createdAt.toISOString(),
    author: game.author
      ? { id: game.author.id, username: game.author.username, image: game.author.image }
      : null,
    screenshots: game.screenshots.map((s: any) => ({
      id: s.id,
      imageUrl: s.imageUrl,
      createdAt: s.createdAt.toISOString(),
    })),
    mirrors: game.mirrors.map((m: any) => ({
      id: m.id,
      provider: m.provider,
      url: m.url,
      fileSize: m.fileSize,
      verifiedAt: m.verifiedAt?.toISOString() || null,
      isOfficial: m.isOfficial,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await findGame(id);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ game: serializeGame(game) });
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
    const body = await req.json();
    const parsed = updateGameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title;
      const existingSlugs = (await prisma.game.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      })).map((g) => g.slug);
      data.slug = generateSlug(parsed.data.title, existingSlugs);
    }
    if (parsed.data.shortSummary !== undefined) data.shortSummary = parsed.data.shortSummary;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.tags !== undefined) data.tags = JSON.stringify(parsed.data.tags);
    if (parsed.data.coverData !== undefined) data.coverData = parsed.data.coverData;
    if (parsed.data.releaseDate !== undefined) {
      data.releaseDate = parsed.data.releaseDate ? new Date(parsed.data.releaseDate) : null;
    }
    if (parsed.data.systemRequirements !== undefined) {
      data.systemRequirements = parsed.data.systemRequirements
        ? JSON.stringify(parsed.data.systemRequirements)
        : null;
    }
    if (parsed.data.scanStatus !== undefined) {
      data.scanStatus = parsed.data.scanStatus;
    }

    const game = await prisma.game.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, username: true, image: true } },
        screenshots: { orderBy: { createdAt: "asc" } },
        mirrors: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ game: serializeGame(game) });
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
