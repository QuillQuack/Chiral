import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const report = await prisma.safetyReport.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, username: true } },
      reviewer: { select: { id: true, username: true } },
      game: { select: { id: true, title: true } },
      post: { select: { id: true, slug: true, title: true } },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { status } = await req.json();

    if (!["PENDING", "FLAGGED", "REVIEWED", "DISMISSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const report = await prisma.safetyReport.update({
      where: { id },
      data: {
        status,
        reviewerId: session.user.id,
        reviewedAt: new Date(),
      },
      include: {
        reporter: { select: { id: true, username: true } },
        reviewer: { select: { id: true, username: true } },
        game: { select: { id: true, title: true } },
        post: { select: { id: true, slug: true, title: true } },
      },
    });

    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
