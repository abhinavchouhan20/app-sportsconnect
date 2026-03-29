import { NextResponse } from "next/server";
import { kundliFormSchema } from "@/lib/schema";
import { buildKundliSnapshot } from "@/lib/kundli-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = kundliFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    return NextResponse.json(buildKundliSnapshot(parsed.data));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kundli generation failed." },
      { status: 400 }
    );
  }
}
