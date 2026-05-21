import { prisma } from "./prisma";

export async function checkPostCooldown(userId: string): Promise<number | null> {
  const last = await prisma.post.findFirst({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!last) return null;

  const elapsed = Date.now() - last.createdAt.getTime();
  const cooldown = 30_000; // 30s
  if (elapsed < cooldown) return Math.ceil((cooldown - elapsed) / 1000);
  return null;
}

export async function checkCommentCooldown(userId: string): Promise<number | null> {
  const last = await prisma.comment.findFirst({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!last) return null;

  const elapsed = Date.now() - last.createdAt.getTime();
  const cooldown = 15_000; // 15s
  if (elapsed < cooldown) return Math.ceil((cooldown - elapsed) / 1000);
  return null;
}
