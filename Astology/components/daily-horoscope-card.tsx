"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HoroscopeSign, HoroscopeSystem } from "@/lib/horoscope-types";

type PreviewCard = {
  sign: HoroscopeSign;
  symbol: string;
  text: string;
  luckyColor: string;
};

export function DailyHoroscopeCard() {
  const [system, setSystem] = useState<HoroscopeSystem>("vedic");
  const [cards, setCards] = useState<PreviewCard[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      const signs: HoroscopeSign[] = ["Aries", "Taurus", "Gemini"];
      const results = await Promise.all(
        signs.map(async (sign) => {
          const response = await fetch("/api/horoscope", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sign,
              period: "daily",
              system,
              plan: "Free",
              location: { place: "New York" }
            })
          });

          const data = await response.json();
          if (!response.ok) {
            return null;
          }

          return {
            sign,
            symbol: data.reading.symbol as string,
            text: data.reading.guidance as string,
            luckyColor: data.reading.luckyColor as string
          } satisfies PreviewCard;
        })
      );

      if (!cancelled) {
        setCards(results.filter(Boolean) as PreviewCard[]);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [system]);

  return (
    <div className="glass card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div className="badge">Today&apos;s Horoscope</div>
        <select className="select" style={{ width: 180 }} value={system} onChange={(event) => setSystem(event.target.value as HoroscopeSystem)}>
          <option value="vedic">Vedic</option>
          <option value="western">Western</option>
        </select>
      </div>
      <div className="grid" style={{ marginTop: 18 }}>
        {cards.length ? (
          cards.map((entry) => (
            <div
              key={entry.sign}
              style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", padding: 16 }}
            >
              <div style={{ fontWeight: 700 }}>
                {entry.symbol} {entry.sign}
              </div>
              <div className="section-copy" style={{ marginTop: 8 }}>
                {entry.text}
              </div>
              <div className="section-copy" style={{ marginTop: 8 }}>
                Lucky color: {entry.luckyColor}
              </div>
            </div>
          ))
        ) : (
          <div className="section-copy">Loading live sign previews...</div>
        )}
      </div>
      <Link href="/horoscope" className="secondary-btn" style={{ display: "inline-flex", marginTop: 18 }}>
        Open Full Horoscope
      </Link>
    </div>
  );
}
