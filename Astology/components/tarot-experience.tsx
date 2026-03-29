"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "@/components/client-providers";
import {
  consumeTarotDraw,
  getRemainingTarotDraws,
  hasTarotJournalAccess,
  hasTarotCrossReadingAccess,
  hasTarotPremiumAccess,
  unlockFeatureWithCoins
} from "@/lib/plans";
import {
  tarotDecks,
  tarotSpreads,
  type TarotDeckId,
  type TarotReading,
  type TarotSpreadId
} from "@/lib/tarot-data";

const JOURNAL_STORAGE_KEY = "astology-tarot-journal";
const TAROT_UNLOCK_COST = 30;

type JournalResponse = {
  entries: TarotReading[];
};

function getDefaultVariant(spreadId: TarotSpreadId) {
  return tarotSpreads[spreadId].variants[0]?.id ?? "";
}

function getCardGlyph(cardName: string) {
  if (/sun/i.test(cardName)) return "☀";
  if (/moon/i.test(cardName)) return "☾";
  if (/star/i.test(cardName)) return "✦";
  if (/wheel/i.test(cardName)) return "◎";
  if (/world/i.test(cardName)) return "◌";
  if (/love|cups/i.test(cardName)) return "♡";
  if (/swords/i.test(cardName)) return "⚔";
  if (/wands/i.test(cardName)) return "✶";
  if (/pentacles/i.test(cardName)) return "⬡";
  return "✧";
}

function formatStamp(input: string) {
  return new Date(input).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function readLocalJournal() {
  if (typeof window === "undefined") {
    return [] as TarotReading[];
  }

  const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
  if (!raw) {
    return [] as TarotReading[];
  }

  try {
    const parsed = JSON.parse(raw) as TarotReading[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isTarotReading(value: TarotReading | { error?: string }): value is TarotReading {
  return !("error" in value);
}

export function TarotExperience() {
  const { user, setUser } = useContext(AppContext);
  const [deckId, setDeckId] = useState<TarotDeckId>("rider-waite");
  const [spreadId, setSpreadId] = useState<TarotSpreadId>("single");
  const [layoutVariant, setLayoutVariant] = useState(getDefaultVariant("single"));
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [dailyReading, setDailyReading] = useState<TarotReading | null>(null);
  const [journal, setJournal] = useState<TarotReading[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [journalLoading, setJournalLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const captureRef = useRef<HTMLDivElement>(null);
  const hasPremium = hasTarotPremiumAccess(user);
  const hasCrossReadings = hasTarotCrossReadingAccess(user);
  const hasJournal = hasTarotJournalAccess(user);
  const spread = tarotSpreads[spreadId];
  const deck = tarotDecks.find((item) => item.id === deckId) ?? tarotDecks[0];
  const remainingDraws = getRemainingTarotDraws(user, spreadId);
  const birthProfile = user.birthProfile;
  const activeVariant =
    spreadId === "three" && layoutVariant
      ? spread.variants.find((item) => item.id === layoutVariant)
      : undefined;

  useEffect(() => {
    setLayoutVariant(getDefaultVariant(spreadId));
  }, [spreadId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journal));
  }, [journal]);

  useEffect(() => {
    let cancelled = false;

    async function loadJournal() {
      setJournalLoading(true);
      const localFallback = readLocalJournal();

      try {
        const response = await fetch(`/api/tarot/journal?userId=${encodeURIComponent(user.id)}`, {
          cache: "no-store"
        });
        if (!response.ok) {
          throw new Error("Could not load journal.");
        }

        const data = (await response.json()) as JournalResponse;
        if (cancelled) {
          return;
        }

        setJournal(data.entries ?? []);

        if (!data.entries.length && localFallback.length) {
          let latestEntries = localFallback;
          for (const entry of [...localFallback].reverse()) {
            const migrateResponse = await fetch("/api/tarot/journal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                reading: entry
              })
            });

            if (migrateResponse.ok) {
              const migrated = (await migrateResponse.json()) as JournalResponse;
              latestEntries = migrated.entries;
            }
          }

          if (!cancelled) {
            setJournal(latestEntries);
          }
        }
      } catch {
        if (!cancelled) {
          setJournal(localFallback);
        }
      } finally {
        if (!cancelled) {
          setJournalLoading(false);
        }
      }
    }

    if (user.id) {
      void loadJournal();
    }

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadDailyCard() {
      setDailyLoading(true);

      try {
        const response = await fetch("/api/tarot/draw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "daily",
            deckId,
            spreadId: "single",
            question: "",
            userName: user.name || "Seeker",
            birthProfile,
            plan: user.plan
          })
        });

        const data = (await response.json()) as TarotReading | { error?: string };
        if (!response.ok || !isTarotReading(data)) {
          if (!cancelled) {
            setDailyReading(null);
          }
          return;
        }

        if (!cancelled) {
          setDailyReading(data);
        }
      } finally {
        if (!cancelled) {
          setDailyLoading(false);
        }
      }
    }

    void loadDailyCard();

    return () => {
      cancelled = true;
    };
  }, [deckId, user.name, user.plan, birthProfile]);

  const recurringInsight = useMemo(() => {
    if (journal.length < 2) {
      return "Save a few readings and the journal will start surfacing repeating card patterns for you.";
    }

    const counts = new Map<string, number>();
    journal.forEach((entry) => {
      entry.cards.forEach((card) => {
        counts.set(card.name, (counts.get(card.name) ?? 0) + 1);
      });
    });

    const topCards = [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count}x)`);

    return `Your journal keeps circling back to ${topCards.join(", ")}. Repeating cards usually point to a lesson or transition that is asking for conscious attention rather than a one-time event.`;
  }, [journal]);

  const usageCopy = useMemo(() => {
    if (hasPremium) {
      return "Unlimited tarot draws are active on your current plan.";
    }

    if (spreadId === "single") {
      return `${remainingDraws ?? 0} single-card pull remaining today on the free tier.`;
    }

    if (spreadId === "three") {
      return `${remainingDraws ?? 0} three-card spread remaining today on the free tier.`;
    }

    if (spreadId === "yes-no" || spreadId === "new-moon") {
      return "This spread stays open on the free tier.";
    }

    return "This spread is part of the paid tarot studio.";
  }, [hasPremium, remainingDraws, spreadId]);

  async function requestReading(mode: "spread" | "daily") {
    setError("");
    setStatus("");

    if (mode === "spread") {
      if (!hasPremium && !spread.free) {
        setError("This spread is locked on the free tier. Upgrade or unlock premium tarot with coins to continue.");
        return;
      }

      if (remainingDraws !== null && remainingDraws <= 0) {
        setError("You have used this free tarot allowance for today. You can still use Yes / No or unlock premium tarot.");
        return;
      }
    }

    if (mode === "spread") {
      setLoading(true);
    } else {
      setDailyLoading(true);
    }

    try {
      const response = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          deckId,
          spreadId,
          question,
          layoutVariant,
          userName: user.name || "Seeker",
          birthProfile,
          plan: user.plan
        })
      });

      const data = (await response.json()) as TarotReading | { error?: string };
      if (!response.ok || !isTarotReading(data)) {
        setError(!isTarotReading(data) && data.error ? data.error : "The reading could not be generated just now.");
        return;
      }

      if (mode === "daily") {
        setDailyReading(data);
        setStatus("Your daily card has been refreshed for the current deck.");
        return;
      }

      setReading(data);
      setNotes("");
      setStatus(`Your ${data.spreadLabel.toLowerCase()} is ready.`);
      if (!hasPremium) {
        setUser(consumeTarotDraw(user, spreadId));
      }
    } finally {
      setLoading(false);
      setDailyLoading(false);
    }
  }

  async function saveReadingToJournal() {
    if (!reading) {
      return;
    }

    if (!hasJournal) {
      setError("The tarot journal is available on Chandra, Surya, Nakshatra, or through the tarot coin unlock.");
      return;
    }

    setJournalLoading(true);

    try {
      const entry = { ...reading, notes: notes.trim() };
      const response = await fetch("/api/tarot/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          reading: entry
        })
      });

      if (!response.ok) {
        throw new Error("Could not save journal entry.");
      }

      const data = (await response.json()) as JournalResponse;
      setJournal(data.entries);
      setStatus("Saved to your tarot journal.");
    } catch {
      const nextJournal = [{ ...reading, notes: notes.trim() }, ...journal.filter((entry) => entry.id !== reading.id)].slice(0, 30);
      setJournal(nextJournal);
      setStatus("Saved locally. Server sync can resume the next time the journal API is available.");
    } finally {
      setJournalLoading(false);
      setError("");
      setNotes("");
    }
  }

  async function saveSpreadAsImage() {
    if (!captureRef.current) {
      return;
    }

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#081120",
      scale: 2
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `astology-tarot-${reading?.id || "spread"}.png`;
    link.click();
    setStatus("Saved a shareable image of your spread.");
  }

  async function removeJournalEntry(readingId: string) {
    setError("");
    setStatus("");
    setJournalLoading(true);

    try {
      const response = await fetch("/api/tarot/journal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          readingId
        })
      });

      if (!response.ok) {
        throw new Error("Could not delete journal entry.");
      }

      const data = (await response.json()) as JournalResponse;
      setJournal(data.entries);
      setStatus("Removed the reading from your journal.");
    } catch {
      setJournal((current) => current.filter((entry) => entry.id !== readingId));
      setStatus("Removed the reading locally.");
    } finally {
      setJournalLoading(false);
    }
  }

  async function showReminderNotification(title: string, body: string) {
    if (typeof window === "undefined" || typeof Notification === "undefined" || Notification.permission !== "granted") {
      setError("Browser notifications are not enabled on this device.");
      return false;
    }

    const options = {
      body,
      tag: `astology-manual-tarot-${Date.now()}`,
      data: { url: "/tarot" }
    };

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js").catch(() => null);
      if (registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    new Notification(title, options);
    return true;
  }

  async function requestReminderPermission() {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      setError("Browser notifications are not supported here.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      setUser({
        ...user,
        notifications: {
          ...user.notifications,
          tarotDailyEnabled: true
        }
      });
      setStatus("Daily tarot reminders are enabled.");
      setError("");
      return;
    }

    setError("Notification permission was not granted.");
  }

  async function sendTestReminder() {
    const title = dailyReading?.cards[0]?.name
      ? `Your card today is ${dailyReading.cards[0].name}`
      : "Your daily tarot reminder is ready";
    const body = dailyReading?.cardReadings[0]?.insight || "Tap to open your guidance in Astology.";
    const sent = await showReminderNotification(title, body);
    if (sent) {
      setStatus("Test reminder sent.");
      setError("");
    }
  }

  function updateReminderEnabled(enabled: boolean) {
    if (enabled && notificationPermission !== "granted") {
      void requestReminderPermission();
      return;
    }

    setUser({
      ...user,
      notifications: {
        ...user.notifications,
        tarotDailyEnabled: enabled
      }
    });
    setStatus(enabled ? "Daily tarot reminders are enabled." : "Daily tarot reminders are paused.");
    setError("");
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card two-col">
        <div>
          <div className="badge">Tarot Studio</div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
            Daily cards, paid spreads, and cross-reading insight
          </h1>
          <p className="section-copy">
            Draw from Rider-Waite, Thoth, Osho Zen, Lenormand, Angel Oracle, or the branded Vedic Tarot deck.
            Every reading can weave your question together with symbolic card meaning, kundli timing, and numerology resonance.
          </p>

          <div className="grid" style={{ marginTop: 22 }}>
            <select
              className="select"
              value={deckId}
              onChange={(event) => setDeckId(event.target.value as TarotDeckId)}
            >
              {tarotDecks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              className="select"
              value={spreadId}
              onChange={(event) => setSpreadId(event.target.value as TarotSpreadId)}
            >
              {Object.values(tarotSpreads).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.free ? "" : " • Chandra+"}
                </option>
              ))}
            </select>

            {spreadId === "three" && spread.variants.length ? (
              <select
                className="select"
                value={layoutVariant}
                onChange={(event) => setLayoutVariant(event.target.value)}
              >
                {spread.variants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            ) : null}

            <textarea
              className="textarea"
              value={question}
              placeholder="Ask your question. Love, career, money, family, timing, or spiritual guidance all work well here."
              onChange={(event) => setQuestion(event.target.value)}
            />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="primary-btn" onClick={() => void requestReading("spread")} disabled={loading}>
                {loading ? "Shuffling cards..." : "Draw This Spread"}
              </button>
              <button className="secondary-btn" onClick={() => void requestReading("daily")} disabled={dailyLoading}>
                {dailyLoading ? "Pulling daily card..." : "Refresh Card of the Day"}
              </button>
            </div>

            {error ? <div style={{ color: "var(--warning)" }}>{error}</div> : null}
            {status ? <div style={{ color: "var(--success)" }}>{status}</div> : null}
          </div>
        </div>

        <div className="glass card" style={{ background: "var(--panel-strong)" }}>
          <div className="badge">{deck.label}</div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            {spread.label}
          </h2>
          <p className="section-copy">{spread.description}</p>
          <p className="section-copy" style={{ marginTop: 14 }}>
            {usageCopy}
          </p>
          <div className="grid" style={{ gap: 10, marginTop: 18 }}>
            <div className="section-copy">Deck flavor: {deck.flavor}</div>
            <div className="section-copy">
              Positions: {(activeVariant?.positions ?? spread.positions).join(" • ")}
            </div>
            <div className="section-copy">
              Cross-reading: {hasCrossReadings ? "Kundli + numerology bridges active." : "Surya and Nakshatra unlock Kundli + numerology bridges."}
            </div>
            <div className="section-copy">
              Journal: {hasJournal ? "Unlocked for this account." : "Locked on the free tier."}
            </div>
          </div>
          {!hasPremium ? (
            <button
              className="secondary-btn"
              style={{ marginTop: 18 }}
              onClick={() => setUser(unlockFeatureWithCoins(user, "tarot-premium", TAROT_UNLOCK_COST))}
            >
              Unlock full tarot studio for {TAROT_UNLOCK_COST} coins
            </button>
          ) : null}
          <p className="section-copy" style={{ marginTop: 18 }}>
            Disclaimer: For entertainment and self-reflection purposes only. Not a substitute for professional advice.
          </p>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
        <div className="glass card">
          <div className="badge">Daily Card of the Day</div>
          {dailyReading ? (
            <>
              <h2 className="section-title" style={{ marginTop: 18 }}>
                {dailyReading.cards[0]?.name} {dailyReading.cards[0]?.orientation === "reversed" ? "↻" : ""}
              </h2>
              <p className="section-copy">{dailyReading.acknowledgement}</p>
              <p className="section-copy" style={{ marginTop: 12 }}>
                {dailyReading.cardReadings[0]?.insight}
              </p>
              <p className="section-copy" style={{ marginTop: 12 }}>
                {dailyReading.affirmation}
              </p>
            </>
          ) : (
            <p className="section-copy">
              {dailyLoading ? "Drawing your daily card..." : "Open the tarot studio with a saved profile to generate a personalized card of the day."}
            </p>
          )}
        </div>

        <div className="glass card">
          <div className="badge">Daily Reminder</div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            Morning tarot reminder settings
          </h2>
          <p className="section-copy">
            {notificationPermission === "granted"
              ? "Browser notifications are active. The app can surface your daily tarot card after your chosen hour when you open Astology."
              : notificationPermission === "denied"
                ? "Notifications are blocked in this browser right now. You can re-enable them in browser settings."
                : notificationPermission === "unsupported"
                  ? "This browser does not support notifications."
                  : "Enable notifications if you want a gentle daily nudge toward your card of the day."}
          </p>
          <div className="grid" style={{ gap: 10 }}>
            <label className="section-copy" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                checked={user.notifications.tarotDailyEnabled}
                onChange={(event) => updateReminderEnabled(event.target.checked)}
              />
              Enable daily tarot reminders
            </label>
            <div>
              <div className="section-copy" style={{ marginBottom: 8 }}>
                Reminder hour
              </div>
              <select
                className="select"
                value={String(user.notifications.tarotReminderHour)}
                onChange={(event) =>
                  setUser({
                    ...user,
                    notifications: {
                      ...user.notifications,
                      tarotReminderHour: Number(event.target.value)
                    }
                  })
                }
              >
                {Array.from({ length: 16 }, (_, index) => index + 6).map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            {notificationPermission !== "granted" ? (
              <button className="secondary-btn" onClick={() => void requestReminderPermission()}>
                Enable Browser Notifications
              </button>
            ) : (
              <button className="secondary-btn" onClick={() => void sendTestReminder()}>
                Send Test Reminder
              </button>
            )}
          </div>

          <div className="grid" style={{ gap: 10, marginTop: 24 }}>
            <div className="badge">Paid Spread Vault</div>
            {[
              "Celtic Cross, Relationship, Career, Year Ahead, Chakra, Shadow, Full Moon, and Eclipse spreads",
              "Tarot journal with notes and repeating-card analysis",
              "Tarot + Kundli and Tarot + Numerology cross-reading on Surya and Nakshatra",
              "Unlimited draws and shareable spread image exports"
            ].map((item) => (
              <div key={item} className="section-copy">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {reading ? (
        <section className="grid" style={{ gap: 20 }}>
          <div ref={captureRef} className="glass card" style={{ overflow: "hidden" }}>
            <div className="badge">{reading.provider === "openai" ? "OpenAI tarot reading" : "Fallback tarot reading"}</div>
            <h2 className="section-title" style={{ marginTop: 18 }}>
              {reading.spreadLabel}
            </h2>
            <p className="section-copy">{reading.acknowledgement}</p>
            {reading.question ? (
              <p className="section-copy" style={{ marginTop: 12 }}>
                Question: {reading.question}
              </p>
            ) : null}

            <div className="tarot-board" style={{ marginTop: 22 }}>
              {reading.cards.map((card, index) => (
                <div key={`${card.id}-${card.positionLabel}-${index}`} className="tarot-stage">
                  <div
                    className={[
                      "tarot-card",
                      card.arcana === "major" ? "tarot-major" : "",
                      card.orientation === "reversed" ? "is-reversed" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="tarot-card-face tarot-card-back">
                      <div style={{ textAlign: "center" }}>
                        <div className="tarot-card-symbol" style={{ margin: "0 auto 16px" }}>
                          {getCardGlyph(card.name)}
                        </div>
                        <div style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Astology Arcana
                        </div>
                        <div className="subtle" style={{ marginTop: 8 }}>
                          Cosmic shuffle
                        </div>
                      </div>
                    </div>

                    <div className="tarot-card-face tarot-card-front">
                      <div className="badge">{card.positionLabel}</div>
                      <div className="tarot-card-symbol">{getCardGlyph(card.name)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{card.name}</div>
                        <div className="subtle" style={{ marginTop: 4 }}>
                          {card.orientation === "upright" ? "Upright" : "Reversed"} • {card.element} • {card.planet}
                        </div>
                      </div>
                      <div className="section-copy">{card.keywords.join(" • ")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="glass card">
              <h3 style={{ marginTop: 0 }}>Card-by-card reading</h3>
              <div className="grid" style={{ gap: 14 }}>
                {reading.cardReadings.map((item) => (
                  <div key={item.positionLabel}>
                    <div style={{ fontWeight: 700 }}>{item.positionLabel}</div>
                    <div className="section-copy">{item.insight}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass card">
              <h3 style={{ marginTop: 0 }}>Unified message</h3>
              <p className="section-copy">{reading.narrative}</p>
              <div className="grid" style={{ gap: 10, marginTop: 18 }}>
                {reading.guidance.map((item, index) => (
                  <div key={item} className="section-copy">
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
              <p className="section-copy" style={{ marginTop: 18 }}>
                {reading.affirmation}
              </p>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="glass card">
              <h3 style={{ marginTop: 0 }}>Tarot + Kundli</h3>
              <p className="section-copy">{reading.crossInsights.kundli}</p>
            </div>
            <div className="glass card">
              <h3 style={{ marginTop: 0 }}>Tarot + Numerology</h3>
              <p className="section-copy">{reading.crossInsights.numerology}</p>
            </div>
          </div>

          <div className="glass card">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="primary-btn" onClick={() => void saveSpreadAsImage()}>
                Save Spread as Image
              </button>
              <button className="secondary-btn" onClick={saveReadingToJournal}>
                Save to Tarot Journal
              </button>
            </div>
            {hasJournal ? (
              <textarea
                className="textarea"
                style={{ marginTop: 18 }}
                value={notes}
                placeholder="Add your private notes for this reading..."
                onChange={(event) => setNotes(event.target.value)}
              />
            ) : (
              <p className="section-copy" style={{ marginTop: 18 }}>
                Tarot journal notes unlock on paid plans or through the premium tarot coin unlock.
              </p>
            )}
          </div>
        </section>
      ) : null}

      <section className="grid" style={{ gap: 20 }}>
        <div className="glass card">
          <div className="badge">Tarot Journal</div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            Reading history and recurring-card patterns
          </h2>
          <p className="section-copy">
            {journalLoading ? "Syncing your journal..." : recurringInsight}
          </p>
        </div>

        {hasJournal ? (
          <div className="tarot-history-grid">
            {journal.length ? (
              journal.map((entry) => (
                <div key={entry.id} className="glass card">
                  <div className="badge">{entry.spreadLabel}</div>
                  <h3 style={{ marginTop: 16 }}>{entry.cards.map((card) => card.name).join(" • ")}</h3>
                  <p className="section-copy">{entry.question || "General guidance reading"}</p>
                  <p className="section-copy" style={{ marginTop: 10 }}>
                    Saved {formatStamp(entry.createdAt)}
                  </p>
                  {entry.notes ? (
                    <p className="section-copy" style={{ marginTop: 10 }}>
                      Notes: {entry.notes}
                    </p>
                  ) : null}
                  <button
                    className="secondary-btn"
                    style={{ marginTop: 16 }}
                    onClick={() => void removeJournalEntry(entry.id)}
                  >
                    Remove Entry
                  </button>
                </div>
              ))
            ) : (
              <div className="glass card">
                <p className="section-copy">
                  Your journal is empty right now. Save a reading and the history plus pattern tracker will start building.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass card">
            <p className="section-copy">
              The journal, repeat-card analysis, and last-30-reading history are part of the premium tarot studio.
              Unlock it with your subscription or spend coins for one-off access.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
