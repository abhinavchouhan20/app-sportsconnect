import { NextResponse } from "next/server";
import { tarotDrawSchema } from "@/lib/schema";
import { drawTarotReading, getDailyTarotReading } from "@/lib/tarot-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = tarotDrawSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const payload =
      parsed.data.mode === "daily"
        ? await getDailyTarotReading(parsed.data)
        : await drawTarotReading(parsed.data);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tarot reading failed." },
      { status: 400 }
    );
  }
}
