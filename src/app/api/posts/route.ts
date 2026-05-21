import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { checkPostCooldown } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const author = searchParams.get("author") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));

  const where: Record<string, unknown> = {};

  if (category) where.category = category;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (author) {
    where.author = { username: { contains: author, mode: "insensitive" } };
  }

  const orderBy: any =
    sort === "popular"
      ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, username: true, role: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const parsed = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    category: p.category,
    pinned: p.pinned,
    author: p.author,
    commentCount: p._count.comments,
    likeCount: p._count.likes,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return NextResponse.json({
    posts: parsed,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cooldown = await checkPostCooldown(session.user.id);
  if (cooldown !== null) {
    return NextResponse.json(
      { error: `Please wait ${cooldown}s before posting again` },
      { status: 429 }
    );
  }

  try {
    const { title, content, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const existingSlugs = (await prisma.post.findMany({ select: { slug: true } })).map((p) => p.slug);
    const slug = generateSlug(title, existingSlugs);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        category: category || "General",
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, username: true, role: true } },
      },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.author,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
