"use client";

import { useContext, useState } from "react";
import { AppContext } from "@/components/client-providers";
import type { PlanTier } from "@/lib/types";

const plans: Array<{
  name: PlanTier;
  label: string;
  weekly: string;
  monthly: string;
  longer: string[];
  features: string[];
}> = [
  {
    name: "Basic",
    label: "Chandra Basic",
    weekly: "₹79/week",
    monthly: "₹199/month",
    longer: ["₹799 / 6 months", "₹1,299 / year"],
    features: [
      "Full palmistry with all 10 lines + mounts",
      "16 standard Vedic charts with Mahadasha + Antardasha timeline",
      "Moon sign + Nakshatra daily horoscope",
      "Weekly + monthly horoscope",
      "Full numerology core + cycle numbers",
      "Unlimited tarot core spreads + journal",
      "Full Panchang + Choghadiya",
      "All 9 transit alerts",
      "30 AI chat questions/day",
      "1 Kundli PDF export/month",
      "100 coins/month"
    ]
  },
  {
    name: "Premium",
    label: "Surya Premium",
    weekly: "₹149/week",
    monthly: "₹399/month",
    longer: ["₹1,299 / 6 months", "₹1,999 / year"],
    features: [
      "Everything in Chandra",
      "Personalized daily horoscope",
      "Yearly horoscope report",
      "Unlimited AI chat + remembered history",
      "Unlimited Kundli matching",
      "Tarot + Kundli and Tarot + Numerology cross-readings",
      "Name correction + business name checker",
      "Gemstone report + Lal Kitab remedies",
      "Eclipse calendar + retrograde survival guide",
      "Muhurta finder + family Kundli up to 3 members",
      "All PDF exports unlimited",
      "Daily complete cosmic briefing",
      "200 coins/month"
    ]
  },
  {
    name: "VIP",
    label: "Nakshatra VIP",
    weekly: "₹249/week",
    monthly: "₹699/month",
    longer: ["₹2,199 / 6 months", "₹3,499 / year"],
    features: [
      "Everything in Surya",
      "Face reading AI feature",
      "Full Vastu report",
      "All 20 divisional charts, including D27, D40, D45, and D60",
      "Prashna chart, KP reading, and Nadi basic reading",
      "Family Kundli up to 5 members",
      "AI chat memory across all sessions",
      "Priority AI responses + early access",
      "400 coins/month",
      "Monthly AI video forecast",
      "WhatsApp daily briefing integration",
      "\"Ask Anything\" unlimited deep-dive"
    ]
  }
];

export function ShopExperience() {
  const { user, setUser } = useContext(AppContext);
  const [note, setNote] = useState("");

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card">
        <div className="badge">Pricing Refresh</div>
        <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 18 }}>
          Lower prices, stronger impulse buy math
        </h1>
        <p className="section-copy">
          The plans now reflect the no-human-astrologer pricing model: cheaper entry, stronger hook in the free
          tier, and much clearer separation between Chandra, Surya, and Nakshatra.
        </p>
      </section>

      <section className="glass card">
        <div className="badge">Always Free</div>
        <div className="grid" style={{ gap: 10, marginTop: 18 }}>
          {[
            "Daily horoscope (Sun sign only)",
            "D1 Rashi + D9 Navamsa",
            "Life Path + Expression number",
            "Palm photo with 3 basic lines",
            "1 Tarot card pull/day + 1 three-card spread/day",
            "Today's Rahu Kaal + basic Panchang",
            "Mangal Dosha & Kal Sarpa yes/no",
            "3 AI chat questions/day",
            "50 welcome coins",
            "Moon phase tracker"
          ].map((item) => (
            <div key={item} className="section-copy">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {plans.map((plan) => (
          <div key={plan.name} className="glass card">
            <div className="badge">{plan.label}</div>
            <h2 className="section-title" style={{ marginTop: 18 }}>
              {plan.monthly}
            </h2>
            <div className="section-copy">{plan.weekly}</div>
            <div className="section-copy">{plan.longer.join(" • ")}</div>
            <div className="grid" style={{ gap: 10 }}>
              {plan.features.map((feature) => (
                <div key={feature} className="section-copy">
                  {feature}
                </div>
              ))}
            </div>
            <button
              className="primary-btn"
              style={{ marginTop: 20 }}
              onClick={() => {
                setUser({ ...user, plan: plan.name });
                setNote(`Switched locally to ${plan.label}. Billing is still mock until Stripe/Razorpay are connected.`);
              }}
            >
              Switch to {plan.label}
            </button>
          </div>
        ))}
      </section>

      <section className="glass card">
        <h2 className="section-title">Coin packs</h2>
        <p className="section-copy" style={{ marginBottom: 20 }}>
          Coin unlocks still work for one-off reports and premium vault items.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            ["100 coins", "₹39", 100],
            ["300 coins", "₹79", 300],
            ["700 coins", "₹149", 700],
            ["1500 coins", "₹279", 1500],
            ["3500 coins", "₹549", 3500]
          ].map(([coins, price, amount]) => (
            <div key={coins} style={{ padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontWeight: 700 }}>{coins}</div>
              <div className="section-copy">{price}</div>
              <button
                className="secondary-btn"
                style={{ marginTop: 14 }}
                onClick={() => setUser({ ...user, coins: user.coins + Number(amount) })}
              >
                Add {amount}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="glass card">
        <h2 className="section-title">One-Time Reports</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            ["Full Kundli PDF (40 pages)", "₹149"],
            ["Palm Reading PDF Report", "₹99"],
            ["Complete Numerology Report PDF", "₹99"],
            ["Kundli Matching Report", "₹179"],
            ["Year Prediction Report", "₹199"],
            ["Career Prediction Report", "₹249"],
            ["Marriage Timing Report", "₹249"],
            ["Business Name Report", "₹149"],
            ["Full Vastu Report", "₹299"],
            ["Mega All-in-One Report", "₹599"]
          ].map(([label, price]) => (
            <div key={label} style={{ padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontWeight: 700 }}>{label}</div>
              <div className="section-copy">{price}</div>
              <button
                className="secondary-btn"
                style={{ marginTop: 14 }}
                onClick={() => setNote(`${label} is staged in the UI. Connect checkout next to make this purchasable.`)}
              >
                Prepare Checkout
              </button>
            </div>
          ))}
        </div>
      </section>

      {note ? (
        <section className="glass card">
          <p className="section-copy">{note}</p>
        </section>
      ) : null}
    </div>
  );
}
