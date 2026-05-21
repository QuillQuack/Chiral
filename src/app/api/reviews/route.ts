import { NextResponse } from "next/server";
import { reviews } from "@/data/reviews";

export async function GET() {
  await new Promise((r) => setTimeout(r, 200));
  return NextResponse.json({ reviews });
}
