import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { email, username, role } = await req.json();

  if (!email || !username) {
    return NextResponse.json(
      { error: "Email and username are required" },
      { status: 400 }
    );
  }

  const VALID_ROLES = ["USER", "ADMIN", "DATA_ANALYST", "OWNER"];

  if (role && !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  if (role && id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }], NOT: { id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email or username already taken" },
      { status: 409 }
    );
  }

  const updateData: Record<string, string> = { email, username };
  if (role) updateData.role = role;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}
