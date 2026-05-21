import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, pinned: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const updated = await prisma.post.update({
    where: { slug },
    data: { pinned: !post.pinned },
    select: { pinned: true },
  });

  return NextResponse.json({ pinned: updated.pinned });
}
