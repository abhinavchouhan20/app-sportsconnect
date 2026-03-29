import type { TarotSpreadId } from "@/lib/tarot-data";
import type { FeatureUnlock, PlanTier, UserState } from "@/lib/types";

export const PLAN_CONFIG: Record<
  PlanTier,
  {
    label: string;
    dailyChatLimit: number | null;
    fullPalm: boolean;
    fullKundli: boolean;
    fullTarot: boolean;
    fullHoroscope: boolean;
    tarotJournal: boolean;
  }
> = {
  Free: {
    label: "Always Free",
    dailyChatLimit: 3,
    fullPalm: false,
    fullKundli: false,
    fullTarot: false,
    fullHoroscope: false,
    tarotJournal: false
  },
  Basic: {
    label: "Chandra Basic",
    dailyChatLimit: 30,
    fullPalm: true,
    fullKundli: true,
    fullTarot: true,
    fullHoroscope: true,
    tarotJournal: true
  },
  Premium: {
    label: "Surya Premium",
    dailyChatLimit: null,
    fullPalm: true,
    fullKundli: true,
    fullTarot: true,
    fullHoroscope: true,
    tarotJournal: true
  },
  VIP: {
    label: "Nakshatra VIP",
    dailyChatLimit: null,
    fullPalm: true,
    fullKundli: true,
    fullTarot: true,
    fullHoroscope: true,
    tarotJournal: true
  }
};

const PLAN_ORDER: Record<PlanTier, number> = {
  Free: 0,
  Basic: 1,
  Premium: 2,
  VIP: 3
};

export function getPlanLabel(plan: PlanTier) {
  return PLAN_CONFIG[plan].label;
}

export function isPlanAtLeast(plan: PlanTier, minimum: PlanTier) {
  return PLAN_ORDER[plan] >= PLAN_ORDER[minimum];
}

export function getTodayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function createLocalUserId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeUserState(input: Partial<UserState> | null | undefined): UserState {
  const usageDate = input?.usage?.chatDate ?? "";
  const usageCount = input?.usage?.chatCount ?? 0;
  const tarotDate = input?.usage?.tarotDate ?? "";
  const tarotSingleCount = input?.usage?.tarotSingleCount ?? 0;
  const tarotThreeCount = input?.usage?.tarotThreeCount ?? 0;

  return {
    id: input?.id ?? createLocalUserId(),
    name: input?.name ?? "",
    email: input?.email ?? "",
    plan: input?.plan ?? "Free",
    coins: typeof input?.coins === "number" ? input.coins : 50,
    birthProfile: {
      dateOfBirth: input?.birthProfile?.dateOfBirth ?? "",
      timeOfBirth: input?.birthProfile?.timeOfBirth ?? "",
      placeOfBirth: input?.birthProfile?.placeOfBirth ?? "",
      latitude: input?.birthProfile?.latitude ?? "",
      longitude: input?.birthProfile?.longitude ?? "",
      timezone: input?.birthProfile?.timezone ?? ""
    },
    notifications: {
      tarotDailyEnabled: input?.notifications?.tarotDailyEnabled ?? false,
      tarotReminderHour:
        typeof input?.notifications?.tarotReminderHour === "number"
          ? input.notifications.tarotReminderHour
          : 9,
      tarotLastSentDate: input?.notifications?.tarotLastSentDate ?? "",
      horoscopeDailyEnabled: input?.notifications?.horoscopeDailyEnabled ?? false,
      horoscopeReminderHour:
        typeof input?.notifications?.horoscopeReminderHour === "number"
          ? input.notifications.horoscopeReminderHour
          : 7,
      horoscopeLastSentDate: input?.notifications?.horoscopeLastSentDate ?? "",
      horoscopePreferredSign: input?.notifications?.horoscopePreferredSign ?? "Aries",
      horoscopeSystem: input?.notifications?.horoscopeSystem ?? "vedic"
    },
    unlocks: Array.isArray(input?.unlocks) ? input.unlocks.filter(Boolean) as FeatureUnlock[] : [],
    usage: {
      chatDate: usageDate,
      chatCount: usageDate === getTodayStamp() ? usageCount : 0,
      tarotDate,
      tarotSingleCount: tarotDate === getTodayStamp() ? tarotSingleCount : 0,
      tarotThreeCount: tarotDate === getTodayStamp() ? tarotThreeCount : 0
    }
  };
}

export function hasPalmPremiumAccess(user: UserState) {
  return PLAN_CONFIG[user.plan].fullPalm || user.unlocks.includes("palm-full");
}

export function hasKundliPremiumAccess(user: UserState) {
  return PLAN_CONFIG[user.plan].fullKundli || user.unlocks.includes("kundli-full");
}

export function hasKundliRareChartAccess(user: UserState) {
  return isPlanAtLeast(user.plan, "VIP");
}

export function hasTarotPremiumAccess(user: UserState) {
  return PLAN_CONFIG[user.plan].fullTarot || user.unlocks.includes("tarot-premium");
}

export function hasTarotCrossReadingAccess(user: UserState) {
  return isPlanAtLeast(user.plan, "Premium");
}

export function hasHoroscopePremiumAccess(user: UserState) {
  return PLAN_CONFIG[user.plan].fullHoroscope;
}

export function hasHoroscopePersonalizationAccess(user: UserState) {
  return isPlanAtLeast(user.plan, "Premium");
}

export function hasTarotJournalAccess(user: UserState) {
  return PLAN_CONFIG[user.plan].tarotJournal || user.unlocks.includes("tarot-premium");
}

export function getRemainingChatQuestions(user: UserState) {
  const limit = PLAN_CONFIG[user.plan].dailyChatLimit;
  if (limit === null) {
    return null;
  }

  const count = user.usage.chatDate === getTodayStamp() ? user.usage.chatCount : 0;
  return Math.max(0, limit - count);
}

export function consumeChatQuestion(user: UserState): UserState {
  const normalized = normalizeUserState(user);
  const limit = PLAN_CONFIG[normalized.plan].dailyChatLimit;

  if (limit === null) {
    return normalized;
  }

  return {
    ...normalized,
    usage: {
      ...normalized.usage,
      chatDate: getTodayStamp(),
      chatCount: normalized.usage.chatCount + 1
    }
  };
}

export function getRemainingTarotDraws(user: UserState, spreadId: TarotSpreadId) {
  if (hasTarotPremiumAccess(user)) {
    return null;
  }

  const today = getTodayStamp();
  const singleCount = user.usage.tarotDate === today ? user.usage.tarotSingleCount : 0;
  const threeCount = user.usage.tarotDate === today ? user.usage.tarotThreeCount : 0;

  if (spreadId === "single") {
    return Math.max(0, 1 - singleCount);
  }

  if (spreadId === "three") {
    return Math.max(0, 1 - threeCount);
  }

  if (spreadId === "yes-no" || spreadId === "new-moon") {
    return null;
  }

  return 0;
}

export function consumeTarotDraw(user: UserState, spreadId: TarotSpreadId): UserState {
  const normalized = normalizeUserState(user);
  if (hasTarotPremiumAccess(normalized)) {
    return normalized;
  }

  const today = getTodayStamp();
  const carryingForward = normalized.usage.tarotDate === today;
  const baseUsage = {
    ...normalized.usage,
    tarotDate: today,
    tarotSingleCount: carryingForward ? normalized.usage.tarotSingleCount : 0,
    tarotThreeCount: carryingForward ? normalized.usage.tarotThreeCount : 0
  };

  if (spreadId === "single") {
    return {
      ...normalized,
      usage: {
        ...baseUsage,
        tarotSingleCount: baseUsage.tarotSingleCount + 1
      }
    };
  }

  if (spreadId === "three") {
    return {
      ...normalized,
      usage: {
        ...baseUsage,
        tarotThreeCount: baseUsage.tarotThreeCount + 1
      }
    };
  }

  return {
    ...normalized,
    usage: baseUsage
  };
}

export function unlockFeatureWithCoins(user: UserState, unlock: FeatureUnlock, cost: number) {
  if (user.unlocks.includes(unlock) || user.coins < cost) {
    return user;
  }

  return {
    ...user,
    coins: user.coins - cost,
    unlocks: [...user.unlocks, unlock]
  };
}
