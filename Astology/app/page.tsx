import Link from "next/link";
import { DashboardCard } from "@/components/dashboard-card";
import { LockedFeatureCard } from "@/components/locked-feature-card";
import { DailyHoroscopeCard } from "@/components/daily-horoscope-card";
import { PlanStrip } from "@/components/plan-strip";

export default function HomePage() {
  return (
    <div className="grid" style={{ gap: 28 }}>
      <section className="glass card" style={{ padding: 32, overflow: "hidden", position: "relative" }}>
        <div className="badge">Mystical guidance, modern product flow</div>
        <h1 style={{ fontSize: "clamp(2.8rem, 8vw, 5rem)", margin: "16px 0 12px", lineHeight: 0.95 }}>
          Astology
        </h1>
        <p className="section-copy" style={{ maxWidth: 680, fontSize: "1.05rem" }}>
          Horoscope, palmistry, kundli, tarot, and guided AI chat in one freemium experience. This MVP now
          ships a real transit-based horoscope engine, the palm upload journey, a live multi-varga kundli
          engine, a tarot studio with daily draws, and the profile plus subscription layer tying it together.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 22 }}>
          <Link href="/horoscope" className="primary-btn">
            Open Horoscope
          </Link>
          <Link href="/palmistry" className="primary-btn">
            Start Palm Reading
          </Link>
          <Link href="/kundli" className="secondary-btn">
            Open Kundli Studio
          </Link>
          <Link href="/tarot" className="secondary-btn">
            Open Tarot Studio
          </Link>
        </div>
      </section>

      <PlanStrip />

      <section className="two-col">
        <div className="grid">
          <DashboardCard
            title="Daily Horoscope"
            eyebrow="Real transit engine"
            description="Generate live Vedic or Western daily sign horoscopes, Panchang timing, retrograde context, and premium natal personalization."
            href="/horoscope"
            cta="Read Horoscope"
          />
          <DashboardCard
            title="AI Palmistry"
            eyebrow="Free preview + premium depth"
            description="Upload a palm photo, position it inside the guided frame, and unlock a structured reading with line-by-line insight."
            href="/palmistry"
            cta="Upload Palm"
          />
          <DashboardCard
            title="Kundli Essentials"
            eyebrow="Tiered varga gallery"
            description="Enter birth details, generate live sidereal graha positions, and unlock D1 and D9 for free, the standard varga gallery on Chandra, and the rare karmic charts on Nakshatra."
            href="/kundli"
            cta="Generate Chart"
          />
          <DashboardCard
            title="AI Chat"
            eyebrow="3 free daily questions"
            description="The chat interface is ready for chart-aware guidance with a strong freemium curve: 3 questions free, 30 on Chandra, and unlimited on Surya plus Nakshatra."
            href="/chat"
            cta="Ask One Question"
          />
          <DashboardCard
            title="Tarot Studio"
            eyebrow="Daily card + premium spreads"
            description="Draw a single card, 3-card spread, or premium layouts with deck choices, cross-reading bridges, journal history, and shareable spread capture."
            href="/tarot"
            cta="Draw Cards"
          />
        </div>
        <div className="grid">
          <DailyHoroscopeCard />
          <LockedFeatureCard />
        </div>
      </section>
    </div>
  );
}
