import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thirtyMin = 30 * 60 * 1000;
  if (Date.now() - comment.createdAt.getTime() > thirtyMin) {
    return NextResponse.json(
      { error: "Edit window expired (30 minutes)" },
      { status: 403 }
    );
  }

  if (comment.deletedAt) {
    return NextResponse.json({ error: "Cannot edit deleted comment" }, { status: 400 });
  }

  try {
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        editedAt: new Date(),
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    });

    return NextResponse.json({
      comment: {
        id: updated.id,
        content: updated.content,
        edited: true,
        editedAt: updated.editedAt?.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        author: updated.author,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (comment.deletedAt) {
    return NextResponse.json({ error: "Comment already deleted" }, { status: 400 });
  }

  try {
    await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date(), content: "" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
