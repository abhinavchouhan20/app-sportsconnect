export function PlanStrip() {
  return (
    <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {[
        ["Always Free", "Daily sun-sign horoscope, D1 + D9, Life Path + Expression, 3 AI chats/day, daily tarot, Rahu Kaal, and 50 welcome coins"],
        ["Chandra Basic", "₹199/month with full palmistry, 16 standard charts, Moon-sign + Nakshatra horoscope, weekly + monthly guidance, the paid tarot studio, 30 AI chats/day, and 100 coins/month"],
        ["Surya Premium", "₹399/month with personalized horoscope, yearly reports, unlimited AI chat, Kundli matching, cross-readings, remedies, and 200 coins/month"],
        ["Nakshatra VIP", "₹699/month with face reading, Vastu, rare D27/D40/D45/D60 charts, Prashna, KP/Nadi layers, memory across sessions, and 400 coins/month"]
      ].map(([name, copy]) => (
        <div key={name} className="glass card" style={{ minHeight: 148 }}>
          <div className="badge">{name}</div>
          <p className="section-copy" style={{ marginTop: 16 }}>
            {copy}
          </p>
        </div>
      ))}
    </section>
  );
}
