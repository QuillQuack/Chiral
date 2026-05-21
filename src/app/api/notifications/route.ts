import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";

  const where: Record<string, unknown> = { recipientId: session.user.id };
  if (unreadOnly) where.read = false;

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      actor: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const parsed = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    actor: n.actor,
    postId: n.postId,
    commentId: n.commentId,
    createdAt: n.createdAt.toISOString(),
  }));

  const unreadCount = await prisma.notification.count({
    where: { recipientId: session.user.id, read: false },
  });

  return NextResponse.json({ notifications: parsed, unreadCount });
}
