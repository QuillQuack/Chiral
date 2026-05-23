import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { createDownloadMirrorSchema } from "@/lib/validations/game";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; mirrorId: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { mirrorId } = await params;
    const body = await req.json();
    const parsed = createDownloadMirrorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid mirror data" },
        { status: 400 }
      );
    }

    const mirror = await prisma.downloadMirror.update({
      where: { id: mirrorId },
      data: {
        provider: parsed.data.provider,
        url: parsed.data.url,
        fileSize: parsed.data.fileSize || null,
        verifiedAt: parsed.data.isOfficial ? new Date() : null,
        isOfficial: parsed.data.isOfficial || false,
      },
    });

    return NextResponse.json({
      mirror: {
        id: mirror.id,
        provider: mirror.provider,
        url: mirror.url,
        fileSize: mirror.fileSize,
        verifiedAt: mirror.verifiedAt?.toISOString() || null,
        isOfficial: mirror.isOfficial,
        createdAt: mirror.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update mirror" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; mirrorId: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { mirrorId } = await params;
    await prisma.downloadMirror.delete({ where: { id: mirrorId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete mirror" }, { status: 500 });
  }
}
