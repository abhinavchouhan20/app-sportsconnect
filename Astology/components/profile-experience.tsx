"use client";

import { useContext, useState } from "react";
import { AppContext } from "@/components/client-providers";
import type { PlanTier } from "@/lib/types";
import { findBirthplacePreset } from "@/lib/location-db";
import {
  hasHoroscopePersonalizationAccess,
  getRemainingChatQuestions,
  hasHoroscopePremiumAccess,
  hasKundliRareChartAccess,
  hasKundliPremiumAccess,
  hasPalmPremiumAccess,
  hasTarotCrossReadingAccess,
  hasTarotPremiumAccess
} from "@/lib/plans";

export function ProfileExperience() {
  const { user, setUser } = useContext(AppContext);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [plan, setPlan] = useState<PlanTier>(user.plan);
  const [birthProfile, setBirthProfile] = useState(user.birthProfile);
  const remaining = getRemainingChatQuestions(user);
  const hasKundliFull = hasKundliPremiumAccess(user);
  const hasRareKundli = hasKundliRareChartAccess(user);
  const hasTarotFull = hasTarotPremiumAccess(user);
  const hasTarotCross = hasTarotCrossReadingAccess(user);
  const hasHoroscopeExtended = hasHoroscopePremiumAccess(user);
  const hasHoroscopePersonalized = hasHoroscopePersonalizationAccess(user);

  const save = () => {
    setUser({ ...user, name, email, plan, birthProfile });
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card two-col">
        <div>
          <div className="badge">Profile & auth scaffold</div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
            Local auth experience ready for Supabase or Firebase
          </h1>
          <p className="section-copy">
            This MVP keeps user profile state in local storage so the app is interactive today. The state shape
            is intentionally small and can be swapped to a real auth provider and database without rewriting the UI.
          </p>
        </div>

        <div className="glass card" style={{ background: "var(--panel-strong)" }}>
          <div className="grid">
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
            <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <input
              className="input"
              type="date"
              value={birthProfile.dateOfBirth}
              onChange={(event) =>
                setBirthProfile((current) => ({ ...current, dateOfBirth: event.target.value }))
              }
            />
            <input
              className="input"
              type="time"
              value={birthProfile.timeOfBirth}
              onChange={(event) =>
                setBirthProfile((current) => ({ ...current, timeOfBirth: event.target.value }))
              }
            />
            <input
              className="input"
              value={birthProfile.placeOfBirth}
              placeholder="Place of birth"
              onChange={(event) => {
                const placeOfBirth = event.target.value;
                const preset = findBirthplacePreset(placeOfBirth);
                setBirthProfile((current) => ({
                  ...current,
                  placeOfBirth,
                  latitude: preset ? String(preset.latitude) : current.latitude,
                  longitude: preset ? String(preset.longitude) : current.longitude,
                  timezone: preset ? preset.timezone : current.timezone
                }));
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="input"
                value={birthProfile.latitude}
                placeholder="Latitude"
                onChange={(event) =>
                  setBirthProfile((current) => ({ ...current, latitude: event.target.value }))
                }
              />
              <input
                className="input"
                value={birthProfile.longitude}
                placeholder="Longitude"
                onChange={(event) =>
                  setBirthProfile((current) => ({ ...current, longitude: event.target.value }))
                }
              />
            </div>
            <input
              className="input"
              value={birthProfile.timezone}
              placeholder="Timezone"
              onChange={(event) =>
                setBirthProfile((current) => ({ ...current, timezone: event.target.value }))
              }
            />
            <select className="select" value={plan} onChange={(event) => setPlan(event.target.value as PlanTier)}>
              <option value="Free">Always Free</option>
              <option value="Basic">Chandra Basic</option>
              <option value="Premium">Surya Premium</option>
              <option value="VIP">Nakshatra VIP</option>
            </select>
            <button className="primary-btn" onClick={save}>
              Save Profile
            </button>
          </div>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {[
          ["Saved readings", "Palm and kundli history will persist here once a database is connected."],
          ["Coin balance", `${user.coins} starter coins loaded for first-time users.`],
          ["Privacy", "Palm photos should be user-deletable and auto-delete after 30 days in production."],
          [
            "Birth details",
            user.birthProfile.timeOfBirth
              ? `${user.birthProfile.dateOfBirth || "DOB pending"} • ${user.birthProfile.timeOfBirth} • ${user.birthProfile.placeOfBirth || "POB pending"}`
              : "Birth date, birth time, and birthplace can be saved here for kundli autofill."
          ],
          ["Palm access", hasPalmPremiumAccess(user) ? "Full palmistry access is active." : "Only free palm preview is currently active."],
          [
            "Kundli access",
            hasRareKundli
              ? "All 20 varga cards, including D27, D40, D45, and D60, are active."
              : hasKundliFull
                ? "The standard varga gallery is active, while the rare karmic charts stay reserved for Nakshatra VIP."
                : "Only D1 and D9 are unlocked right now."
          ],
          [
            "Tarot access",
            hasTarotCross
              ? "Full tarot studio plus Kundli and numerology cross-readings are active."
              : hasTarotFull
                ? "Paid tarot spreads and the journal are active. Cross-readings unlock on Surya and Nakshatra."
                : "Free tarot draws are active, but the paid tarot studio is still locked."
          ],
          [
            "Horoscope access",
            hasHoroscopePersonalized
              ? "Personalized daily and yearly horoscope layers are active."
              : hasHoroscopeExtended
                ? "Weekly and monthly readings plus Moon-sign and Nakshatra layers are active."
                : "Only the daily Sun-sign horoscope is unlocked right now."
          ],
          [
            "Daily reminders",
            user.notifications.tarotDailyEnabled
              ? `Tarot reminders: ${String(user.notifications.tarotReminderHour).padStart(2, "0")}:00. Horoscope reminders: ${user.notifications.horoscopeDailyEnabled ? `${String(user.notifications.horoscopeReminderHour).padStart(2, "0")}:00 for ${user.notifications.horoscopePreferredSign}` : "off"}.`
              : user.notifications.horoscopeDailyEnabled
                ? `Horoscope reminders are enabled around ${String(user.notifications.horoscopeReminderHour).padStart(2, "0")}:00 for ${user.notifications.horoscopePreferredSign}.`
                : "Daily tarot and horoscope reminders are currently off."
          ],
          ["Chat usage", remaining === null ? "Unlimited questions on this plan." : `${remaining} chat question(s) remaining today.`]
        ].map(([title, copy]) => (
          <div key={title} className="glass card">
            <h2 className="section-title">{title}</h2>
            <p className="section-copy">{copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
