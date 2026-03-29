# Astology MVP

Astology is a web-first MVP for a freemium AI-powered horoscope, astrology, palmistry, and tarot app. This build focuses on:

- Transit-based daily horoscope generation with Panchang, retrogrades, and premium personalization
- Palm photo upload with OpenAI-ready palm analysis and fallback mode
- Real Swiss Ephemeris-backed multi-varga kundli generation with freemium chart locking
- Tarot studio with deck selection, daily card draw, premium spreads, reminder settings, and journal history
- Freemium plan gating, coin starter balance, and saved birth profile data
- Local auth/profile state with daily chat usage tracking and kundli-aware AI chat

## Stack

- Next.js 15 + React 19 + TypeScript
- App Router with API routes
- Local storage for MVP profile/auth state
- OpenAI-ready service layer with graceful fallback
- Swiss Ephemeris-backed horoscope engine with cached period generation
- Swiss Ephemeris-backed kundli engine for live multi-varga calculations
- Tarot draw engine with deterministic daily pulls, optional OpenAI interpretation, and a server-backed journal MVP
- Profile-level birth details that auto-fill the kundli workflow
- AI chat that automatically uses saved birth details when available

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If you want live AI outputs instead of fallback mode, copy `.env.example` to `.env.local` and add an `OPENAI_API_KEY`.

## MVP Notes

- Palmistry uses a live OpenAI path when `OPENAI_API_KEY` is configured, otherwise it falls back to the local generator in [lib/mock-ai.ts](/Users/abhinav/Documents/New project/Astology/lib/mock-ai.ts).
- Kundli calculations now run through [lib/kundli-engine.ts](/Users/abhinav/Documents/New project/Astology/lib/kundli-engine.ts) using `swisseph-v2` in sidereal Lahiri mode for a live D1/D60-style varga gallery, with D1 and D9 free and the broader chart set behind premium unlocking.
- Tarot readings run through [lib/tarot-service.ts](/Users/abhinav/Documents/New project/Astology/lib/tarot-service.ts) with deck metadata in [lib/tarot-data.ts](/Users/abhinav/Documents/New project/Astology/lib/tarot-data.ts); free users get daily basics while paid plans or coin unlocks open premium spreads and journal features.
- Horoscope readings run through [lib/horoscope-engine.ts](/Users/abhinav/Documents/New project/Astology/lib/horoscope-engine.ts) and [app/api/horoscope/route.ts](/Users/abhinav/Documents/New project/Astology/app/api/horoscope/route.ts), with cached daily/weekly/monthly/yearly outputs, Panchang timing, retrograde tracking, and premium natal-chart synthesis.
- Tarot journal entries now sync through a lightweight local server store for MVP persistence, and browser reminder settings can surface the daily card when the app is opened after the chosen hour.
- Built-in birthplace presets live in [lib/location-db.ts](/Users/abhinav/Documents/New project/Astology/lib/location-db.ts); for cities outside that list, enter latitude and longitude manually for exact charts.
- Plan, coin, unlock, and usage state currently lives in local storage via [components/client-providers.tsx](/Users/abhinav/Documents/New project/Astology/components/client-providers.tsx).
- The app shows the required entertainment disclaimer and leaves room for retention/privacy policies in production.

## Suggested Next Steps

1. Add Supabase auth + PostgreSQL persistence for users, readings, chats, and transactions.
2. Expand [lib/kundli-engine.ts](/Users/abhinav/Documents/New project/Astology/lib/kundli-engine.ts) with richer yoga detection, compatibility scoring, and deeper chart-specific interpretation logic.
3. Store palm uploads in S3 or R2 and persist generated readings by user.
4. Add Stripe and Razorpay checkout plus server-side entitlements.
5. Persist tarot journal entries and shareable reading assets in PostgreSQL or object storage.
