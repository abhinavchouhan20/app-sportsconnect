"use client";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/components/client-providers";
import { findBirthplacePreset } from "@/lib/location-db";
import { hasKundliPremiumAccess, hasKundliRareChartAccess, unlockFeatureWithCoins } from "@/lib/plans";
import type { KundliSnapshot } from "@/lib/types";

const initialForm = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  placeOfBirth: "",
  latitude: "",
  longitude: "",
  timezone: "",
  chartStyle: "North Indian"
};

export function KundliStudio() {
  const { user, setUser } = useContext(AppContext);
  const [form, setForm] = useState({
    ...initialForm,
    name: user.name,
    ...user.birthProfile
  });
  const [snapshot, setSnapshot] = useState<KundliSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fullAccess = hasKundliPremiumAccess(user);
  const rareChartAccess = hasKundliRareChartAccess(user);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || user.name,
      dateOfBirth: current.dateOfBirth || user.birthProfile.dateOfBirth,
      timeOfBirth: current.timeOfBirth || user.birthProfile.timeOfBirth,
      placeOfBirth: current.placeOfBirth || user.birthProfile.placeOfBirth,
      latitude: current.latitude || user.birthProfile.latitude,
      longitude: current.longitude || user.birthProfile.longitude,
      timezone: current.timezone || user.birthProfile.timezone
    }));
  }, [user]);

  const submit = async () => {
    setLoading(true);
    setError("");
    setUser({
      ...user,
      name: form.name || user.name,
      birthProfile: {
        dateOfBirth: form.dateOfBirth,
        timeOfBirth: form.timeOfBirth,
        placeOfBirth: form.placeOfBirth,
        latitude: form.latitude,
        longitude: form.longitude,
        timezone: form.timezone
      }
    });
    const response = await fetch("/api/kundli", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plan: user.plan, fullAccess })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Something went wrong while generating the chart.");
      setSnapshot(null);
      setLoading(false);
      return;
    }

    setSnapshot(data as KundliSnapshot);
    setLoading(false);
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card two-col">
        <div>
          <div className="badge">Kundli MVP</div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
            Live multi-varga kundli engine
          </h1>
          <p className="section-copy">
            This version now uses real Swiss Ephemeris calculations for sidereal graha positions, Lagna,
            Moon sign, Nakshatra, and a mathematically generated varga gallery. Built-in city presets can
            auto-fill coordinates, manual latitude/longitude gives the most accurate result, and saved profile
            birth details can auto-fill this form for you.
          </p>

          <div className="grid" style={{ marginTop: 20 }}>
            <input
              className="input"
              value={form.name}
              placeholder="Full name"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="input"
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
            />
            <input
              className="input"
              type="time"
              value={form.timeOfBirth}
              onChange={(event) => setForm((current) => ({ ...current, timeOfBirth: event.target.value }))}
            />
            <input
              className="input"
              value={form.placeOfBirth}
              placeholder="Place of birth"
              onChange={(event) => {
                const placeOfBirth = event.target.value;
                const preset = findBirthplacePreset(placeOfBirth);
                setForm((current) => ({
                  ...current,
                  placeOfBirth,
                  latitude: preset ? String(preset.latitude) : current.latitude,
                  longitude: preset ? String(preset.longitude) : current.longitude,
                  timezone: preset ? preset.timezone : current.timezone
                }));
              }}
            />
            <div className="section-copy">
              Presets supported: Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad,
              Jaipur, Lucknow, Dubai, London, Rome, Paris, Berlin, New York, Los Angeles, Toronto, Singapore, Sydney.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                className="input"
                value={form.latitude}
                placeholder="Latitude"
                onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))}
              />
              <input
                className="input"
                value={form.longitude}
                placeholder="Longitude"
                onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))}
              />
            </div>
            <input
              className="input"
              value={form.timezone}
              placeholder="Timezone (optional, e.g. Asia/Kolkata)"
              onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
            />
            <select
              className="select"
              value={form.chartStyle}
              onChange={(event) => setForm((current) => ({ ...current, chartStyle: event.target.value }))}
            >
              <option>North Indian</option>
              <option>South Indian</option>
            </select>
            <button className="primary-btn" onClick={submit} disabled={loading}>
              {loading ? "Generating chart..." : "Generate Kundli"}
            </button>
            {error ? <div style={{ color: "var(--warning)" }}>{error}</div> : null}
          </div>
        </div>

        <div className="glass card" style={{ background: "var(--panel-strong)" }}>
          <h2 className="section-title">Free tier includes</h2>
          <div className="grid" style={{ gap: 12 }}>
            <div className="section-copy">D1 Rashi chart summary</div>
            <div className="section-copy">D9 Navamsa summary</div>
            <div className="section-copy">Basic graha positions</div>
            <div className="section-copy">Lagna + current dasha preview</div>
          </div>
          <p className="section-copy" style={{ marginTop: 22 }}>
            Chandra opens the standard live varga gallery, while Nakshatra adds the rare karmic charts like D27,
            D40, D45, and D60. The free tier keeps D1 and D9 open.
          </p>
          {!fullAccess ? (
            <button
              className="secondary-btn"
              style={{ marginTop: 18 }}
              onClick={() => setUser(unlockFeatureWithCoins(user, "kundli-full", 35))}
            >
              Unlock full varga gallery for 35 coins
            </button>
          ) : null}
          {fullAccess && !rareChartAccess ? (
            <p className="section-copy" style={{ marginTop: 14 }}>
              Rare karmic charts remain reserved for Nakshatra VIP.
            </p>
          ) : null}
        </div>
      </section>

      {snapshot ? (
        <section className="grid" style={{ gap: 20 }}>
          <div className="glass card two-col">
            <div>
              <div className="badge">{snapshot.lagna.sign} Lagna</div>
              <h2 className="section-title" style={{ marginTop: 18 }}>
                {snapshot.name}&apos;s birth chart snapshot
              </h2>
              <p className="section-copy">{snapshot.overview}</p>
              <p className="section-copy" style={{ marginTop: 12 }}>
                Moon Sign: {snapshot.moonSign} • Nakshatra: {snapshot.nakshatra}
              </p>
              <p className="section-copy">
                Birthplace used: {snapshot.birthLocation.label} • {snapshot.birthLocation.latitude.toFixed(4)},{" "}
                {snapshot.birthLocation.longitude.toFixed(4)} • {snapshot.birthLocation.timezone}
              </p>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 20 }}>
                {snapshot.planets.map((planet) => (
                  <div
                    key={planet.name}
                    style={{ borderRadius: 18, padding: 14, border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div style={{ fontWeight: 700 }}>{planet.name}</div>
                    <div className="subtle">
                      {planet.sign} • House {planet.house}
                    </div>
                    <div className="subtle">{planet.degree}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
              <h3 style={{ marginTop: 0 }}>Current dasha</h3>
              <p className="section-copy">
                {snapshot.dasha.current} until {snapshot.dasha.until}
              </p>
              <p className="section-copy">{snapshot.dasha.interpretation}</p>
              <h3 style={{ marginTop: 20 }}>Checks</h3>
              <div className="grid" style={{ gap: 8 }}>
                {snapshot.flags.map((flag) => (
                  <div key={flag.label} className="section-copy">
                    {flag.label}: {flag.value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {snapshot.charts.map((chart) => (
              <div
                key={chart.name}
                className="glass card"
                style={{ position: "relative", overflow: "hidden", opacity: chart.locked ? 0.75 : 1 }}
              >
                <div className="badge">
                  {chart.name} {chart.source === "swisseph" ? "• Live" : chart.source === "preview" ? "• Preview" : ""}
                </div>
                <h3 style={{ marginTop: 18 }}>{chart.title}</h3>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    padding: 18,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "ui-monospace, SFMono-Regular, monospace"
                  }}
                >
                  {chart.asciiChart}
                </pre>
                <p className="section-copy">{chart.interpretation}</p>
                {chart.locked ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(180deg, rgba(8,17,32,0.2), rgba(8,17,32,0.82))",
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    <div className="badge">{chart.lockReason ?? "Upgrade to unlock"}</div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
