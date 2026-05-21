import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, authorId: true, deletedAt: true },
  });

  if (!comment || comment.deletedAt) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_commentId: { userId: session.user.id, commentId: comment.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.user.update({
      where: { id: comment.authorId },
      data: { reputation: { decrement: 2 } },
    });
    return NextResponse.json({ liked: false, likeCount: await prisma.like.count({ where: { commentId: comment.id } }) });
  }

  await prisma.like.create({
    data: { userId: session.user.id, commentId: comment.id },
  });

  if (comment.authorId !== session.user.id) {
    await prisma.user.update({
      where: { id: comment.authorId },
      data: { reputation: { increment: 2 } },
    });
  }

  const likeCount = await prisma.like.count({ where: { commentId: comment.id } });
  return NextResponse.json({ liked: true, likeCount });
}
