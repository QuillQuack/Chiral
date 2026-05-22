import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { isDisposableEmail } from "@/lib/disposable-email";
import { enforceRateLimit, recordRateLimit } from "@/lib/rate-limit";
import { createVerificationToken, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    await enforceRateLimit(ip, "register");

    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, username, password } = parsed.data;

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Disposable email addresses are not allowed" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email or username already taken" },
        { status: 409 }
      );
    }

    const hashed = await hash(password, 12);

    const user = await prisma.user.create({
      data: { email, username, password: hashed, role: "USER" },
    });

    await recordRateLimit(ip, "register");

    const token = await createVerificationToken(user.id, email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err && (err as { status: number }).status === 429) {
      return NextResponse.json(
        { error: err.message },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
