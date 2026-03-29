"use client";

import { useContext, useEffect } from "react";
import { AppContext } from "@/components/client-providers";
import type { TarotReading } from "@/lib/tarot-data";

function getTodayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function isTarotReading(value: TarotReading | { error?: string }): value is TarotReading {
  return !("error" in value);
}

export function DailyTarotNotifier() {
  const { user, setUser } = useContext(AppContext);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user.notifications.tarotDailyEnabled) {
      return;
    }

    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    const now = new Date();
    const today = getTodayStamp();
    if (user.notifications.tarotLastSentDate === today) {
      return;
    }

    if (now.getHours() < user.notifications.tarotReminderHour) {
      return;
    }

    let cancelled = false;

    async function sendReminder() {
      const response = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "daily",
          deckId: "rider-waite",
          spreadId: "single",
          question: "",
          userName: user.name || "Seeker",
          birthProfile: user.birthProfile,
          plan: user.plan
        })
      });

      const data = (await response.json()) as TarotReading | { error?: string };
      if (!response.ok || !isTarotReading(data) || cancelled) {
        return;
      }

      const cardName = data.cards[0]?.name || "The cards";
      const body = `${data.cardReadings[0]?.insight || data.affirmation} Tap to open your guidance.`;
      const options = {
        body,
        tag: `astology-daily-tarot-${today}`,
        data: { url: "/tarot" }
      };

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration("/sw.js").catch(() => null);
        if (registration) {
          await registration.showNotification(`Your card today is ${cardName}`, options);
        } else {
          new Notification(`Your card today is ${cardName}`, options);
        }
      } else {
        new Notification(`Your card today is ${cardName}`, options);
      }

      if (!cancelled) {
        setUser({
          ...user,
          notifications: {
            ...user.notifications,
            tarotLastSentDate: today
          }
        });
      }
    }

    void sendReminder();

    return () => {
      cancelled = true;
    };
  }, [setUser, user]);

  return null;
}
