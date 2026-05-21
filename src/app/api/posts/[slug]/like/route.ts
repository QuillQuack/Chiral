import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: post.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.user.update({
      where: { id: post.authorId },
      data: { reputation: { decrement: 5 } },
    });
    return NextResponse.json({ liked: false, likeCount: await prisma.like.count({ where: { postId: post.id } }) });
  }

  await prisma.like.create({
    data: { userId: session.user.id, postId: post.id },
  });

  if (post.authorId !== session.user.id) {
    await prisma.user.update({
      where: { id: post.authorId },
      data: { reputation: { increment: 5 } },
    });
  }

  const likeCount = await prisma.like.count({ where: { postId: post.id } });
  return NextResponse.json({ liked: true, likeCount });
}
