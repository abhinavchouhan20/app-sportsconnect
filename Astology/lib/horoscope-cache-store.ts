import { promises as fs } from "node:fs";
import path from "node:path";
import type { HoroscopeResponse } from "@/lib/horoscope-types";

type HoroscopeCacheStore = {
  entries: Record<
    string,
    {
      expiresAt: string;
      value: HoroscopeResponse;
    }
  >;
};

const STORE_PATH = path.join(process.cwd(), "data", "horoscope-cache.json");

async function ensureStore(): Promise<HoroscopeCacheStore> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as HoroscopeCacheStore;
    return {
      entries: parsed.entries ?? {}
    };
  } catch {
    const initialStore = { entries: {} } satisfies HoroscopeCacheStore;
    await writeStore(initialStore);
    return initialStore;
  }
}

async function writeStore(store: HoroscopeCacheStore) {
  const tempPath = `${STORE_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tempPath, STORE_PATH);
}

export async function getCachedHoroscope(key: string) {
  const store = await ensureStore();
  const cached = store.entries[key];

  if (!cached) {
    return null;
  }

  if (Date.now() > new Date(cached.expiresAt).getTime()) {
    delete store.entries[key];
    await writeStore(store);
    return null;
  }

  return cached.value;
}

export async function setCachedHoroscope(key: string, value: HoroscopeResponse, ttlMs: number) {
  const store = await ensureStore();
  store.entries[key] = {
    value,
    expiresAt: new Date(Date.now() + ttlMs).toISOString()
  };
  await writeStore(store);
}
