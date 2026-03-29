import path from "node:path";
import { createRequire } from "node:module";
import { DateTime, IANAZone } from "luxon";
import tzLookup from "tz-lookup";
import { findBirthplacePreset } from "@/lib/location-db";
import type { KundliSnapshot, PlanTier } from "@/lib/types";

const require = createRequire(import.meta.url);
const Swe = require("swisseph-v2") as typeof import("swisseph-v2");

const zodiac = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const dashaSequence = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const dashaYears: Record<(typeof dashaSequence)[number], number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
};
const planetOrder = [
  { name: "Sun", id: Swe.SE_SUN, short: "Su" },
  { name: "Moon", id: Swe.SE_MOON, short: "Mo" },
  { name: "Mars", id: Swe.SE_MARS, short: "Ma" },
  { name: "Mercury", id: Swe.SE_MERCURY, short: "Me" },
  { name: "Jupiter", id: Swe.SE_JUPITER, short: "Ju" },
  { name: "Venus", id: Swe.SE_VENUS, short: "Ve" },
  { name: "Saturn", id: Swe.SE_SATURN, short: "Sa" },
  { name: "Rahu", id: Swe.SE_TRUE_NODE, short: "Ra" }
] as const;
const chartCatalog = [
  ["D1", "Rashi Chart", "core life, personality, and the full natal promise"],
  ["D2", "Hora Chart", "wealth flow, savings behavior, and material comfort"],
  ["D3", "Drekkana Chart", "siblings, courage, initiative, and effort"],
  ["D4", "Chaturthamsa Chart", "property, fixed assets, and fortune"],
  ["D5", "Panchamsa Chart", "power, merit, and spiritual authority"],
  ["D6", "Shashthamsa Chart", "disease, debt, disputes, and resilience"],
  ["D7", "Saptamsa Chart", "children, fertility, and creative legacy"],
  ["D8", "Ashtamsa Chart", "longevity, shocks, and deep transformations"],
  ["D9", "Navamsa Chart", "marriage, dharma, and inner maturity"],
  ["D10", "Dasamsa Chart", "career, reputation, achievement, and profession"],
  ["D11", "Ekadamsa Chart", "gains, scaling, fulfillment, and unearned support"],
  ["D12", "Dwadasamsa Chart", "parents, ancestors, and lineage patterns"],
  ["D16", "Shodasamsa Chart", "vehicles, luxuries, and tangible comforts"],
  ["D20", "Vimsamsa Chart", "spiritual practice, devotion, and inner discipline"],
  ["D24", "Chaturvimsamsa Chart", "education, scholarship, and learning style"],
  ["D27", "Bhamsa Chart", "strength, weakness, stamina, and grit"],
  ["D30", "Trimsamsa Chart", "miseries, karmic friction, and vulnerability points"],
  ["D40", "Khavedamsa Chart", "maternal karma, grace, and inherited auspiciousness"],
  ["D45", "Akshavedamsa Chart", "paternal karma, character, and inherited conduct"],
  ["D60", "Shashtyamsa Chart", "past-life karmic residue and the deepest chart signature"]
] as const;
const vipOnlyCharts = new Set(["D27", "D40", "D45", "D60"]);

let swissConfigured = false;

type EngineInput = {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  chartStyle: string;
  plan?: PlanTier;
  fullAccess?: boolean;
  latitude?: string;
  longitude?: string;
  timezone?: string;
};

type Placement = {
  name: string;
  short: string;
  longitude: number;
  signIndex: number;
  sign: string;
  degree: string;
  house: number;
};

export function buildKundliSnapshot(input: EngineInput): KundliSnapshot {
  configureSwiss();

  const birthLocation = resolveBirthLocation(input);
  const birthDateTime = DateTime.fromISO(`${input.dateOfBirth}T${input.timeOfBirth}`, {
    zone: birthLocation.timezone
  });

  if (!birthDateTime.isValid) {
    throw new Error("Birth date or time is invalid. Please enter a valid date and time.");
  }

  const utc = birthDateTime.toUTC();
  const jdResult = Swe.swe_utc_to_jd(
    utc.year,
    utc.month,
    utc.day,
    utc.hour,
    utc.minute,
    utc.second + utc.millisecond / 1000,
    Swe.SE_GREG_CAL
  );

  if ("error" in jdResult) {
    throw new Error(jdResult.error);
  }

  const jdUt = jdResult.julianDayUT;
  const houses = Swe.swe_houses_ex(jdUt, Swe.SEFLG_SIDEREAL, birthLocation.latitude, birthLocation.longitude, "W");

  if ("error" in houses) {
    throw new Error(houses.error);
  }

  const ascendantLongitude = normalize360(houses.ascendant);
  const lagnaSignIndex = getSignIndex(ascendantLongitude);
  const lagna = {
    sign: zodiac[lagnaSignIndex],
    degree: formatDegree(ascendantLongitude % 30)
  };

  const basePlacements = planetOrder.map((planet) => {
    const body = Swe.swe_calc_ut(
      jdUt,
      planet.id,
      Swe.SEFLG_SWIEPH | Swe.SEFLG_SPEED | Swe.SEFLG_SIDEREAL
    );

    if ("error" in body) {
      throw new Error(body.error);
    }

    if (!("longitude" in body)) {
      throw new Error(`Unexpected return shape while calculating ${planet.name}.`);
    }

    const longitude = normalize360(body.longitude);
    const signIndex = getSignIndex(longitude);

    return {
      name: planet.name,
      short: planet.short,
      longitude,
      signIndex,
      sign: zodiac[signIndex],
      degree: formatDegree(longitude % 30),
      house: getHouseFromSign(signIndex, lagnaSignIndex)
    } satisfies Placement;
  });

  const rahu = basePlacements.find((placement) => placement.name === "Rahu");
  if (!rahu) {
    throw new Error("Rahu could not be calculated.");
  }

  const ketuLongitude = normalize360(rahu.longitude + 180);
  const ketuSignIndex = getSignIndex(ketuLongitude);

  const placements: Placement[] = [
    ...basePlacements,
    {
      name: "Ketu",
      short: "Ke",
      longitude: ketuLongitude,
      signIndex: ketuSignIndex,
      sign: zodiac[ketuSignIndex],
      degree: formatDegree(ketuLongitude % 30),
      house: getHouseFromSign(ketuSignIndex, lagnaSignIndex)
    }
  ];

  const moon = placements.find((placement) => placement.name === "Moon");
  const saturn = placements.find((placement) => placement.name === "Saturn");
  const mars = placements.find((placement) => placement.name === "Mars");

  if (!moon || !saturn || !mars) {
    throw new Error("One or more grahas could not be calculated.");
  }

  const nakshatraIndex = Math.floor(moon.longitude / (360 / 27));
  const pada = Math.floor((moon.longitude % (360 / 27)) / (360 / 108)) + 1;
  const dasha = computeCurrentDasha(birthDateTime, moon.longitude);
  const currentSaturnSignIndex = getCurrentTransitSignIndex(Swe.SE_SATURN);

  return {
    name: input.name,
    provider: "swisseph",
    overview: `${lagna.sign} Lagna with ${moon.sign} Moon gives this chart a blend of ${lagna.sign.toLowerCase()} self-expression and ${moon.sign.toLowerCase()} emotional instinct. The core placements are calculated from Swiss Ephemeris in sidereal Lahiri mode, and the unlocked varga gallery now derives its sign placements mathematically from the live D1 longitudes.`,
    moonSign: moon.sign,
    nakshatra: `${nakshatras[nakshatraIndex]} Pada ${pada}`,
    birthLocation,
    lagna,
    planets: placements.map((placement) => ({
      name: placement.name,
      sign: placement.sign,
      house: placement.house,
      degree: placement.degree
    })),
    dasha,
    flags: [
      {
        label: "Mangal Dosha",
        value: [1, 2, 4, 7, 8, 12].includes(mars.house) ? `Present from Lagna view (Mars in House ${mars.house})` : "Not strongly indicated from Lagna view"
      },
      {
        label: "Kal Sarpa",
        value: isKalSarpa(placements) ? "All classical grahas fall within the Rahu-Ketu axis" : "Not indicated"
      },
      {
        label: "Sade Sati",
        value: isSadeSati(currentSaturnSignIndex, moon.signIndex) ? "Active or approaching by current Saturn transit" : "Not active by current Saturn transit"
      },
      {
        label: "Birth-time sensitivity",
        value: "Higher vargas like D40, D45, and D60 need very accurate birth time for dependable interpretation"
      }
    ],
    charts: chartCatalog.map(([name, title, focus]) => {
      if (vipOnlyCharts.has(name) && input.plan !== "VIP") {
        return {
          name,
          title: `${input.chartStyle} ${title}`,
          asciiChart: "VIP chart locked",
          interpretation: "Nakshatra VIP unlocks the rare karmic vargas in this layer.",
          locked: true,
          lockReason: "Nakshatra VIP exclusive",
          source: "locked" as const
        };
      }

      if (!input.fullAccess && name !== "D1" && name !== "D9") {
        return {
          name,
          title: `${input.chartStyle} ${title}`,
          asciiChart: "Premium chart locked",
          interpretation: "Upgrade or unlock with coins to open this varga card.",
          locked: true,
          lockReason: "Chandra or 35-coin unlock",
          source: "locked" as const
        };
      }

      const ascForChart = transformLongitudeForChart(name, ascendantLongitude);
      const chartPlacements = name === "D1"
        ? placements
        : placements.map((placement) => buildDivisionalPlacement(name, placement, ascForChart));

      return {
        ...buildChartFromPlacements(name, `${input.chartStyle} ${title}`, chartPlacements, ascForChart, focus),
        source: "swisseph" as const
      };
    })
  };
}

function configureSwiss() {
  if (swissConfigured) {
    return;
  }

  Swe.swe_set_ephe_path(path.join(process.cwd(), "node_modules/swisseph-v2/ephe"));
  Swe.swe_set_sid_mode(Swe.SE_SIDM_LAHIRI, 0, 0);
  swissConfigured = true;
}

function resolveBirthLocation(input: EngineInput) {
  const latitude = parseCoordinate(input.latitude);
  const longitude = parseCoordinate(input.longitude);

  if (latitude !== null && longitude !== null) {
    const timezone = resolveTimezone(latitude, longitude, input.timezone);
    return {
      label: input.placeOfBirth || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
      timezone
    };
  }

  const preset = findBirthplacePreset(input.placeOfBirth);
  if (!preset) {
    throw new Error("Birthplace was not in the built-in city list. Enter latitude and longitude for an exact chart.");
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

function getSignIndex(longitude: number) {
  return Math.floor(normalize360(longitude) / 30);
}

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function formatDegree(value: number) {
  const degrees = Math.floor(value);
  const minutes = Math.floor((value - degrees) * 60);
  return `${degrees}° ${minutes.toString().padStart(2, "0")}'`;
}

function getHouseFromSign(signIndex: number, lagnaSignIndex: number) {
  return ((signIndex - lagnaSignIndex + 12) % 12) + 1;
}

function buildChartFromPlacements(
  name: string,
  title: string,
  placements: Placement[],
  ascendantLongitude: number,
  focus: string
) {
  const ascSignIndex = getSignIndex(ascendantLongitude);
  const signLines = zodiac.map((sign, index) => {
    const occupants = placements
      .filter((placement) => placement.signIndex === index)
      .map((placement) => placement.short)
      .join(" ");
    const asc = index === ascSignIndex ? "Asc" : "";
    return `${sign.padEnd(12, " ")} ${[asc, occupants].filter(Boolean).join(" ").trim() || "--"}`;
  });

  return {
    name,
    title,
    asciiChart: signLines.join("\n"),
    interpretation: buildChartInterpretation(name, placements, ascSignIndex, focus),
    locked: false
  };
}

function buildChartInterpretation(name: string, placements: Placement[], ascSignIndex: number, focus: string) {
  const dominantSigns = zodiac
    .map((sign, index) => ({
      sign,
      count: placements.filter((placement) => placement.signIndex === index).length
    }))
    .sort((a, b) => b.count - a.count)
    .filter((entry) => entry.count > 0)
    .slice(0, 2)
    .map((entry) => entry.sign);

  const luminaries = placements
    .filter((placement) => placement.name === "Sun" || placement.name === "Moon")
    .map((placement) => `${placement.name} in ${placement.sign}`)
    .join(", ");

  return `${name} rises in ${zodiac[ascSignIndex]}, bringing focus to ${focus}. ${luminaries || "The luminaries hold the core storyline of this chart."} The strongest sign emphasis here appears in ${dominantSigns.join(" and ") || zodiac[ascSignIndex]}, so that tone becomes especially important in interpretation.`;
}

function buildDivisionalPlacement(chartName: string, placement: Placement, ascendantLongitude: number): Placement {
  const chartLongitude = transformLongitudeForChart(chartName, placement.longitude);
  const ascendantSignIndex = getSignIndex(ascendantLongitude);
  const signIndex = getSignIndex(chartLongitude);

  return {
    ...placement,
    longitude: chartLongitude,
    signIndex,
    sign: zodiac[signIndex],
    degree: formatDegree(chartLongitude % 30),
    house: getHouseFromSign(signIndex, ascendantSignIndex)
  };
}

function transformLongitudeForChart(chartName: string, longitude: number) {
  const signIndex = getSignIndex(longitude);
  const degreeInSign = normalize360(longitude) % 30;

  switch (chartName) {
    case "D1":
      return longitude;
    case "D2":
      return transformByEqualParts(degreeInSign, 2, isOddSign(signIndex) ? [4, 3] : [3, 4]);
    case "D3":
      return transformByEqualParts(degreeInSign, 3, [signIndex, mod12(signIndex + 4), mod12(signIndex + 8)]);
    case "D4":
      return transformByEqualParts(degreeInSign, 4, [signIndex, mod12(signIndex + 3), mod12(signIndex + 6), mod12(signIndex + 9)]);
    case "D5":
      return transformByEqualParts(degreeInSign, 5, isOddSign(signIndex) ? [0, 10, 8, 2, 6] : [1, 5, 11, 9, 7]);
    case "D6":
      return transformByEqualParts(degreeInSign, 6, buildSequentialSigns(isOddSign(signIndex) ? 0 : 6, 6));
    case "D7":
      return transformByEqualParts(degreeInSign, 7, buildSequentialSigns(isOddSign(signIndex) ? signIndex : mod12(signIndex + 6), 7));
    case "D8":
      return transformByEqualParts(degreeInSign, 8, buildSequentialSigns(getStartForModality(signIndex, 0, 8, 4), 8));
    case "D9":
      return transformByEqualParts(degreeInSign, 9, buildSequentialSigns(getStartForElement(signIndex, 0, 9, 6, 3), 9));
    case "D10":
      return transformByEqualParts(degreeInSign, 10, buildSequentialSigns(isOddSign(signIndex) ? signIndex : mod12(signIndex + 8), 10));
    case "D11":
      return transformByEqualParts(degreeInSign, 11, [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    case "D12":
      return transformByEqualParts(degreeInSign, 12, buildSequentialSigns(signIndex, 12));
    case "D16":
      return transformByEqualParts(degreeInSign, 16, buildSequentialSigns(getStartForModality(signIndex, 0, 4, 8), 16));
    case "D20":
      return transformByEqualParts(degreeInSign, 20, buildSequentialSigns(getStartForModality(signIndex, 0, 8, 4), 20));
    case "D24":
      return transformByEqualParts(degreeInSign, 24, buildSequentialSigns(isOddSign(signIndex) ? 4 : 3, 24));
    case "D27":
      return transformByEqualParts(degreeInSign, 27, buildSequentialSigns(getStartForElement(signIndex, 0, 3, 6, 9), 27));
    case "D30":
      return transformTrimshamsa(degreeInSign, signIndex);
    case "D40":
      return transformByEqualParts(degreeInSign, 40, buildSequentialSigns(isOddSign(signIndex) ? 0 : 6, 40));
    case "D45":
      return transformByEqualParts(degreeInSign, 45, buildSequentialSigns(getStartForModality(signIndex, 0, 4, 8), 45));
    case "D60":
      return transformByEqualParts(degreeInSign, 60, buildSequentialSigns(0, 60));
    default:
      return longitude;
  }
}

function transformByEqualParts(degreeInSign: number, divisions: number, targetSigns: number[]) {
  const divisionSize = 30 / divisions;
  const rawIndex = degreeInSign / divisionSize;
  const divisionIndex = Math.min(divisions - 1, Math.floor(rawIndex));
  const fraction = rawIndex - divisionIndex;
  return makeLongitude(targetSigns[divisionIndex] ?? targetSigns[targetSigns.length - 1], fraction);
}

function transformTrimshamsa(degreeInSign: number, signIndex: number) {
  const oddScheme = [
    { limit: 5, sign: 0, size: 5 },
    { limit: 10, sign: 10, size: 5 },
    { limit: 18, sign: 8, size: 8 },
    { limit: 25, sign: 2, size: 7 },
    { limit: 30, sign: 6, size: 5 }
  ];
  const evenScheme = [
    { limit: 5, sign: 1, size: 5 },
    { limit: 12, sign: 5, size: 7 },
    { limit: 20, sign: 11, size: 8 },
    { limit: 25, sign: 9, size: 5 },
    { limit: 30, sign: 7, size: 5 }
  ];

  const scheme = isOddSign(signIndex) ? oddScheme : evenScheme;
  let previousLimit = 0;

  for (const segment of scheme) {
    if (degreeInSign < segment.limit || segment.limit === 30) {
      const fraction = (degreeInSign - previousLimit) / segment.size;
      return makeLongitude(segment.sign, fraction);
    }
    previousLimit = segment.limit;
  }

  return makeLongitude(scheme[scheme.length - 1].sign, 0);
}

function buildSequentialSigns(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => mod12(start + index));
}

function getStartForModality(signIndex: number, movableStart: number, fixedStart: number, dualStart: number) {
  if (isMovableSign(signIndex)) {
    return movableStart;
  }

  if (isFixedSign(signIndex)) {
    return fixedStart;
  }

  return dualStart;
}

function getStartForElement(signIndex: number, fireStart: number, earthStart: number, airStart: number, waterStart: number) {
  if (isFireSign(signIndex)) {
    return fireStart;
  }

  if (isEarthSign(signIndex)) {
    return earthStart;
  }

  if (isAirSign(signIndex)) {
    return airStart;
  }

  return waterStart;
}

function makeLongitude(signIndex: number, fractionWithinDivision: number) {
  return normalize360(mod12(signIndex) * 30 + clampFraction(fractionWithinDivision) * 30);
}

function clampFraction(value: number) {
  if (value < 0) {
    return 0;
  }

  if (value >= 1) {
    return 0.999999;
  }

  return value;
}

function isOddSign(signIndex: number) {
  return signIndex % 2 === 0;
}

function isMovableSign(signIndex: number) {
  return [0, 3, 6, 9].includes(signIndex);
}

function isFixedSign(signIndex: number) {
  return [1, 4, 7, 10].includes(signIndex);
}

function isFireSign(signIndex: number) {
  return [0, 4, 8].includes(signIndex);
}

function isEarthSign(signIndex: number) {
  return [1, 5, 9].includes(signIndex);
}

function isAirSign(signIndex: number) {
  return [2, 6, 10].includes(signIndex);
}

function mod12(value: number) {
  return ((value % 12) + 12) % 12;
}

function computeCurrentDasha(birthDateTime: DateTime, moonLongitude: number) {
  const nakshatraSize = 360 / 27;
  const lordIndex = Math.floor(moonLongitude / nakshatraSize) % dashaSequence.length;
  let mahaIndex = lordIndex;
  let start = birthDateTime;
  let currentLord = dashaSequence[mahaIndex];
  let end = start.plus({ days: dashaYears[currentLord] * (1 - ((moonLongitude % nakshatraSize) / nakshatraSize)) * 365.2425 });
  const now = DateTime.now().setZone(birthDateTime.zone);

  while (now > end) {
    start = end;
    mahaIndex = (mahaIndex + 1) % dashaSequence.length;
    currentLord = dashaSequence[mahaIndex];
    end = start.plus({ days: dashaYears[currentLord] * 365.2425 });
  }

  const mahaLord = currentLord;
  let antarIndex = mahaIndex;
  let antarStart = start;
  let antarLord = dashaSequence[antarIndex];
  let antarEnd = antarStart.plus({ days: (dashaYears[mahaLord] * dashaYears[antarLord] / 120) * 365.2425 });

  while (now > antarEnd) {
    antarStart = antarEnd;
    antarIndex = (antarIndex + 1) % dashaSequence.length;
    antarLord = dashaSequence[antarIndex];
    antarEnd = antarStart.plus({ days: (dashaYears[mahaLord] * dashaYears[antarLord] / 120) * 365.2425 });
  }

  return {
    current: `${mahaLord} / ${antarLord}`,
    until: antarEnd.toFormat("dd LLL yyyy"),
    interpretation: `${mahaLord}-${antarLord} tends to activate ${describeDasha(mahaLord)} with a more immediate focus on ${describeDasha(antarLord)}.`
  };
}

function describeDasha(lord: (typeof dashaSequence)[number]) {
  const meanings: Record<(typeof dashaSequence)[number], string> = {
    Ketu: "detachment, inner turning, and karmic pruning",
    Venus: "relationships, comforts, beauty, and support",
    Sun: "identity, recognition, and duty",
    Moon: "family, feelings, and daily security",
    Mars: "drive, conflict, courage, and decisive action",
    Rahu: "ambition, acceleration, and unusual growth",
    Jupiter: "wisdom, faith, learning, and expansion",
    Saturn: "responsibility, endurance, and delayed rewards",
    Mercury: "learning, commerce, communication, and adaptability"
  };

  return meanings[lord];
}

function isKalSarpa(placements: Placement[]) {
  const classical = placements.filter((placement) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(placement.name)
  );
  const rahu = placements.find((placement) => placement.name === "Rahu");
  const ketu = placements.find((placement) => placement.name === "Ketu");

  if (!rahu || !ketu) {
    return false;
  }

  return classical.every((placement) => liesOnArc(rahu.longitude, ketu.longitude, placement.longitude)) ||
    classical.every((placement) => liesOnArc(ketu.longitude, rahu.longitude, placement.longitude));
}

function liesOnArc(start: number, end: number, point: number) {
  const arcLength = normalize360(end - start);
  const pointDistance = normalize360(point - start);
  return pointDistance <= arcLength;
}

function getCurrentTransitSignIndex(planetId: number) {
  const now = DateTime.utc();
  const jdResult = Swe.swe_utc_to_jd(now.year, now.month, now.day, now.hour, now.minute, now.second, Swe.SE_GREG_CAL);

  if ("error" in jdResult) {
    throw new Error(jdResult.error);
  }

  const planet = Swe.swe_calc_ut(jdResult.julianDayUT, planetId, Swe.SEFLG_SWIEPH | Swe.SEFLG_SIDEREAL);
  if ("error" in planet) {
    throw new Error(planet.error);
  }

  if (!("longitude" in planet)) {
    throw new Error("Unexpected transit return shape from Swiss Ephemeris.");
  }

  return getSignIndex(planet.longitude);
}

function isSadeSati(currentSaturnSignIndex: number, moonSignIndex: number) {
  const previous = (moonSignIndex + 11) % 12;
  const next = (moonSignIndex + 1) % 12;
  return [previous, moonSignIndex, next].includes(currentSaturnSignIndex);
}
