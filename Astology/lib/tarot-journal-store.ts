import { promises as fs } from "node:fs";
import path from "node:path";
import type { TarotReading } from "@/lib/tarot-data";

type TarotJournalStore = {
  users: Record<string, TarotReading[]>;
};

const STORE_PATH = path.join(process.cwd(), "data", "tarot-journal.json");

async function ensureStore(): Promise<TarotJournalStore> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as TarotJournalStore;
    return {
      users: parsed.users ?? {}
    };
  } catch {
    const initialStore = { users: {} } satisfies TarotJournalStore;
    await writeStore(initialStore);
    return initialStore;
  }
}

async function writeStore(store: TarotJournalStore) {
  const tempPath = `${STORE_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tempPath, STORE_PATH);
}

export async function getTarotJournalEntries(userId: string) {
  const store = await ensureStore();
  return store.users[userId] ?? [];
}

export async function saveTarotJournalEntry(userId: string, reading: TarotReading) {
  const store = await ensureStore();
  const existing = store.users[userId] ?? [];
  const nextEntries = [{ ...reading, notes: reading.notes?.trim() ?? "" }, ...existing.filter((item) => item.id !== reading.id)].slice(0, 30);
  store.users[userId] = nextEntries;
  await writeStore(store);
  return nextEntries;
}

export async function deleteTarotJournalEntry(userId: string, readingId: string) {
  const store = await ensureStore();
  const existing = store.users[userId] ?? [];
  const nextEntries = existing.filter((item) => item.id !== readingId);
  store.users[userId] = nextEntries;
  await writeStore(store);
  return nextEntries;
}
