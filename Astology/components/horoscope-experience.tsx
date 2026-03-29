"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/components/client-providers";
import { findBirthplacePreset } from "@/lib/location-db";
import { hasHoroscopePersonalizationAccess, hasHoroscopePremiumAccess } from "@/lib/plans";
import {
  HOROSCOPE_PERIODS,
  HOROSCOPE_SIGNS,
  HOROSCOPE_SYSTEMS,
  type HoroscopePeriod,
  type HoroscopeResponse,
  type HoroscopeSign,
  type HoroscopeSystem
} from "@/lib/horoscope-types";

function starMeter(score: number) {
  return `${"⭐".repeat(score)}${"☆".repeat(Math.max(0, 5 - score))}`;
}

function iconMeter(score: number, filled: string, empty: string) {
  return `${filled.repeat(score)}${empty.repeat(Math.max(0, 5 - score))}`;
}

function isHoroscopeResponse(value: HoroscopeResponse | { error?: string }): value is HoroscopeResponse {
  return !("error" in value);
}

export function HoroscopeExperience() {
  const { user, setUser } = useContext(AppContext);
  const extendedAccess = hasHoroscopePremiumAccess(user);
  const personalizedAccess = hasHoroscopePersonalizationAccess(user);
  const [sign, setSign] = useState<HoroscopeSign>("Aries");
  const [period, setPeriod] = useState<HoroscopePeriod>("daily");
  const [system, setSystem] = useState<HoroscopeSystem>("vedic");
  const [location, setLocation] = useState({
    place: user.birthProfile.placeOfBirth || "New York",
    latitude: user.birthProfile.latitude || "",
    longitude: user.birthProfile.longitude || "",
    timezone: user.birthProfile.timezone || ""
  });
  const [response, setResponse] = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  async function loadHoroscope() {
    if ((period === "weekly" || period === "monthly") && !extendedAccess) {
      setError("Weekly and monthly horoscopes unlock on Chandra, Surya, and Nakshatra.");
      return;
    }

    if (period === "yearly" && !personalizedAccess) {
      setError("The yearly horoscope is part of Surya Premium and Nakshatra VIP.");
      return;
    }

    setLoading(true);
    setError("");

    const apiResponse = await fetch("/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sign,
        period,
        system,
        plan: user.plan,
        userName: user.name || "Seeker",
        birthProfile: user.birthProfile,
        location
      })
    });

    const data = (await apiResponse.json()) as HoroscopeResponse | { error?: string };
    if (!apiResponse.ok || !isHoroscopeResponse(data)) {
      setError(!isHoroscopeResponse(data) && data.error ? data.error : "Could not generate horoscope right now.");
      setResponse(null);
      setLoading(false);
      return;
    }

    setResponse(data);
    setLoading(false);
  }

  async function requestNotificationPermission() {
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
          horoscopeDailyEnabled: true,
          horoscopePreferredSign: sign,
          horoscopeSystem: system
        }
      });
      setError("");
      return;
    }

    setError("Notification permission was not granted.");
  }

  async function sendTestNotification() {
    if (!response || typeof Notification === "undefined" || Notification.permission !== "granted") {
      setError("Generate a horoscope and enable notifications first.");
      return;
    }

    const title = `Your ${response.sign} horoscope is ready`;
    const body = `${response.reading.guidance} Tap to open today's guidance.`;
    const options = {
      body,
      tag: `astology-horoscope-test-${Date.now()}`,
      data: { url: "/horoscope" }
    };

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration().catch(() => null);
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    }

    new Notification(title, options);
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card two-col">
        <div>
          <div className="badge">Daily Horoscope Engine</div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
            Real transit-based horoscope dashboard
          </h1>
          <p className="section-copy">
            This module uses live Swiss Ephemeris transit data, Panchang timing, and sign-relative house activation
            instead of static prewritten horoscope copy. Free users get the daily sign reading, while paid plans
            unlock longer periods, Moon-sign depth, and natal-chart personalization.
          </p>

          <div className="grid" style={{ marginTop: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <select className="select" value={sign} onChange={(event) => setSign(event.target.value as HoroscopeSign)}>
                {HOROSCOPE_SIGNS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="select"
                value={period}
                onChange={(event) => setPeriod(event.target.value as HoroscopePeriod)}
              >
                {HOROSCOPE_PERIODS.map((item) => (
                  <option key={item} value={item}>
                    {item[0].toUpperCase() + item.slice(1)}
                    {item === "daily" ? "" : " • Premium"}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="select"
              value={system}
              onChange={(event) => setSystem(event.target.value as HoroscopeSystem)}
            >
              {HOROSCOPE_SYSTEMS.map((item) => (
                <option key={item} value={item}>
                  {item === "vedic" ? "Vedic / Sidereal" : "Western / Tropical"}
                </option>
              ))}
            </select>

            <input
              className="input"
              value={location.place}
              placeholder="Current location for Panchang timings"
              onChange={(event) => {
                const place = event.target.value;
                const preset = findBirthplacePreset(place);
                setLocation((current) => ({
                  ...current,
                  place,
                  latitude: preset ? String(preset.latitude) : current.latitude,
                  longitude: preset ? String(preset.longitude) : current.longitude,
                  timezone: preset ? preset.timezone : current.timezone
                }));
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="input"
                value={location.latitude}
                placeholder="Latitude"
                onChange={(event) => setLocation((current) => ({ ...current, latitude: event.target.value }))}
              />
              <input
                className="input"
                value={location.longitude}
                placeholder="Longitude"
                onChange={(event) => setLocation((current) => ({ ...current, longitude: event.target.value }))}
              />
            </div>

            <input
              className="input"
              value={location.timezone}
              placeholder="Timezone"
              onChange={(event) => setLocation((current) => ({ ...current, timezone: event.target.value }))}
            />

            <button className="primary-btn" onClick={() => void loadHoroscope()} disabled={loading}>
              {loading ? "Reading the sky..." : "Generate Horoscope"}
            </button>
            {error ? <div style={{ color: "var(--warning)" }}>{error}</div> : null}
          </div>
        </div>

        <div className="glass card" style={{ background: "var(--panel-strong)" }}>
          <h2 className="section-title">Free vs premium</h2>
          <div className="grid" style={{ gap: 12 }}>
            <div className="section-copy">Free: daily Sun-sign horoscope, lucky color and number, Rahu Kaal, basic Panchang, Sun and Moon alerts, and Mercury retrograde.</div>
            <div className="section-copy">Chandra: weekly and monthly readings, full Panchang, all retrogrades, and Moon-sign plus Nakshatra layers.</div>
            <div className="section-copy">Surya and Nakshatra: personalized daily horoscope and yearly forecast based on your saved chart.</div>
            <div className="badge">
              {personalizedAccess
                ? "Surya / Nakshatra personalization active"
                : extendedAccess
                  ? "Chandra horoscope access active"
                  : "Daily Sun-sign horoscope only"}
            </div>
          </div>
          <div className="grid" style={{ gap: 10, marginTop: 18 }}>
            <div className="badge">Morning Reminder</div>
            <label className="section-copy" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                checked={user.notifications.horoscopeDailyEnabled}
                onChange={(event) => {
                  if (event.target.checked && notificationPermission !== "granted") {
                    void requestNotificationPermission();
                    return;
                  }

                  setUser({
                    ...user,
                    notifications: {
                      ...user.notifications,
                      horoscopeDailyEnabled: event.target.checked,
                      horoscopePreferredSign: sign,
                      horoscopeSystem: system
                    }
                  });
                }}
              />
              Enable daily horoscope reminder
            </label>
            <div>
              <div className="section-copy" style={{ marginBottom: 8 }}>
                Reminder hour
              </div>
              <select
                className="select"
                value={String(user.notifications.horoscopeReminderHour)}
                onChange={(event) =>
                  setUser({
                    ...user,
                    notifications: {
                      ...user.notifications,
                      horoscopeReminderHour: Number(event.target.value),
                      horoscopePreferredSign: sign,
                      horoscopeSystem: system
                    }
                  })
                }
              >
                {Array.from({ length: 8 }, (_, index) => index + 6).map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            {notificationPermission !== "granted" ? (
              <button className="secondary-btn" onClick={() => void requestNotificationPermission()}>
                Enable Browser Notifications
              </button>
            ) : (
              <button className="secondary-btn" onClick={() => void sendTestNotification()}>
                Send Test Horoscope Alert
              </button>
            )}
          </div>
          {!extendedAccess ? (
            <Link href="/shop" className="secondary-btn" style={{ display: "inline-flex", marginTop: 18 }}>
              Unlock Chandra+
            </Link>
          ) : !personalizedAccess ? (
            <Link href="/shop" className="secondary-btn" style={{ display: "inline-flex", marginTop: 18 }}>
              Unlock Surya+
            </Link>
          ) : null}
        </div>
      </section>

      {response ? (
        <>
          <section className="glass card">
            <div className="badge">
              {response.reading.symbol} {response.reading.sign} • {response.reading.dateLabel}
            </div>
            <h2 className="section-title" style={{ marginTop: 18 }}>
              Overall Energy: {starMeter(response.reading.overallRating)}
            </h2>
            <p className="section-copy">
              Lucky Color: {response.reading.luckyColor} • Lucky Number: {response.reading.luckyNumber} • Lucky Time: {response.reading.luckyTime}
            </p>

            <div className="grid" style={{ marginTop: 22, gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Today&apos;s Cosmic Energy</h3>
                <p className="section-copy">{response.reading.overallEnergy}</p>
              </div>
              <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Planetary Influence Today</h3>
                <p className="section-copy">{response.reading.planetaryInfluence}</p>
              </div>
              <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Love & Relationships</h3>
                <p className="section-copy">{response.reading.love}</p>
                <p className="section-copy" style={{ marginTop: 12 }}>
                  Love Meter: {iconMeter(response.reading.meters.love, "💕", "🤍")}
                </p>
              </div>
              <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Career & Finances</h3>
                <p className="section-copy">{response.reading.career}</p>
                <p className="section-copy" style={{ marginTop: 12 }}>
                  Career Meter: {iconMeter(response.reading.meters.career, "📈", "📉")}
                </p>
              </div>
              <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Health & Wellness</h3>
                <p className="section-copy">{response.reading.health}</p>
                <p className="section-copy" style={{ marginTop: 12 }}>
                  Vitality Meter: {iconMeter(response.reading.meters.vitality, "⚡", "🔋")}
                </p>
              </div>
              <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Guidance</h3>
                <p className="section-copy">{response.reading.guidance}</p>
                <p className="section-copy" style={{ marginTop: 12 }}>
                  Watch out for: {response.reading.caution}
                </p>
                <p className="section-copy" style={{ marginTop: 12 }}>
                  &quot;{response.reading.affirmation}&quot;
                </p>
              </div>
            </div>
          </section>

          <section className="grid" style={{ gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
            <div className="glass card">
              <div className="badge">Energy Dashboard</div>
              <div className="grid" style={{ gap: 14, marginTop: 18 }}>
                {response.reading.dashboard.map((item) => (
                  <div key={item.area}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span>{item.area}</span>
                      <span className="subtle">{item.score}/5</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${item.score * 20}%`,
                          height: "100%",
                          background: item.tone === "green" ? "var(--success)" : item.tone === "yellow" ? "var(--warning)" : "var(--danger)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {response.reading.bestDay || response.reading.challengeDay ? (
                <div className="grid" style={{ gap: 8, marginTop: 18 }}>
                  {response.reading.bestDay ? <div className="section-copy">Best day: {response.reading.bestDay}</div> : null}
                  {response.reading.challengeDay ? <div className="section-copy">Challenge day: {response.reading.challengeDay}</div> : null}
                  {response.reading.keyDates?.map((item) => (
                    <div key={item} className="section-copy">
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="glass card">
              <div className="badge">Panchang</div>
              <div className="grid" style={{ gap: 10, marginTop: 18 }}>
                <div className="section-copy">Rahu Kaal: {response.panchang.rahuKaal}</div>
                <div className="section-copy">Sunrise: {response.panchang.sunrise} • Sunset: {response.panchang.sunset}</div>
                {extendedAccess ? (
                  <>
                    <div className="section-copy">Tithi: {response.panchang.tithi}</div>
                    <div className="section-copy">Nakshatra: {response.panchang.nakshatra}</div>
                    <div className="section-copy">Yoga: {response.panchang.yoga}</div>
                    <div className="section-copy">Karana: {response.panchang.karana}</div>
                    <div className="section-copy">Moonrise: {response.panchang.moonrise} • Moonset: {response.panchang.moonset}</div>
                    <div className="section-copy">Brahma Muhurta: {response.panchang.brahmaMuhurta}</div>
                    <div className="section-copy">Abhijit Muhurta: {response.panchang.abhijitMuhurta}</div>
                    {response.panchang.choghadiya.map((item) => (
                      <div key={item} className="section-copy">
                        {item}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="section-copy">Unlock Chandra for full Panchang, Choghadiya, Muhurta, and lunar timing layers.</div>
                )}
              </div>
            </div>
          </section>

          <section className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="glass card">
              <div className="badge">Retrograde Tracker</div>
              <div className="grid" style={{ gap: 14, marginTop: 18 }}>
                {response.retrogrades
                  .filter((item) => extendedAccess || !item.premium)
                  .map((item) => (
                    <div key={item.planet} style={{ padding: 16, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontWeight: 700 }}>
                        {item.planet} in {item.sign} {item.active ? "retrograde" : "direct"}
                      </div>
                      <div className="section-copy">
                        {item.startedApprox} → {item.endsApprox}
                      </div>
                      <div className="section-copy" style={{ marginTop: 8 }}>
                        {item.effect}
                      </div>
                      <div className="section-copy" style={{ marginTop: 8 }}>
                        Remedy: {item.remedy}
                      </div>
                    </div>
                  ))}
                {!extendedAccess ? (
                  <div className="section-copy">Chandra unlocks Venus, Mars, Jupiter, and Saturn retrograde survival guides.</div>
                ) : null}
              </div>
            </div>

            <div className="glass card">
              <div className="badge">Transit Alerts</div>
              <div className="grid" style={{ gap: 14, marginTop: 18 }}>
                {response.alerts.length ? (
                  response.alerts
                    .filter((item) => extendedAccess || !item.premium)
                    .map((item) => (
                      <div key={item.id} style={{ padding: 16, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontWeight: 700 }}>{item.title}</div>
                        <div className="section-copy" style={{ marginTop: 8 }}>
                          {item.message}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="section-copy">No fresh ingress alerts right now. The current sky is working through already-established transits.</div>
                )}
              </div>
            </div>
          </section>

          <section className="glass card">
            <div className="badge">
              {personalizedAccess ? "Personalized Horoscope" : extendedAccess ? "Moon Sign + Nakshatra Layer" : "Personalized Horoscope"}
            </div>
            {personalizedAccess && response.personalized ? (
              <div className="grid" style={{ gap: 18, marginTop: 18 }}>
                <div className="section-copy">{response.personalized.overview}</div>
                <div className="section-copy">
                  Lagna: {response.personalized.lagna} • Moon Sign: {response.personalized.moonSign} • Nakshatra: {response.personalized.nakshatra}
                </div>
                <div className="section-copy">Current Dasha: {response.personalized.currentDasha}</div>
                <div className="section-copy">{response.personalized.nakshatraForecast}</div>
                <div className="section-copy">{response.personalized.combinedSummary}</div>
                {response.personalized.moonSignReading ? (
                  <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <h3 style={{ marginTop: 0 }}>Moon Sign Horoscope</h3>
                    <p className="section-copy">{response.personalized.moonSignReading.overallEnergy}</p>
                    <p className="section-copy" style={{ marginTop: 10 }}>
                      Moon-sign guidance: {response.personalized.moonSignReading.guidance}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : extendedAccess && response.personalized ? (
              <div className="grid" style={{ gap: 18, marginTop: 18 }}>
                <div className="section-copy">
                  Moon Sign: {response.personalized.moonSign} • Nakshatra: {response.personalized.nakshatra}
                </div>
                <div className="section-copy">{response.personalized.nakshatraForecast}</div>
                {response.personalized.moonSignReading ? (
                  <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <h3 style={{ marginTop: 0 }}>Moon Sign Horoscope</h3>
                    <p className="section-copy">{response.personalized.moonSignReading.overallEnergy}</p>
                    <p className="section-copy" style={{ marginTop: 10 }}>
                      Moon-sign guidance: {response.personalized.moonSignReading.guidance}
                    </p>
                  </div>
                ) : (
                  <div className="section-copy">Save your birth details in Profile to activate the Moon-sign and Nakshatra layer.</div>
                )}
                <p className="section-copy">
                  Surya and Nakshatra add Lagna-based synthesis, dasha timing, and the yearly forecast.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: 18 }}>
                <p className="section-copy">
                  Chandra unlocks the Moon-sign and Nakshatra layer. Surya and Nakshatra add Lagna-based synthesis,
                  dasha timing, and the full yearly forecast.
                </p>
                <Link href="/shop" className="secondary-btn" style={{ display: "inline-flex", marginTop: 18 }}>
                  Unlock Horoscope Upgrades
                </Link>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
