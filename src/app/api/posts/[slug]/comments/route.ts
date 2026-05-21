import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCommentCooldown } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";

function buildCommentTree(comments: any[], parentId: string | null = null): any[] {
  return comments
    .filter((c) => c.parentId === parentId)
    .map((c) => ({
      id: c.id,
      content: c.deletedAt ? null : c.content,
      deleted: !!c.deletedAt,
      edited: !!c.editedAt,
      createdAt: c.createdAt.toISOString(),
      editedAt: c.editedAt?.toISOString() || null,
      author: c.author,
      likeCount: c._count?.likes || 0,
      replies: buildCommentTree(comments, c.id),
    }));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: {
      author: { select: { id: true, username: true, role: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const tree = buildCommentTree(comments);
  return NextResponse.json({ comments: tree });
}

async function getCommentDepth(
  commentId: string,
  depth: number = 0
): Promise<number> {
  if (depth >= 3) return depth;
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { parentId: true },
  });
  if (!comment || !comment.parentId) return depth;
  return getCommentDepth(comment.parentId, depth + 1);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, locked: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.locked) {
    return NextResponse.json({ error: "Post is locked" }, { status: 403 });
  }

  const cooldown = await checkCommentCooldown(session.user.id);
  if (cooldown !== null) {
    return NextResponse.json(
      { error: `Please wait ${cooldown}s before commenting again` },
      { status: 429 }
    );
  }

  try {
    const { content, parentId } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true, parentId: true },
      });

      if (!parent || parent.postId !== post.id) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      const depth = await getCommentDepth(parentId, 1);
      if (depth >= 3) {
        return NextResponse.json(
          { error: "Maximum reply depth reached" },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        postId: post.id,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    });

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      if (parentComment) {
        await notify({
          type: "comment_reply",
          recipientId: parentComment.authorId,
          actorId: session.user.id,
          postId: post.id,
          commentId: comment.id,
        });
      }
    } else {
      const postAuthor = await prisma.post.findUnique({
        where: { id: post.id },
        select: { authorId: true },
      });
      if (postAuthor) {
        await notify({
          type: "post_reply",
          recipientId: postAuthor.authorId,
          actorId: session.user.id,
          postId: post.id,
          commentId: comment.id,
        });
      }
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
        parentId: comment.parentId,
        deleted: false,
        edited: false,
        likeCount: 0,
        replies: [],
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
