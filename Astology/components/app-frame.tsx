"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import type { ReactNode } from "react";
import { AppContext } from "@/components/client-providers";
import { DailyTarotNotifier } from "@/components/daily-tarot-notifier";
import { DailyHoroscopeNotifier } from "@/components/daily-horoscope-notifier";
import { getPlanLabel, getRemainingChatQuestions } from "@/lib/plans";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/horoscope", label: "Horoscope" },
  { href: "/palmistry", label: "Palmistry" },
  { href: "/kundli", label: "Kundli" },
  { href: "/tarot", label: "Tarot" },
  { href: "/chat", label: "AI Chat" },
  { href: "/profile", label: "Profile" },
  { href: "/shop", label: "Shop" }
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useContext(AppContext);
  const remainingQuestions = getRemainingChatQuestions(user);

  return (
    <div className="app-shell">
      <DailyTarotNotifier />
      <DailyHoroscopeNotifier />
      <header
        className="glass card"
        style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,217,142,0.95), rgba(214,168,78,0.35))",
              boxShadow: "0 0 30px rgba(240, 197, 109, 0.35)"
            }}
          />
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Astology</div>
            <div className="subtle" style={{ fontSize: "0.85rem" }}>
              Entertainment guidance only
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  color: active ? "#2a1d06" : "var(--text)",
                  background: active ? "linear-gradient(135deg, #d6a84e, #ffdf9f)" : "transparent",
                  border: active ? "none" : "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{user.name || "Guest Seeker"}</div>
          <div className="subtle" style={{ fontSize: "0.85rem" }}>
            {getPlanLabel(user.plan)} • {user.coins} coins
          </div>
          <div className="subtle" style={{ fontSize: "0.85rem" }}>
            {remainingQuestions === null ? "Unlimited chat" : `${remainingQuestions} chat question(s) left today`}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
