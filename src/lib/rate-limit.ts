import { prisma } from "./prisma";

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 60_000, maxAttempts: 5 },
  register: { windowMs: 300_000, maxAttempts: 2 },
  resend_verification: { windowMs: 60_000, maxAttempts: 1 },
  verify_email: { windowMs: 300_000, maxAttempts: 5 },
};

export async function checkRateLimit(
  identifier: string,
  action: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const config = RATE_LIMITS[action];
  if (!config) {
    return { allowed: true, remaining: Infinity, resetIn: 0 };
  }

  const cutoff = new Date(Date.now() - config.windowMs);

  const [count] = await prisma.$transaction(async (tx) => {
    await tx.rateLimit.deleteMany({
      where: {
        identifier,
        action,
        createdAt: { lt: cutoff },
      },
    });

    const count = await tx.rateLimit.count({
      where: {
        identifier,
        action,
        createdAt: { gte: cutoff },
      },
    });

    return [count];
  });

  const oldestInWindow = await prisma.rateLimit.findFirst({
    where: {
      identifier,
      action,
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const resetIn = oldestInWindow
    ? Math.max(0, config.windowMs - (Date.now() - oldestInWindow.createdAt.getTime()))
    : 0;

  const allowed = count < config.maxAttempts;

  return {
    allowed,
    remaining: Math.max(0, config.maxAttempts - count - (allowed ? 0 : 1)),
    resetIn,
  };
}

export async function recordRateLimit(
  identifier: string,
  action: string
): Promise<void> {
  await prisma.rateLimit.create({
    data: { identifier, action },
  });
}

export async function checkPostCooldown(userId: string): Promise<number | null> {
  const last = await prisma.post.findFirst({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!last) return null;

  const elapsed = Date.now() - last.createdAt.getTime();
  const cooldown = 30_000;
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
  const cooldown = 15_000;
  if (elapsed < cooldown) return Math.ceil((cooldown - elapsed) / 1000);
  return null;
}

export async function enforceRateLimit(
  identifier: string,
  action: string
): Promise<void> {
  const result = await checkRateLimit(identifier, action);
  if (!result.allowed) {
    const error = new Error(`Rate limit exceeded. Try again in ${Math.ceil(result.resetIn / 1000)}s.`) as Error & { status: number; resetIn: number };
    error.status = 429;
    error.resetIn = result.resetIn;
    throw error;
  }
}
