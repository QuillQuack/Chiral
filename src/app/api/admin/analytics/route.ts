import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewAnalytics } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!session || !canViewAnalytics(session.user?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const visits = await prisma.pageVisit.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, url: true },
    orderBy: { createdAt: "asc" },
  });

  // group by date
  const daily: Record<string, number> = {};
  const urlCounts: Record<string, number> = {};
  let total = 0;

  for (const v of visits) {
    const day = v.createdAt.toISOString().slice(0, 10);
    daily[day] = (daily[day] || 0) + 1;
    urlCounts[v.url] = (urlCounts[v.url] || 0) + 1;
    total++;
  }

  // fill missing days with 0
  const days: { date: string; count: number; avg: number; anomaly: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: daily[key] || 0, avg: 0, anomaly: false });
  }

  // 7-day rolling average + anomaly (2 sigma)
  for (let i = 0; i < days.length; i++) {
    const slice = days.slice(Math.max(0, i - 6), i + 1);
    const avg = slice.reduce((s, d) => s + d.count, 0) / slice.length;
    const variance = slice.reduce((s, d) => s + (d.count - avg) ** 2, 0) / slice.length;
    const stddev = Math.sqrt(variance);

    days[i].avg = Math.round(avg * 10) / 10;
    days[i].anomaly = days[i].count > avg + 2 * stddev && slice.length >= 3;
  }

  // top pages
  const topPages = Object.entries(urlCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([url, count]) => ({ url, count }));

  return NextResponse.json({
    total,
    days,
    topPages,
  });
}
