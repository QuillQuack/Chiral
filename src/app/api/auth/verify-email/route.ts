import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, recordRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    await enforceRateLimit(ip, "verify_email");

    const token = req.nextUrl.searchParams.get("token");
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 404 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Verification link has expired" },
        { status: 410 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { verificationToken: token },
          { email: verificationToken.identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verificationToken: null,
          verificationExpires: null,
        },
      });
      await tx.verificationToken.delete({
        where: { token },
      });
    });

    await recordRateLimit(ip, "verify_email");

    return NextResponse.json({ success: true, alreadyVerified: false });
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err && (err as { status: number }).status === 429) {
      return NextResponse.json(
        { error: err.message },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
