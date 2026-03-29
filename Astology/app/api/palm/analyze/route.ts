import { NextResponse } from "next/server";
import { palmAnalyzeSchema } from "@/lib/schema";
import { analyzePalmImage } from "@/lib/palm-analysis";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = palmAnalyzeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reading = await analyzePalmImage(parsed.data);
  return NextResponse.json(reading);
}
