import { NextResponse } from "next/server";
import {
  tarotJournalDeleteSchema,
  tarotJournalQuerySchema,
  tarotJournalSaveSchema
} from "@/lib/schema";
import {
  deleteTarotJournalEntry,
  getTarotJournalEntries,
  saveTarotJournalEntry
} from "@/lib/tarot-journal-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = tarotJournalQuerySchema.safeParse({
    userId: searchParams.get("userId") ?? ""
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entries = await getTarotJournalEntries(parsed.data.userId);
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = tarotJournalSaveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entries = await saveTarotJournalEntry(parsed.data.userId, parsed.data.reading);
  return NextResponse.json({ entries });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const parsed = tarotJournalDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entries = await deleteTarotJournalEntry(parsed.data.userId, parsed.data.readingId);
  return NextResponse.json({ entries });
}
