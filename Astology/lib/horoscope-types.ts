export const HOROSCOPE_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
] as const;

export const HOROSCOPE_SYSTEMS = ["vedic", "western"] as const;
export const HOROSCOPE_PERIODS = ["daily", "weekly", "monthly", "yearly"] as const;

export type HoroscopeSign = (typeof HOROSCOPE_SIGNS)[number];
export type HoroscopeSystem = (typeof HOROSCOPE_SYSTEMS)[number];
export type HoroscopePeriod = (typeof HOROSCOPE_PERIODS)[number];

export type HoroscopeEnergyArea =
  | "Love"
  | "Career"
  | "Health"
  | "Finance"
  | "Spirituality"
  | "Social";

export type HoroscopeDashboardItem = {
  area: HoroscopeEnergyArea;
  score: number;
  tone: "green" | "yellow" | "red";
};

export type HoroscopeReading = {
  sign: HoroscopeSign;
  symbol: string;
  system: HoroscopeSystem;
  period: HoroscopePeriod;
  dateLabel: string;
  overallRating: number;
  luckyColor: string;
  luckyNumber: number;
  luckyTime: string;
  overallEnergy: string;
  love: string;
  career: string;
  health: string;
  guidance: string;
  caution: string;
  affirmation: string;
  planetaryInfluence: string;
  meters: {
    love: number;
    career: number;
    vitality: number;
  };
  dashboard: HoroscopeDashboardItem[];
  bestDay?: string;
  challengeDay?: string;
  keyDates?: string[];
};

export type PanchangSnapshot = {
  tithi: string;
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: string;
  brahmaMuhurta: string;
  abhijitMuhurta: string;
  choghadiya: string[];
};

export type RetrogradeWindow = {
  planet: string;
  sign: HoroscopeSign;
  active: boolean;
  startedApprox: string;
  endsApprox: string;
  effect: string;
  remedy: string;
  premium: boolean;
};

export type TransitAlert = {
  id: string;
  title: string;
  message: string;
  premium: boolean;
};

export type PersonalizedHoroscope = {
  title: string;
  overview: string;
  lagna: HoroscopeSign;
  moonSign: HoroscopeSign;
  nakshatra: string;
  currentDasha: string;
  moonSignReading: HoroscopeReading | null;
  nakshatraForecast: string;
  combinedSummary: string;
};

export type HoroscopeResponse = {
  generatedAt: string;
  cacheKey: string;
  period: HoroscopePeriod;
  system: HoroscopeSystem;
  sign: HoroscopeSign;
  reading: HoroscopeReading;
  panchang: PanchangSnapshot;
  retrogrades: RetrogradeWindow[];
  alerts: TransitAlert[];
  personalized: PersonalizedHoroscope | null;
};
