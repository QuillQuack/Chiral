import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateBioSchema } from "@/lib/validations/profile";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateBioSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Invalid bio" },
        { status: 400 }
      );
    }

    const { bio } = parsed.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { bio },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json({ bio: user.bio, user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
