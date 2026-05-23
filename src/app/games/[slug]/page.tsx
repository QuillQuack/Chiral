import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GameDetailClient from "./GameDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getGame(slug: string) {
  const game = await prisma.game.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      author: { select: { id: true, username: true, image: true } },
      screenshots: { orderBy: { createdAt: "asc" } },
      mirrors: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!game) return null;

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
    systemRequirements: game.systemRequirements
      ? JSON.parse(game.systemRequirements)
      : null,
    reportCount: game.reportCount,
    createdAt: game.createdAt.toISOString(),
    author: game.author
      ? {
          id: game.author.id,
          username: game.author.username,
          image: game.author.image,
        }
      : null,
    screenshots: game.screenshots.map((s) => ({
      id: s.id,
      imageUrl: s.imageUrl,
      createdAt: s.createdAt.toISOString(),
    })),
    mirrors: game.mirrors.map((m) => ({
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    return { title: "Game Not Found — Chiral Downloads" };
  }

  return {
    title: `${game.title} — Chiral Downloads`,
    description: game.shortSummary || game.description.slice(0, 160),
    openGraph: {
      title: game.title,
      description: game.shortSummary || game.description.slice(0, 160),
      images: game.coverData ? [{ url: game.coverData }] : [],
    },
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  return <GameDetailClient game={game} />;
}
