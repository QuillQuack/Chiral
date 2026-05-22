import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validations/auth";
import { enforceRateLimit, recordRateLimit } from "@/lib/rate-limit";
import { createVerificationToken, sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = emailSchema.safeParse(body.email);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const email = parsed.data;

    await enforceRateLimit(email, "resend_verification");

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    const token = await createVerificationToken(user.id, email);
    await sendVerificationEmail(email, token);
    await recordRateLimit(email, "resend_verification");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err && (err as { status: number }).status === 429) {
      return NextResponse.json(
        { error: err.message },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
