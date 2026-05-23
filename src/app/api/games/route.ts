import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { generateSlug } from "@/lib/slug";
import { createGameSchema } from "@/lib/validations/game";

function serializeGame(g: any) {
  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    shortSummary: g.shortSummary,
    description: g.description,
    tags: JSON.parse(g.tags) as string[],
    rating: g.rating,
    downloadCount: g.downloadCount,
    scanStatus: g.scanStatus,
    coverData: g.coverData,
    sha256: g.sha256,
    verifiedAt: g.verifiedAt?.toISOString() || null,
    releaseDate: g.releaseDate?.toISOString() || null,
    systemRequirements: g.systemRequirements ? JSON.parse(g.systemRequirements) : null,
    reportCount: g.reportCount,
    createdAt: g.createdAt.toISOString(),
    author: g.author
      ? { id: g.author.id, username: g.author.username, image: g.author.image }
      : null,
    screenshots: g.screenshots
      ? g.screenshots.map((s: any) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          createdAt: s.createdAt.toISOString(),
        }))
      : undefined,
    mirrors: g.mirrors
      ? g.mirrors.map((m: any) => ({
          id: m.id,
          provider: m.provider,
          url: m.url,
          fileSize: m.fileSize,
          verifiedAt: m.verifiedAt?.toISOString() || null,
          isOfficial: m.isOfficial,
          createdAt: m.createdAt.toISOString(),
        }))
      : undefined,
  };
}

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
      include: { author: { select: { id: true, username: true, image: true } } },
    });

    return NextResponse.json({ games: games.map(serializeGame) });
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
    const body = await req.json();
    const parsed = createGameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, tags, coverData, shortSummary, releaseDate, systemRequirements } = parsed.data;
    const { mirrorUrl, mirrorFileSize } = body;

    const existingSlugs = (await prisma.game.findMany({ select: { slug: true } })).map((g) => g.slug);
    const slug = generateSlug(title, existingSlugs);
    const tagsStr = JSON.stringify(tags || []);
    const sysReqsStr = systemRequirements ? JSON.stringify(systemRequirements) : null;

    const game = await prisma.game.create({
      data: {
        slug,
        title,
        shortSummary: shortSummary || null,
        description,
        tags: tagsStr,
        coverData: coverData || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        systemRequirements: sysReqsStr,
        authorId: session.user.id,
        mirrors: mirrorUrl
          ? {
              create: {
                provider: "MEGA",
                url: mirrorUrl,
                fileSize: mirrorFileSize || null,
                verifiedAt: new Date(),
              },
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, username: true, image: true } },
        mirrors: true,
      },
    });

    return NextResponse.json({ game: serializeGame(game) });
  } catch (err) {
    console.error("Failed to create game:", err);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
