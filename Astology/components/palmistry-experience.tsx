"use client";

import { useContext, useState } from "react";
import { AppContext } from "@/components/client-providers";
import { hasPalmPremiumAccess, unlockFeatureWithCoins } from "@/lib/plans";
import type { PalmReading } from "@/lib/types";

export function PalmistryExperience() {
  const { user, setUser } = useContext(AppContext);
  const [name, setName] = useState(user.name || "");
  const [hand, setHand] = useState("Right");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPremium = hasPalmPremiumAccess(user);

  const onFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!imagePreview) {
      setError("Upload a palm photo first so the reading has something to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    const response = await fetch("/api/palm/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hand, imageDataUrl: imagePreview, fullAccess: isPremium })
    });
    const data = (await response.json()) as PalmReading;
    setReading(data);
    setLoading(false);
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card two-col">
        <div>
          <div className="badge">Palmistry MVP</div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
            Guided palm upload and structured AI reading
          </h1>
          <p className="section-copy">
            The upload area is designed for a future camera overlay flow. For now, it previews the
            image, captures the analyzed hand, and sends a structured request to the palmistry API.
          </p>

          <div className="grid" style={{ marginTop: 22 }}>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            <select className="select" value={hand} onChange={(event) => setHand(event.target.value)}>
              <option>Right</option>
              <option>Left</option>
              <option>Both</option>
            </select>
            <label
              style={{
                display: "grid",
                placeItems: "center",
                minHeight: 280,
                borderRadius: 30,
                border: "1px dashed rgba(240, 197, 109, 0.45)",
                background:
                  "radial-gradient(circle at center, rgba(240,197,109,0.12), rgba(255,255,255,0.02))",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer"
              }}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Palm preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <div style={{ fontSize: "4rem" }}>🖐️</div>
                  <div>Upload a clear palm photo</div>
                  <div className="subtle" style={{ marginTop: 8 }}>
                    Keep fingers open, wrist visible, palm centered inside the glow frame.
                  </div>
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: "10%",
                  borderRadius: 32,
                  border: "2px solid rgba(255, 217, 142, 0.35)",
                  pointerEvents: "none"
                }}
              />
              <input type="file" accept="image/*" hidden onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
            </label>
            <button className="primary-btn" onClick={runAnalysis} disabled={loading}>
              {loading ? "Reading your palm..." : "Analyze Palm"}
            </button>
            {error ? (
              <div style={{ color: "var(--warning)" }}>{error}</div>
            ) : null}
          </div>
        </div>

        <div className="glass card" style={{ background: "var(--panel-strong)" }}>
          <h2 className="section-title">Free vs premium output</h2>
          <div className="grid" style={{ gap: 12 }}>
            <p className="section-copy">Free users receive Life, Heart, and Head line summaries.</p>
            <p className="section-copy">Paid plans unlock Fate, Sun, Mercury, Marriage, Mounts, and export-ready detail.</p>
            <div className="badge">{isPremium ? "Premium access active" : "Free preview only"}</div>
          </div>
          <p className="section-copy" style={{ marginTop: 22 }}>
            Disclaimer: For entertainment and self-reflection purposes only. Not a substitute for professional advice.
          </p>
          {!isPremium ? (
            <button
              className="secondary-btn"
              style={{ marginTop: 18 }}
              onClick={() => setUser(unlockFeatureWithCoins(user, "palm-full", 25))}
            >
              Unlock full palm report for 25 coins
            </button>
          ) : null}
        </div>
      </section>

      {reading ? (
        <section className="glass card">
          <div className="badge">{reading.provider === "openai" ? "OpenAI vision reading" : "Fallback guided reading"}</div>
          <h2 className="section-title" style={{ marginTop: 18 }}>
            {reading.title}
          </h2>
          <p className="section-copy">{reading.summary}</p>
          <p className="section-copy" style={{ marginTop: 12 }}>
            Hand analyzed: {reading.handAnalyzed} • Generated {new Date(reading.generatedAt).toLocaleString()}
          </p>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 22 }}>
            {reading.sections.map((section) => (
              <div key={section.title} className="glass card" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="badge">{section.rating}</div>
                <h3 style={{ marginTop: 16 }}>{section.title}</h3>
                <p className="section-copy">{section.observation}</p>
                <p className="section-copy" style={{ marginTop: 10 }}>
                  {section.meaning}
                </p>
              </div>
            ))}
          </div>

          {!isPremium ? (
            <div className="glass card" style={{ marginTop: 20, background: "rgba(240,197,109,0.08)" }}>
              <h3 style={{ marginTop: 0 }}>Unlock the full palm report</h3>
              <p className="section-copy">
                Upgrade to reveal the Fate Line, Sun Line, Mercury Line, marriage timing, mount analysis,
                and PDF-ready report sections.
              </p>
            </div>
          ) : null}

          <p className="section-copy" style={{ marginTop: 20 }}>
            {reading.disclaimer}
          </p>
        </section>
      ) : null}
    </div>
  );
}
