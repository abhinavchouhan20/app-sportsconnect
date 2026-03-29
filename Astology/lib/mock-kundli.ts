import type { KundliSnapshot } from "@/lib/types";

const zodiac = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const chartCatalog = [
  ["D1", "Rashi Chart"],
  ["D2", "Hora Chart"],
  ["D3", "Drekkana Chart"],
  ["D4", "Chaturthamsa Chart"],
  ["D5", "Panchamsa Chart"],
  ["D6", "Shashthamsa Chart"],
  ["D7", "Saptamsa Chart"],
  ["D8", "Ashtamsa Chart"],
  ["D9", "Navamsa Chart"],
  ["D10", "Dasamsa Chart"],
  ["D11", "Ekadamsa Chart"],
  ["D12", "Dwadasamsa Chart"],
  ["D16", "Shodasamsa Chart"],
  ["D20", "Vimsamsa Chart"],
  ["D24", "Chaturvimsamsa Chart"],
  ["D27", "Bhamsa Chart"],
  ["D30", "Trimsamsa Chart"],
  ["D40", "Khavedamsa Chart"],
  ["D45", "Akshavedamsa Chart"],
  ["D60", "Shashtyamsa Chart"]
] as const;

function buildAsciiChart(title: string, sign: string) {
  return `${title}

┌───────────────┬───────────────┐
│ 12            │ 1 ${sign}     │
├───────────────┼───────────────┤
│ 11            │ 2             │
├───────────────┼───────────────┤
│ 10            │ 3             │
├───────────────┼───────────────┤
│ 9             │ 4             │
├───────────────┼───────────────┤
│ 8             │ 5             │
├───────────────┼───────────────┤
│ 7             │ 6             │
└───────────────┴───────────────┘`;
}

export function buildKundliSnapshot(input: {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  chartStyle: string;
  fullAccess?: boolean;
}): KundliSnapshot {
  const seed = input.name.length + input.placeOfBirth.length;
  const lagna = zodiac[seed % zodiac.length];

  return {
    name: input.name,
    overview:
      "This kundli flow now renders a full chart gallery with freemium locking. D1 and D9 remain open on the free tier, while the rest of the varga system unlocks through subscription or coins. The calculation layer remains deterministic demo logic for now, but the structure is ready for Swiss Ephemeris replacement.",
    provider: "swisseph",
    moonSign: zodiac[(seed + 1) % zodiac.length],
    nakshatra: "Ashwini Pada 1",
    birthLocation: {
      label: input.placeOfBirth,
      latitude: 0,
      longitude: 0,
      timezone: "UTC"
    },
    lagna: { sign: lagna, degree: `${(seed * 3) % 30}° ${(seed * 7) % 60}'` },
    planets: grahas.map((planet, index) => ({
      name: planet,
      sign: zodiac[(seed + index) % zodiac.length],
      house: ((index + seed) % 12) + 1,
      degree: `${(index * 4 + seed) % 30}° ${(index * 9 + seed) % 60}'`
    })),
    dasha: {
      current: "Jupiter / Venus",
      until: "18 Sep 2027",
      interpretation:
        "This is framed as a growth and refinement period, favorable for learning, alliances, and building stable abundance through wise choices."
    },
    flags: [
      { label: "Mangal Dosha", value: "No major concern in MVP mock" },
      { label: "Kal Sarpa", value: "Not indicated in MVP mock" },
      { label: "Sade Sati", value: "Upcoming review required in full engine" }
    ],
    charts: chartCatalog.map(([name, title], index) => {
      const locked = !input.fullAccess && name !== "D1" && name !== "D9";
      const sign = zodiac[(seed + index * 2) % zodiac.length];
      return {
        name,
        title: `${input.chartStyle} ${title}`,
        asciiChart: buildAsciiChart(`${name} ${title}`, sign),
        interpretation: locked
          ? "Upgrade to unlock this chart's visual reading, placement summary, and AI interpretation."
          : `${title} points to ${sign}-flavored themes becoming important through this life area. The current seed logic is deterministic for MVP product flow, and can be replaced with exact ephemeris math without changing the UI contract.`,
        locked,
        source: locked ? "locked" : "preview"
      };
    })
  };
}
