"use client";

import { useContext, useEffect } from "react";
import { AppContext } from "@/components/client-providers";
import type { HoroscopeResponse } from "@/lib/horoscope-types";

function getTodayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function isHoroscopeResponse(value: HoroscopeResponse | { error?: string }): value is HoroscopeResponse {
  return !("error" in value);
}

export function DailyHoroscopeNotifier() {
  const { user, setUser } = useContext(AppContext);

  useEffect(() => {
    if (!user.notifications.horoscopeDailyEnabled) {
      return;
    }

    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    const now = new Date();
    const today = getTodayStamp();
    if (user.notifications.horoscopeLastSentDate === today) {
      return;
    }

    if (now.getHours() < user.notifications.horoscopeReminderHour) {
      return;
    }

    let cancelled = false;

    async function sendReminder() {
      const response = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign: user.notifications.horoscopePreferredSign,
          period: "daily",
          system: user.notifications.horoscopeSystem,
          plan: user.plan,
          userName: user.name || "Seeker",
          birthProfile: user.birthProfile,
          location: {
            place: user.birthProfile.placeOfBirth || "New York",
            latitude: user.birthProfile.latitude,
            longitude: user.birthProfile.longitude,
            timezone: user.birthProfile.timezone
          }
        })
      });

      const data = (await response.json()) as HoroscopeResponse | { error?: string };
      if (!response.ok || !isHoroscopeResponse(data) || cancelled) {
        return;
      }

      const title = `Your ${data.sign} horoscope is ready`;
      const body = `${data.reading.guidance} Tap to open today's guidance.`;
      const options = {
        body,
        tag: `astology-daily-horoscope-${today}`,
        data: { url: "/horoscope" }
      };

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration().catch(() => null);
        if (registration) {
          await registration.showNotification(title, options);
        } else {
          new Notification(title, options);
        }
      } else {
        new Notification(title, options);
      }

      if (!cancelled) {
        setUser({
          ...user,
          notifications: {
            ...user.notifications,
            horoscopeLastSentDate: today
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
