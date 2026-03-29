import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { DateTime, IANAZone } from "luxon";
import tzLookup from "tz-lookup";
import { getCachedHoroscope, setCachedHoroscope } from "@/lib/horoscope-cache-store";
import {
  HOROSCOPE_SIGNS,
  type HoroscopePeriod,
  type HoroscopeReading,
  type HoroscopeResponse,
  type HoroscopeSign,
  type HoroscopeSystem,
  type PanchangSnapshot,
  type PersonalizedHoroscope,
  type RetrogradeWindow,
  type TransitAlert
} from "@/lib/horoscope-types";
import { findBirthplacePreset } from "@/lib/location-db";
import { buildKundliSnapshot } from "@/lib/kundli-engine";
import type { BirthProfile, PlanTier } from "@/lib/types";

const require = createRequire(import.meta.url);
const Swe = require("swisseph-v2") as typeof import("swisseph-v2");

type ResolvedLocation = {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type TransitPlanet = {
  name: string;
  longitude: number;
  signIndex: number;
  sign: HoroscopeSign;
  degree: number;
  retrograde: boolean;
  speed: number;
};

type ScoredTransit = TransitPlanet & {
  house: number;
  impact: number;
  summary: string;
};

type EngineInput = {
  sign: HoroscopeSign;
  period: HoroscopePeriod;
  system: HoroscopeSystem;
  plan?: PlanTier;
  userName?: string;
  birthProfile?: BirthProfile;
  location?: {
    place?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
  };
};

const zodiac = [...HOROSCOPE_SIGNS];
const signSymbols: Record<HoroscopeSign, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓"
};
const signMeta: Record<HoroscopeSign, { color: string; number: number; time: string; lord: string }> = {
  Aries: { color: "Crimson", number: 9, time: "6:40 AM - 8:00 AM", lord: "Mars" },
  Taurus: { color: "Emerald", number: 6, time: "1:10 PM - 2:20 PM", lord: "Venus" },
  Gemini: { color: "Yellow", number: 5, time: "10:30 AM - 11:40 AM", lord: "Mercury" },
  Cancer: { color: "Pearl White", number: 2, time: "8:10 PM - 9:00 PM", lord: "Moon" },
  Leo: { color: "Gold", number: 1, time: "12:10 PM - 1:10 PM", lord: "Sun" },
  Virgo: { color: "Olive", number: 5, time: "9:10 AM - 10:20 AM", lord: "Mercury" },
  Libra: { color: "Rose", number: 6, time: "4:10 PM - 5:20 PM", lord: "Venus" },
  Scorpio: { color: "Maroon", number: 9, time: "7:20 AM - 8:30 AM", lord: "Mars" },
  Sagittarius: { color: "Saffron", number: 3, time: "2:10 PM - 3:40 PM", lord: "Jupiter" },
  Capricorn: { color: "Slate Blue", number: 8, time: "5:20 PM - 6:10 PM", lord: "Saturn" },
  Aquarius: { color: "Electric Blue", number: 8, time: "11:10 AM - 12:20 PM", lord: "Saturn" },
  Pisces: { color: "Sea Green", number: 3, time: "6:50 PM - 8:10 PM", lord: "Jupiter" }
};
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const tithiNames = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];
const yogaNames = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];
const karanaSequence = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Bava", "Balava", "Kaulava",
  "Taitila", "Garaja", "Vanija", "Vishti", "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija",
  "Vishti", "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada",
  "Naga", "Kimstughna"
];
const varaNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const retrogradePlanets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
const planetCatalog = [
  { name: "Sun", id: Swe.SE_SUN },
  { name: "Moon", id: Swe.SE_MOON },
  { name: "Mercury", id: Swe.SE_MERCURY },
  { name: "Venus", id: Swe.SE_VENUS },
  { name: "Mars", id: Swe.SE_MARS },
  { name: "Jupiter", id: Swe.SE_JUPITER },
  { name: "Saturn", id: Swe.SE_SATURN },
  { name: "Rahu", id: Swe.SE_TRUE_NODE }
] as const;
const areaWeights: Record<string, Partial<Record<"Love" | "Career" | "Health" | "Finance" | "Spirituality" | "Social", number>>> = {
  Sun: { Career: 0.8, Health: 0.5, Social: 0.3, Love: -0.1 },
  Moon: { Love: 0.8, Social: 0.6, Health: 0.5, Spirituality: 0.2 },
  Mercury: { Career: 0.7, Finance: 0.5, Social: 0.7 },
  Venus: { Love: 0.9, Finance: 0.4, Social: 0.7, Health: 0.2 },
  Mars: { Career: 0.6, Health: 0.3, Love: -0.5, Social: -0.2, Finance: -0.1 },
  Jupiter: { Finance: 0.8, Love: 0.6, Spirituality: 0.9, Career: 0.5, Health: 0.3 },
  Saturn: { Career: 0.3, Finance: 0.2, Health: -0.5, Social: -0.6, Love: -0.3, Spirituality: 0.5 },
  Rahu: { Career: 0.5, Finance: 0.5, Social: 0.3, Health: -0.4, Spirituality: -0.3 },
  Ketu: { Spirituality: 0.8, Health: -0.2, Finance: -0.3, Love: -0.2, Social: -0.4 }
};
const houseWeights: Record<number, Partial<Record<"Love" | "Career" | "Health" | "Finance" | "Spirituality" | "Social", number>>> = {
  1: { Health: 1.0, Social: 0.4, Love: 0.2, Career: 0.2 },
  2: { Finance: 1.0, Career: 0.3, Social: 0.2 },
  3: { Career: 0.6, Social: 0.6, Health: 0.2 },
  4: { Health: 0.5, Love: 0.4, Spirituality: 0.3 },
  5: { Love: 1.1, Spirituality: 0.5, Social: 0.4 },
  6: { Career: 0.5, Health: -0.5, Finance: -0.2 },
  7: { Love: 1.2, Social: 0.6, Career: 0.2 },
  8: { Health: -0.6, Spirituality: 0.6, Finance: -0.4, Love: -0.3 },
  9: { Spirituality: 1.0, Career: 0.4, Social: 0.3, Love: 0.2 },
  10: { Career: 1.2, Finance: 0.6, Social: 0.4 },
  11: { Finance: 1.0, Social: 0.8, Love: 0.4, Career: 0.7 },
  12: { Spirituality: 0.8, Health: -0.4, Finance: -0.4, Social: -0.3 }
};

let swissConfigured = false;

export async function buildHoroscopeResponse(input: EngineInput): Promise<HoroscopeResponse> {
  configureSwiss();

  const location = resolveLocation(input.location, input.birthProfile);
  const cacheKey = buildCacheKey(input, location);
  const ttl = getTtlMs(input.period, Boolean(input.birthProfile && input.plan && input.plan !== "Free"));
  const cached = await getCachedHoroscope(cacheKey);
  if (cached) {
    return cached;
  }

  const baseDate = DateTime.now().setZone(location.timezone).startOf("day").plus({ hours: 9 });
  const reading = buildReadingForPeriod(input.sign, input.system, input.period, baseDate);
  const panchang = buildPanchang(baseDate, location);
  const retrogrades = buildRetrogradeTracker(baseDate, input.sign, input.system);
  const alerts = buildTransitAlerts(baseDate, input.sign, input.system, input.plan ?? "Free", input.birthProfile);
  const personalized =
    input.plan && input.plan !== "Free"
      ? buildPersonalizedHoroscope(baseDate, input.sign, input.system, input.birthProfile, input.userName)
      : null;

  const response: HoroscopeResponse = {
    generatedAt: DateTime.now().toUTC().toISO() ?? new Date().toISOString(),
    cacheKey,
    period: input.period,
    system: input.system,
    sign: input.sign,
    reading,
    panchang,
    retrogrades,
    alerts,
    personalized
  };

  await setCachedHoroscope(cacheKey, response, ttl);
  return response;
}

export async function getHoroscopePreviewCards(system: HoroscopeSystem, signList: HoroscopeSign[] = ["Aries", "Taurus", "Gemini"]) {
  const responses = await Promise.all(
    signList.map((sign) =>
      buildHoroscopeResponse({
        sign,
        system,
        period: "daily",
        plan: "Free"
      })
    )
  );

  return responses.map((item) => ({
    sign: item.sign,
    symbol: item.reading.symbol,
    text: item.reading.guidance,
    luckyColor: item.reading.luckyColor
  }));
}

function buildCacheKey(input: EngineInput, location: ResolvedLocation) {
  const personalizedSeed = input.birthProfile?.dateOfBirth
    ? createHash("sha256")
        .update(
          [
            input.birthProfile.dateOfBirth,
            input.birthProfile.timeOfBirth,
            input.birthProfile.placeOfBirth,
            input.birthProfile.latitude,
            input.birthProfile.longitude
          ].join("|")
        )
        .digest("hex")
        .slice(0, 12)
    : "public";

  const periodLabel = getPeriodLabel(input.period, DateTime.now().setZone(location.timezone));
  return [
    "horoscope",
    input.system,
    input.period,
    input.sign,
    periodLabel,
    location.label,
    input.plan && input.plan !== "Free" ? personalizedSeed : "shared"
  ].join(":");
}

function getPeriodLabel(period: HoroscopePeriod, date: DateTime) {
  if (period === "daily") {
    return date.toFormat("yyyy-LL-dd");
  }

  if (period === "weekly") {
    return `${date.startOf("week").toFormat("yyyy-LL-dd")}`;
  }

  if (period === "monthly") {
    return date.toFormat("yyyy-LL");
  }

  return date.toFormat("yyyy");
}

function getTtlMs(period: HoroscopePeriod, personalized: boolean) {
  if (personalized) {
    return 12 * 60 * 60 * 1000;
  }

  switch (period) {
    case "daily":
      return 24 * 60 * 60 * 1000;
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;
    case "monthly":
      return 31 * 24 * 60 * 60 * 1000;
    case "yearly":
      return 366 * 24 * 60 * 60 * 1000;
  }
}

function configureSwiss() {
  if (swissConfigured) {
    return;
  }

  Swe.swe_set_ephe_path(path.join(process.cwd(), "node_modules/swisseph-v2/ephe"));
  Swe.swe_set_sid_mode(Swe.SE_SIDM_LAHIRI, 0, 0);
  swissConfigured = true;
}

function resolveLocation(locationInput: EngineInput["location"], birthProfile?: BirthProfile): ResolvedLocation {
  const latitude = parseCoordinate(locationInput?.latitude) ?? parseCoordinate(birthProfile?.latitude);
  const longitude = parseCoordinate(locationInput?.longitude) ?? parseCoordinate(birthProfile?.longitude);
  const place = locationInput?.place || birthProfile?.placeOfBirth || "New York";

  if (latitude !== null && longitude !== null) {
    const timezone = resolveTimezone(latitude, longitude, locationInput?.timezone || birthProfile?.timezone);
    return {
      label: place || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
      timezone
    };
  }

  const preset = findBirthplacePreset(place) ?? findBirthplacePreset("New York");
  if (!preset) {
    throw new Error("A valid location is required to build horoscope timings.");
  }

  return {
    label: `${preset.city}, ${preset.country}`,
    latitude: preset.latitude,
    longitude: preset.longitude,
    timezone: preset.timezone
  };
}

function resolveTimezone(latitude: number, longitude: number, timezone?: string) {
  if (timezone && IANAZone.isValidZone(timezone)) {
    return timezone;
  }

  return tzLookup(latitude, longitude);
}

function parseCoordinate(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildReadingForPeriod(
  sign: HoroscopeSign,
  system: HoroscopeSystem,
  period: HoroscopePeriod,
  baseDate: DateTime
): HoroscopeReading {
  if (period === "daily") {
    return buildDailyReading(sign, system, baseDate);
  }

  const sampleDates = getSampleDates(period, baseDate);
  const readings = sampleDates.map((date) => buildDailyReading(sign, system, date));
  const average = averageDashboard(readings);
  const best = [...readings].sort((left, right) => getOverallScore(right.dashboard) - getOverallScore(left.dashboard))[0];
  const worst = [...readings].sort((left, right) => getOverallScore(left.dashboard) - getOverallScore(right.dashboard))[0];
  const meta = signMeta[sign];
  const overall = roundScore(getOverallScoreFromMap(average));
  const periodName = period === "weekly" ? "week" : period === "monthly" ? "month" : "year";

  return {
    sign,
    symbol: signSymbols[sign],
    system,
    period,
    dateLabel: getPeriodDisplayLabel(period, baseDate),
    overallRating: overall,
    luckyColor: meta.color,
    luckyNumber: meta.number,
    luckyTime: meta.time,
    overallEnergy: `${period === "weekly" ? "This week" : period === "monthly" ? "This month" : "This year"}, ${sign} feels ${describeScore(overall).toLowerCase()} overall. ${best.sign === sign ? `${best.dateLabel} brings the brightest momentum, while ${worst.dateLabel} asks for extra pacing.` : `There is a visible rise-and-fall rhythm, so your best results come from timing important moves rather than forcing them.`}`,
    love: `${describeAreaAverage(average.Love, "relationship")} Over the ${periodName}, prioritize conversations on the days that already feel emotionally open instead of pushing closeness on low-energy dates.`,
    career: `${describeAreaAverage(average.Career, "career")} Financially, ${describeAreaAverage(average.Finance, "money").toLowerCase()} Use the best dates for pitching, applying, negotiating, and making visible progress.`,
    health: `${describeAreaAverage(average.Health, "health")} Keep your rhythm steady around ${worst.dateLabel}, because that is where stress or overextension is most likely to show.`,
    guidance: `Anchor your biggest move close to ${best.dateLabel}, when the sky gives you the cleanest support.`,
    caution: `Do not treat ${worst.dateLabel} like a failure window. Treat it like a timing cue to simplify and conserve energy.`,
    affirmation: `I move with timing, patience, and confidence, and I let the right moment amplify my effort.`,
    planetaryInfluence: `The broader tone comes from the slower-moving outer planets setting the background while the Moon creates shorter peaks and dips across the ${periodName}.`,
    meters: {
      love: roundScore(average.Love),
      career: roundScore((average.Career + average.Finance) / 2),
      vitality: roundScore(average.Health)
    },
    dashboard: [
      buildDashboardItem("Love", average.Love),
      buildDashboardItem("Career", average.Career),
      buildDashboardItem("Health", average.Health),
      buildDashboardItem("Finance", average.Finance),
      buildDashboardItem("Spirituality", average.Spirituality),
      buildDashboardItem("Social", average.Social)
    ],
    bestDay: best.dateLabel,
    challengeDay: worst.dateLabel,
    keyDates: buildKeyDatesForPeriod(period, readings, baseDate, sign, system)
  };
}

function buildDailyReading(
  sign: HoroscopeSign,
  system: HoroscopeSystem,
  date: DateTime
): HoroscopeReading {
  const transits = getScoredTransits(sign, system, date);
  const scores = computeScores(transits);
  const overall = roundScore(getOverallScoreFromMap(scores));
  const positive = [...transits].sort((left, right) => right.impact - left.impact)[0];
  const challenging = [...transits].sort((left, right) => left.impact - right.impact)[0];
  const loveAnchor = pickAreaTransit(transits, "Love");
  const careerAnchor = pickAreaTransit(transits, "Career");
  const healthAnchor = pickAreaTransit(transits, "Health");
  const meta = signMeta[sign];

  return {
    sign,
    symbol: signSymbols[sign],
    system,
    period: "daily",
    dateLabel: date.toFormat("dd LLL yyyy"),
    overallRating: overall,
    luckyColor: meta.color,
    luckyNumber: meta.number,
    luckyTime: meta.time,
    overallEnergy: `${describeScore(overall)} ${positive.summary} ${challenging.name !== positive.name ? `${challenging.summary} Move with awareness instead of reacting on autopilot.` : "Use the strongest wave well and avoid overdoing it."}`,
    love: `${loveAnchor.summary} ${scores.Love >= 4 ? "Warmth is easier to access today, so soften your tone and initiate what matters." : scores.Love >= 3 ? "Steady honesty works better than drama today." : "Sensitivity is high, so keep expectations realistic and leave room for other people’s moods."}`,
    career: `${careerAnchor.summary} ${scores.Career >= 4 ? "A practical move can create visible traction fast." : scores.Career >= 3 ? "Progress comes from tidy follow-through, not rush energy." : "Delays or mixed signals are more likely, so double-check details before committing."}`,
    health: `${healthAnchor.summary} ${scores.Health >= 4 ? "Your energy can hold more today, but it still needs direction." : scores.Health >= 3 ? "Keep your day balanced and you should feel steady." : "Your nervous system benefits from lighter scheduling, hydration, and simpler routines today."}`,
    guidance: buildGuidanceLine(positive, meta.lord),
    caution: buildCautionLine(challenging),
    affirmation: buildAffirmation(sign, positive, system),
    planetaryInfluence: transits
      .slice()
      .sort((left, right) => Math.abs(right.impact) - Math.abs(left.impact))
      .slice(0, 3)
      .map((planet) => `${planet.name} in your ${ordinal(planet.house)} house`)
      .join(", "),
    meters: {
      love: roundScore(scores.Love),
      career: roundScore((scores.Career + scores.Finance) / 2),
      vitality: roundScore(scores.Health)
    },
    dashboard: [
      buildDashboardItem("Love", scores.Love),
      buildDashboardItem("Career", scores.Career),
      buildDashboardItem("Health", scores.Health),
      buildDashboardItem("Finance", scores.Finance),
      buildDashboardItem("Spirituality", scores.Spirituality),
      buildDashboardItem("Social", scores.Social)
    ]
  };
}

function getScoredTransits(sign: HoroscopeSign, system: HoroscopeSystem, date: DateTime) {
  const referenceIndex = zodiac.indexOf(sign);
  const planets = getTransitPlanets(date, system);

  return planets.map((planet) => {
    const house = getHouseFromReference(planet.signIndex, referenceIndex);
    const impact = computePlanetImpact(planet.name, house, planet.retrograde);

    return {
      ...planet,
      house,
      impact,
      summary: describePlanetInHouse(planet.name, house, planet.sign, planet.retrograde)
    } satisfies ScoredTransit;
  });
}

function getTransitPlanets(date: DateTime, system: HoroscopeSystem): TransitPlanet[] {
  const jd = toJulianDay(date.toUTC());
  const flags = Swe.SEFLG_SWIEPH | Swe.SEFLG_SPEED | (system === "vedic" ? Swe.SEFLG_SIDEREAL : 0);
  const planets: TransitPlanet[] = planetCatalog.map((planet) => {
    const result = Swe.swe_calc_ut(jd, planet.id, flags);
    if ("error" in result) {
      throw new Error(result.error);
    }

    if (!("longitude" in result)) {
      throw new Error(`Unexpected transit shape for ${planet.name}.`);
    }

    const longitude = normalize360(result.longitude);
    const signIndex = getSignIndex(longitude);
    const speed = "longitudeSpeed" in result ? result.longitudeSpeed : 0;

    return {
      name: planet.name,
      longitude,
      signIndex,
      sign: zodiac[signIndex] as HoroscopeSign,
      degree: longitude % 30,
      retrograde: planet.name === "Rahu" ? true : speed < 0,
      speed
    };
  });

  const rahu = planets.find((planet) => planet.name === "Rahu");
  if (!rahu) {
    throw new Error("Rahu transit could not be calculated.");
  }

  const ketuLongitude = normalize360(rahu.longitude + 180);
  planets.push({
    name: "Ketu",
    longitude: ketuLongitude,
    signIndex: getSignIndex(ketuLongitude),
    sign: zodiac[getSignIndex(ketuLongitude)] as HoroscopeSign,
    degree: ketuLongitude % 30,
    retrograde: true,
    speed: -Math.abs(rahu.speed || 0.01)
  });

  return planets;
}

function computeScores(transits: ScoredTransit[]) {
  const scores = {
    Love: 3,
    Career: 3,
    Health: 3,
    Finance: 3,
    Spirituality: 3,
    Social: 3
  };

  for (const transit of transits) {
    const planetWeights = areaWeights[transit.name];
    const houseWeight = houseWeights[transit.house];
    const retrogradeModifier = transit.retrograde && transit.name !== "Rahu" && transit.name !== "Ketu" ? 0.8 : 1;

    (Object.keys(scores) as Array<keyof typeof scores>).forEach((area) => {
      const delta = (planetWeights?.[area] ?? 0) * (houseWeight?.[area] ?? 0) * retrogradeModifier;
      scores[area] += delta;
    });
  }

  return {
    Love: clampScore(scores.Love),
    Career: clampScore(scores.Career),
    Health: clampScore(scores.Health),
    Finance: clampScore(scores.Finance),
    Spirituality: clampScore(scores.Spirituality),
    Social: clampScore(scores.Social)
  };
}

function computePlanetImpact(planetName: string, house: number, retrograde: boolean) {
  const planetWeights = areaWeights[planetName] ?? {};
  const houseWeight = houseWeights[house] ?? {};
  const impact = Object.keys(planetWeights).reduce((total, area) => {
    return total + Math.abs((planetWeights as Record<string, number>)[area] * ((houseWeight as Record<string, number>)[area] ?? 0));
  }, 0);

  return retrograde ? impact * -0.65 : impact;
}

function pickAreaTransit(transits: ScoredTransit[], area: keyof ReturnType<typeof computeScores>) {
  const sorted = [...transits].sort((left, right) => {
    const leftScore = Math.abs((areaWeights[left.name]?.[area] ?? 0) * (houseWeights[left.house]?.[area] ?? 0));
    const rightScore = Math.abs((areaWeights[right.name]?.[area] ?? 0) * (houseWeights[right.house]?.[area] ?? 0));
    return rightScore - leftScore;
  });

  return sorted[0] ?? transits[0];
}

function buildDashboardItem(area: HoroscopeReading["dashboard"][number]["area"], score: number) {
  return {
    area,
    score: roundScore(score),
    tone: score >= 4 ? "green" : score >= 3 ? "yellow" : "red"
  } as const;
}

function averageDashboard(readings: HoroscopeReading[]) {
  const totals = {
    Love: 0,
    Career: 0,
    Health: 0,
    Finance: 0,
    Spirituality: 0,
    Social: 0
  };

  readings.forEach((reading) => {
    reading.dashboard.forEach((item) => {
      totals[item.area] += item.score;
    });
  });

  const count = readings.length || 1;
  return {
    Love: totals.Love / count,
    Career: totals.Career / count,
    Health: totals.Health / count,
    Finance: totals.Finance / count,
    Spirituality: totals.Spirituality / count,
    Social: totals.Social / count
  };
}

function getOverallScore(dashboard: HoroscopeReading["dashboard"]) {
  return dashboard.reduce((total, item) => total + item.score, 0) / dashboard.length;
}

function getOverallScoreFromMap(scores: ReturnType<typeof computeScores> | ReturnType<typeof averageDashboard>) {
  return (scores.Love + scores.Career + scores.Health + scores.Finance + scores.Spirituality + scores.Social) / 6;
}

function describeScore(score: number) {
  if (score >= 5) {
    return "This is a potent five-star day for decisive movement.";
  }
  if (score >= 4) {
    return "This is a strong, opportunity-rich day.";
  }
  if (score >= 3) {
    return "This is a balanced day that rewards conscious pacing.";
  }
  if (score >= 2) {
    return "This is a lower-energy day that asks for patience.";
  }
  return "This is a protective, slow-moving day best used for simplicity.";
}

function describeAreaAverage(score: number, area: string) {
  if (score >= 4) {
    return `${area[0].toUpperCase()}${area.slice(1)} energy trends high, with supportive openings worth acting on`;
  }
  if (score >= 3) {
    return `${area[0].toUpperCase()}${area.slice(1)} energy stays moderate, so steady effort pays off more than dramatic moves`;
  }
  return `${area[0].toUpperCase()}${area.slice(1)} energy runs tender or cautious, so gentler pacing will protect momentum`;
}

function buildGuidanceLine(transit: ScoredTransit, lord: string) {
  return `${transit.name} is your action cue today. Let ${lord}'s style guide you: take one clear step in the part of life ruled by your ${ordinal(transit.house)} house before the day gets noisy.`;
}

function buildCautionLine(transit: ScoredTransit) {
  return `${transit.name} in your ${ordinal(transit.house)} house is the main pressure point today. Slow down there before you answer, spend, or promise too much.`;
}

function buildAffirmation(sign: HoroscopeSign, transit: ScoredTransit, system: HoroscopeSystem) {
  return `I trust the timing of ${system === "vedic" ? "the grahas" : "the sky"}, and as ${sign}, I move through my ${ordinal(transit.house)} house lessons with steadiness and self-respect.`;
}

function describePlanetInHouse(planet: string, house: number, sign: HoroscopeSign, retrograde: boolean) {
  const intro = `${planet}${retrograde ? " retrograde" : ""} moving through your ${ordinal(house)} house`;
  switch (house) {
    case 1:
      return `${intro} puts the spotlight on identity, body, and how ${sign} comes across right now.`;
    case 2:
      return `${intro} stirs money, values, and the tone of your speech.`;
    case 3:
      return `${intro} sharpens communication, courage, and short-form action.`;
    case 4:
      return `${intro} pulls energy toward home, emotional foundations, and inner stability.`;
    case 5:
      return `${intro} energizes romance, creativity, joy, and visibility.`;
    case 6:
      return `${intro} tests routines, work pressure, health habits, and boundaries.`;
    case 7:
      return `${intro} turns attention toward partnership, agreements, and mirrors through other people.`;
    case 8:
      return `${intro} deepens transformation, shared resources, and emotional intensity.`;
    case 9:
      return `${intro} expands beliefs, travel, learning, and higher perspective.`;
    case 10:
      return `${intro} pushes career, public image, reputation, and visible responsibility.`;
    case 11:
      return `${intro} supports gains, networks, long-term goals, and community.`;
    case 12:
      return `${intro} asks for release, rest, recovery, and spiritual clearing.`;
    default:
      return `${intro} is shaping the day in a noticeable way.`;
  }
}

function buildKeyDatesForPeriod(
  period: HoroscopePeriod,
  readings: HoroscopeReading[],
  baseDate: DateTime,
  sign: HoroscopeSign,
  system: HoroscopeSystem
) {
  if (period === "weekly") {
    return readings
      .slice()
      .sort((left, right) => right.overallRating - left.overallRating)
      .slice(0, 3)
      .map((item) => `${item.dateLabel}: strongest momentum`);
  }

  if (period === "monthly") {
    const moonDates = getMoonPhaseDates(baseDate, system);
    return [
      ...moonDates.map((item) => `${item.date}: ${item.label}`),
      `${readings[0]?.dateLabel}: reset the month with grounded priorities`
    ].slice(0, 4);
  }

  const quarters = buildQuarterThemes(sign, system, baseDate);
  return quarters.map((item) => `${item.quarter}: ${item.theme}`);
}

function buildQuarterThemes(sign: HoroscopeSign, system: HoroscopeSystem, baseDate: DateTime) {
  return [0, 3, 6, 9].map((offset, index) => {
    const reading = buildDailyReading(sign, system, baseDate.startOf("year").plus({ months: offset, days: 1 }));

    return {
      quarter: `Q${index + 1}`,
      theme: reading.guidance
    };
  });
}

function getSampleDates(period: HoroscopePeriod, baseDate: DateTime) {
  if (period === "weekly") {
    return Array.from({ length: 7 }, (_, index) => baseDate.plus({ days: index }));
  }

  if (period === "monthly") {
    return Array.from({ length: 6 }, (_, index) => baseDate.startOf("month").plus({ days: index * 5 }));
  }

  return Array.from({ length: 12 }, (_, index) => baseDate.startOf("year").plus({ months: index }));
}

function getPeriodDisplayLabel(period: HoroscopePeriod, baseDate: DateTime) {
  if (period === "weekly") {
    return `${baseDate.startOf("week").toFormat("dd LLL")} - ${baseDate.endOf("week").toFormat("dd LLL yyyy")}`;
  }

  if (period === "monthly") {
    return baseDate.toFormat("LLLL yyyy");
  }

  return baseDate.toFormat("yyyy");
}

function buildPanchang(baseDate: DateTime, location: ResolvedLocation): PanchangSnapshot {
  const vedicTransits = getTransitPlanets(baseDate, "vedic");
  const sun = vedicTransits.find((planet) => planet.name === "Sun");
  const moon = vedicTransits.find((planet) => planet.name === "Moon");

  if (!sun || !moon) {
    throw new Error("Sun or Moon transit could not be calculated for Panchang.");
  }

  const tithiValue = normalize360(moon.longitude - sun.longitude) / 12;
  const tithiIndex = Math.min(29, Math.floor(tithiValue));
  const yogaIndex = Math.floor(normalize360(moon.longitude + sun.longitude) / (360 / 27)) % 27;
  const nakshatraIndex = Math.floor(moon.longitude / (360 / 27)) % 27;
  const karanaIndex = Math.min(karanaSequence.length - 1, Math.floor(tithiValue * 2));
  const sunrise = computeRiseSet(baseDate, location, Swe.SE_SUN, Swe.SE_CALC_RISE);
  const sunset = computeRiseSet(baseDate, location, Swe.SE_SUN, Swe.SE_CALC_SET);
  const moonrise = computeRiseSet(baseDate, location, Swe.SE_MOON, Swe.SE_CALC_RISE);
  const moonset = computeRiseSet(baseDate, location, Swe.SE_MOON, Swe.SE_CALC_SET);
  const rahuKaal = buildRahuKaal(baseDate, sunrise, sunset);
  const brahmaStart = sunrise.minus({ minutes: 96 });
  const brahmaEnd = sunrise.minus({ minutes: 48 });
  const solarNoon = sunrise.plus({ milliseconds: (sunset.toMillis() - sunrise.toMillis()) / 2 });
  const abhijitStart = solarNoon.minus({ minutes: 24 });
  const abhijitEnd = solarNoon.plus({ minutes: 24 });

  return {
    tithi: `${tithiNames[tithiIndex]} Tithi`,
    vara: varaNames[baseDate.weekday % 7],
    nakshatra: nakshatras[nakshatraIndex],
    yoga: yogaNames[yogaIndex],
    karana: karanaSequence[karanaIndex],
    sunrise: sunrise.toFormat("hh:mm a"),
    sunset: sunset.toFormat("hh:mm a"),
    moonrise: moonrise.toFormat("hh:mm a"),
    moonset: moonset.toFormat("hh:mm a"),
    rahuKaal,
    brahmaMuhurta: `${brahmaStart.toFormat("hh:mm a")} - ${brahmaEnd.toFormat("hh:mm a")}`,
    abhijitMuhurta: `${abhijitStart.toFormat("hh:mm a")} - ${abhijitEnd.toFormat("hh:mm a")}`,
    choghadiya: buildChoghadiyaPreview(sunrise, sunset)
  };
}

function computeRiseSet(baseDate: DateTime, location: ResolvedLocation, planetId: number, mode: number) {
  const jd = toJulianDay(baseDate.startOf("day").toUTC());
  const result = Swe.swe_rise_trans(
    jd,
    planetId,
    "",
    Swe.SEFLG_SWIEPH,
    mode,
    location.longitude,
    location.latitude,
    0,
    0,
    20
  );

  if ("error" in result) {
    return baseDate;
  }

  return julianDayToDateTime(result.transitTime, location.timezone);
}

function buildRahuKaal(baseDate: DateTime, sunrise: DateTime, sunset: DateTime) {
  const segmentDuration = (sunset.toMillis() - sunrise.toMillis()) / 8;
  const weekdayIndex = baseDate.weekday % 7;
  const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
  const segmentNumber = rahuSegments[weekdayIndex] - 1;
  const start = sunrise.plus({ milliseconds: segmentDuration * segmentNumber });
  const end = start.plus({ milliseconds: segmentDuration });
  return `${start.toFormat("hh:mm a")} - ${end.toFormat("hh:mm a")}`;
}

function buildChoghadiyaPreview(sunrise: DateTime, sunset: DateTime) {
  const labels = ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"];
  const segmentDuration = (sunset.toMillis() - sunrise.toMillis()) / 8;

  return labels.map((label, index) => {
    const start = sunrise.plus({ milliseconds: segmentDuration * index });
    const end = start.plus({ milliseconds: segmentDuration });
    return `${label}: ${start.toFormat("hh:mm a")} - ${end.toFormat("hh:mm a")}`;
  });
}

function buildRetrogradeTracker(baseDate: DateTime, sign: HoroscopeSign, system: HoroscopeSystem): RetrogradeWindow[] {
  const current = getTransitPlanets(baseDate, system);
  return retrogradePlanets.map((planetName) => {
    const transit = current.find((planet) => planet.name === planetName);
    if (!transit) {
      throw new Error(`Could not locate ${planetName} transit.`);
    }

    const start = findRetrogradeBoundary(baseDate, planetName, system, "backward");
    const end = findRetrogradeBoundary(baseDate, planetName, system, "forward");
    const house = getHouseFromReference(transit.signIndex, zodiac.indexOf(sign));

    return {
      planet: planetName,
      sign: transit.sign,
      active: transit.retrograde,
      startedApprox: start.toFormat("dd LLL yyyy"),
      endsApprox: end.toFormat("dd LLL yyyy"),
      effect: `${planetName} is working through your ${ordinal(house)} house, so ${describeRetrogradeEffect(planetName)}.`,
      remedy: describeRetrogradeRemedy(planetName),
      premium: planetName !== "Mercury"
    };
  });
}

function findRetrogradeBoundary(baseDate: DateTime, planetName: typeof retrogradePlanets[number], system: HoroscopeSystem, direction: "forward" | "backward") {
  let cursor = baseDate;
  const step = direction === "forward" ? 1 : -1;

  for (let day = 0; day < 180; day += 1) {
    const transits = getTransitPlanets(cursor, system);
    const planet = transits.find((item) => item.name === planetName);
    if (!planet) {
      break;
    }

    if (planet.speed > 0) {
      return cursor;
    }

    cursor = cursor.plus({ days: step });
  }

  return cursor;
}

function describeRetrogradeEffect(planet: string) {
  if (planet === "Mercury") {
    return `messages, logistics, and agreements in this area deserve slower review`;
  }
  if (planet === "Venus") {
    return `relationships, pleasure, and spending patterns are asking for reflection`;
  }
  if (planet === "Mars") {
    return `frustration can build if action is pushed without strategy`;
  }
  if (planet === "Jupiter") {
    return `growth comes through inner realignment before outer expansion`;
  }
  return `responsibility and patience are the real medicine in this part of life`;
}

function describeRetrogradeRemedy(planet: string) {
  if (planet === "Mercury") return "Review messages twice, leave travel buffers, and avoid rushed signatures.";
  if (planet === "Venus") return "Spend consciously and talk clearly about expectations in love and money.";
  if (planet === "Mars") return "Channel excess heat into exercise or focused work instead of conflict.";
  if (planet === "Jupiter") return "Return to study, prayer, mentoring, or a trusted value system before expanding.";
  return "Reduce unnecessary pressure and let discipline work over time instead of overnight.";
}

function buildTransitAlerts(
  baseDate: DateTime,
  sign: HoroscopeSign,
  system: HoroscopeSystem,
  plan: PlanTier,
  birthProfile?: BirthProfile
): TransitAlert[] {
  const today = getTransitPlanets(baseDate, system);
  const yesterday = getTransitPlanets(baseDate.minus({ days: 1 }), system);
  const signIndex = zodiac.indexOf(sign);
  const snapshot = plan !== "Free" ? tryBuildSnapshot(birthProfile) : null;
  const allowed = plan === "Free" ? new Set(["Sun", "Moon"]) : null;

  return today
    .map((planet) => {
      const previous = yesterday.find((item) => item.name === planet.name);
      if (!previous || previous.signIndex === planet.signIndex) {
        return null;
      }

      if (allowed && !allowed.has(planet.name)) {
        return {
          id: `${planet.name}-${planet.sign}-${baseDate.toISODate()}`,
          title: `${planet.name} changes sign`,
          message: `${planet.name} has shifted into ${planet.sign}. Unlock premium to see its full impact on your houses and timing.`,
          premium: true
        } satisfies TransitAlert;
      }

      const house = snapshot
        ? getHouseFromReference(planet.signIndex, zodiac.indexOf(snapshot.lagna.sign as HoroscopeSign))
        : getHouseFromReference(planet.signIndex, signIndex);

      return {
        id: `${planet.name}-${planet.sign}-${baseDate.toISODate()}`,
        title: `${planet.name} enters ${planet.sign}`,
        message: `${planet.name} just moved into your ${ordinal(house)} house zone, shifting emphasis toward ${describeHouseTheme(house)}.`,
        premium: false
      } satisfies TransitAlert;
    })
    .filter((item): item is TransitAlert => Boolean(item));
}

function buildPersonalizedHoroscope(
  baseDate: DateTime,
  sign: HoroscopeSign,
  system: HoroscopeSystem,
  birthProfile?: BirthProfile,
  userName?: string
): PersonalizedHoroscope | null {
  const snapshot = tryBuildSnapshot(birthProfile, userName);
  if (!snapshot) {
    return null;
  }

  const lagna = snapshot.lagna.sign as HoroscopeSign;
  const moonSign = snapshot.moonSign as HoroscopeSign;
  const moonReading = buildDailyReading(moonSign, system, baseDate);
  const transits = getScoredTransits(lagna, system, baseDate);
  const currentMoon = transits.find((planet) => planet.name === "Moon");
  const currentJupiter = transits.find((planet) => planet.name === "Jupiter");
  const personalYear = birthProfile?.dateOfBirth ? getPersonalYear(birthProfile.dateOfBirth, baseDate.year) : null;
  const nakshatra = snapshot.nakshatra.split(" Pada")[0];

  return {
    title: `${userName || "Your"} personalized horoscope`,
    overview: `${snapshot.lagna.sign} Lagna means the day lands most directly through your ${currentMoon ? ordinal(currentMoon.house) : "present"} house experience, while ${snapshot.dasha.current} sets the deeper timing theme. ${currentJupiter ? `Jupiter in your ${ordinal(currentJupiter.house)} house is the biggest supportive influence right now.` : ""}`,
    lagna,
    moonSign,
    nakshatra: snapshot.nakshatra,
    currentDasha: snapshot.dasha.current,
    moonSignReading: moonReading,
    nakshatraForecast: `${nakshatra} nakshatra responds best today to calm confidence, beauty, and steady timing. ${personalYear ? `Your numerology personal year ${personalYear} makes today's lessons especially relevant around long-range planning.` : ""}`,
    combinedSummary: `${lagna} rising shapes your outer day, ${moonSign} shapes your emotional reality, and ${sign} still colors the sign-wide weather you are moving through. Use the sign horoscope for the public mood, but follow the Lagna and Moon-based timing for real decisions.`
  };
}

function tryBuildSnapshot(birthProfile?: BirthProfile, userName?: string) {
  if (
    !birthProfile?.dateOfBirth ||
    !birthProfile.timeOfBirth ||
    !(birthProfile.placeOfBirth || (birthProfile.latitude && birthProfile.longitude))
  ) {
    return null;
  }

  try {
    return buildKundliSnapshot({
      name: userName || "Seeker",
      dateOfBirth: birthProfile.dateOfBirth,
      timeOfBirth: birthProfile.timeOfBirth,
      placeOfBirth: birthProfile.placeOfBirth || `${birthProfile.latitude}, ${birthProfile.longitude}`,
      latitude: birthProfile.latitude,
      longitude: birthProfile.longitude,
      timezone: birthProfile.timezone,
      chartStyle: "North Indian",
      fullAccess: false
    });
  } catch {
    return null;
  }
}

function getPersonalYear(dateOfBirth: string, currentYear: number) {
  const birth = dateOfBirth.split("-").map(Number);
  if (birth.length !== 3) {
    return null;
  }

  let sum = [...birth[1].toString(), ...birth[2].toString(), ...currentYear.toString()]
    .map(Number)
    .reduce((total, value) => total + value, 0);

  while (![11, 22, 33].includes(sum) && sum > 9) {
    sum = sum
      .toString()
      .split("")
      .map(Number)
      .reduce((total, value) => total + value, 0);
  }

  return sum;
}

function getMoonPhaseDates(baseDate: DateTime, system: HoroscopeSystem) {
  const dates = Array.from({ length: 31 }, (_, index) => baseDate.startOf("month").plus({ days: index }));
  let bestNew = { diff: Number.POSITIVE_INFINITY, date: baseDate };
  let bestFull = { diff: Number.POSITIVE_INFINITY, date: baseDate };

  dates.forEach((date) => {
    const planets = getTransitPlanets(date, system);
    const sun = planets.find((planet) => planet.name === "Sun");
    const moon = planets.find((planet) => planet.name === "Moon");
    if (!sun || !moon) {
      return;
    }

    const diff = normalize360(moon.longitude - sun.longitude);
    const newDiff = Math.min(diff, 360 - diff);
    const fullDiff = Math.abs(180 - diff);

    if (newDiff < bestNew.diff) {
      bestNew = { diff: newDiff, date };
    }

    if (fullDiff < bestFull.diff) {
      bestFull = { diff: fullDiff, date };
    }
  });

  return [
    { label: "New Moon reset", date: bestNew.date.toFormat("dd LLL") },
    { label: "Full Moon culmination", date: bestFull.date.toFormat("dd LLL") }
  ];
}

function toJulianDay(dateTimeUtc: DateTime) {
  const result = Swe.swe_utc_to_jd(
    dateTimeUtc.year,
    dateTimeUtc.month,
    dateTimeUtc.day,
    dateTimeUtc.hour,
    dateTimeUtc.minute,
    dateTimeUtc.second + dateTimeUtc.millisecond / 1000,
    Swe.SE_GREG_CAL
  );

  if ("error" in result) {
    throw new Error(result.error);
  }

  return result.julianDayUT;
}

function julianDayToDateTime(jd: number, timezone: string) {
  const result = Swe.swe_revjul(jd, Swe.SE_GREG_CAL);
  const hours = Math.floor(result.hour);
  const minutes = Math.floor((result.hour - hours) * 60);
  const seconds = Math.round((((result.hour - hours) * 60) - minutes) * 60);

  return DateTime.fromObject(
    {
      year: result.year,
      month: result.month,
      day: result.day,
      hour: hours,
      minute: minutes,
      second: seconds
    },
    { zone: "UTC" }
  ).setZone(timezone);
}

function getSignIndex(longitude: number) {
  return Math.floor(normalize360(longitude) / 30);
}

function getHouseFromReference(signIndex: number, referenceIndex: number) {
  return ((signIndex - referenceIndex + 12) % 12) + 1;
}

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function clampScore(value: number) {
  return Math.min(5, Math.max(1, value));
}

function roundScore(value: number) {
  return Math.min(5, Math.max(1, Math.round(value)));
}

function ordinal(value: number) {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}

function describeHouseTheme(house: number) {
  const themes: Record<number, string> = {
    1: "identity, health, and self-expression",
    2: "money, speech, and values",
    3: "communication, effort, and short moves",
    4: "home, family, and emotional stability",
    5: "love, children, and creativity",
    6: "workload, routines, and health management",
    7: "partnership and collaboration",
    8: "transformation, intimacy, and shared resources",
    9: "luck, travel, and higher learning",
    10: "career, status, and visibility",
    11: "gains, friends, and long-term goals",
    12: "release, rest, and spiritual clearing"
  };

  return themes[house] ?? "the present life chapter";
}
