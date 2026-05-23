import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const SCREENSHOTS_DIR = join(process.cwd(), "public", "uploads", "games");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SCREENSHOTS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await prisma.game.findFirst({
      where: { OR: [{ slug: id }, { id }] },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const screenshots = await prisma.gameScreenshot.findMany({
      where: { gameId: game.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      screenshots: screenshots.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch screenshots" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const game = await prisma.game.findFirst({
      where: { OR: [{ slug: id }, { id }] },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const count = await prisma.gameScreenshot.count({ where: { gameId: game.id } });
    if (count >= MAX_SCREENSHOTS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_SCREENSHOTS} screenshots allowed` },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, WebP, or GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      );
    }

    const ext = file.type.split("/")[1] || "png";
    const fileName = `${randomUUID()}.${ext}`;
    const gameDir = join(SCREENSHOTS_DIR, game.id, "screenshots");
    mkdirSync(gameDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(gameDir, fileName), buffer);

    const imageUrl = `/uploads/games/${game.id}/screenshots/${fileName}`;

    const screenshot = await prisma.gameScreenshot.create({
      data: {
        imageUrl,
        gameId: game.id,
      },
    });

    return NextResponse.json({
      screenshot: {
        id: screenshot.id,
        imageUrl: screenshot.imageUrl,
        createdAt: screenshot.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload screenshot" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !isAdmin(session.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { screenshotId } = await req.json();

    if (!screenshotId) {
      return NextResponse.json({ error: "screenshotId is required" }, { status: 400 });
    }

    const screenshot = await prisma.gameScreenshot.findUnique({
      where: { id: screenshotId },
    });

    if (!screenshot) {
      return NextResponse.json({ error: "Screenshot not found" }, { status: 404 });
    }

    const filePath = join(process.cwd(), "public", screenshot.imageUrl);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await prisma.gameScreenshot.delete({ where: { id: screenshotId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete screenshot" }, { status: 500 });
  }
}
