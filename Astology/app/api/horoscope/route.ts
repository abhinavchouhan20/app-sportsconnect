import { NextResponse } from "next/server";
import { buildHoroscopeResponse } from "@/lib/horoscope-engine";
import { horoscopeRequestSchema } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = horoscopeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    return NextResponse.json(await buildHoroscopeResponse(parsed.data));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate horoscope." },
      { status: 400 }
    );
  }
}
