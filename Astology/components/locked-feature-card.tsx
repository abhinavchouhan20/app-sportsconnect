import Link from "next/link";

export function LockedFeatureCard() {
  const lockedItems = [
    "Personalized natal horoscope",
    "Weekly and monthly forecasts",
    "Moon sign and nakshatra layer",
    "Marriage line timing",
    "Mount of Venus and Moon detail",
    "Celtic Cross tarot reading",
    "Tarot journal and pattern analysis",
    "PDF kundli export",
    "Gun Milan compatibility",
    "Yearly destiny report"
  ];

  return (
    <div className="glass card">
      <div className="badge">Paid Plan Vault</div>
      <h2 className="section-title" style={{ marginTop: 18 }}>
        Locked celestial upgrades
      </h2>
      <div className="grid" style={{ marginTop: 14 }}>
        {lockedItems.map((item) => (
          <div key={item} className="section-copy" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>🔒</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Link href="/shop" className="primary-btn" style={{ display: "inline-flex", marginTop: 20 }}>
        Unlock Plans
      </Link>
    </div>
  );
}
