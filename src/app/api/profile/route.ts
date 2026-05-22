import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { username, image } = parsed.data;
    const data: Record<string, unknown> = {};

    if (username !== undefined) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: session.user.id } },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }

      data.username = username;
    }

    if (image !== undefined) {
      if (image !== null) {
        const bufferSize = Buffer.byteLength(image, "utf8");
        if (bufferSize > 7_000_000) {
          return NextResponse.json(
            { error: "Image must be under 5MB" },
            { status: 400 }
          );
        }
      }
      data.image = image;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
