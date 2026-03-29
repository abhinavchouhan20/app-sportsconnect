import type { HoroscopeSign, HoroscopeSystem } from "@/lib/horoscope-types";

export type PlanTier = "Free" | "Basic" | "Premium" | "VIP";
export type FeatureUnlock = "palm-full" | "kundli-full" | "tarot-premium";
export type NotificationPreferences = {
  tarotDailyEnabled: boolean;
  tarotReminderHour: number;
  tarotLastSentDate: string;
  horoscopeDailyEnabled: boolean;
  horoscopeReminderHour: number;
  horoscopeLastSentDate: string;
  horoscopePreferredSign: HoroscopeSign;
  horoscopeSystem: HoroscopeSystem;
};
export type BirthProfile = {
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: string;
  longitude: string;
  timezone: string;
};

export type UserState = {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  coins: number;
  birthProfile: BirthProfile;
  notifications: NotificationPreferences;
  unlocks: FeatureUnlock[];
  usage: {
    chatDate: string;
    chatCount: number;
    tarotDate: string;
    tarotSingleCount: number;
    tarotThreeCount: number;
  };
};

export const defaultUserState: UserState = {
  id: "",
  name: "",
  email: "",
  plan: "Free",
  coins: 50,
  birthProfile: {
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: "",
    latitude: "",
    longitude: "",
    timezone: ""
  },
  notifications: {
    tarotDailyEnabled: false,
    tarotReminderHour: 9,
    tarotLastSentDate: "",
    horoscopeDailyEnabled: false,
    horoscopeReminderHour: 7,
    horoscopeLastSentDate: "",
    horoscopePreferredSign: "Aries",
    horoscopeSystem: "vedic"
  },
  unlocks: [],
  usage: {
    chatDate: "",
    chatCount: 0,
    tarotDate: "",
    tarotSingleCount: 0,
    tarotThreeCount: 0
  }
};

export type PalmSection = {
  title: string;
  rating: string;
  observation: string;
  meaning: string;
};

export type PalmReading = {
  title: string;
  summary: string;
  handAnalyzed: string;
  generatedAt: string;
  provider: "openai" | "fallback";
  disclaimer: string;
  sections: PalmSection[];
};

export type KundliSnapshot = {
  name: string;
  overview: string;
  provider: "swisseph";
  moonSign: string;
  nakshatra: string;
  birthLocation: {
    label: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  lagna: { sign: string; degree: string };
  planets: Array<{ name: string; sign: string; house: number; degree: string }>;
  dasha: { current: string; until: string; interpretation: string };
  flags: Array<{ label: string; value: string }>;
  charts: Array<{
    name: string;
    title: string;
    asciiChart: string;
    interpretation: string;
    locked: boolean;
    lockReason?: string;
    source: "swisseph" | "preview" | "locked";
  }>;
};
