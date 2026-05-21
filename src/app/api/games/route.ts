import { NextResponse } from "next/server";
import { games } from "@/data/games";

export async function GET() {
  await new Promise((r) => setTimeout(r, 300));
  return NextResponse.json({ games });
}
