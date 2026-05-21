import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [reports, total] = await Promise.all([
    prisma.safetyReport.findMany({
      where,
      include: {
        reporter: { select: { id: true, username: true } },
        reviewer: { select: { id: true, username: true } },
        game: { select: { id: true, title: true } },
        post: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.safetyReport.count({ where }),
  ]);

  return NextResponse.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reason, description, gameId, postId } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    if (!gameId && !postId) {
      return NextResponse.json({ error: "gameId or postId is required" }, { status: 400 });
    }

    const report = await prisma.safetyReport.create({
      data: {
        reason,
        description: description || null,
        reporterId: session.user.id,
        gameId: gameId || null,
        postId: postId || null,
      },
      include: {
        reporter: { select: { id: true, username: true } },
      },
    });

    // auto-flag: count reports for the target
    const targetWhere = gameId
      ? { gameId, status: { notIn: ["DISMISSED", "REVIEWED"] } }
      : { postId, status: { notIn: ["DISMISSED", "REVIEWED"] } };

    const reportCount = await prisma.safetyReport.count({ where: targetWhere });

    if (reportCount >= 5 && gameId) {
      await prisma.game.update({
        where: { id: gameId },
        data: { reportCount },
      });
    }

    if (reportCount >= 3) {
      await prisma.safetyReport.updateMany({
        where: { ...targetWhere, status: "PENDING" },
        data: { status: "FLAGGED" },
      });
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
