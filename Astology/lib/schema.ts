import { z } from "zod";
import { HOROSCOPE_PERIODS, HOROSCOPE_SIGNS, HOROSCOPE_SYSTEMS } from "@/lib/horoscope-types";

export const kundliFormSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().min(1),
  placeOfBirth: z.string().min(1),
  chartStyle: z.string().min(1),
  plan: z.enum(["Free", "Basic", "Premium", "VIP"]).optional().default("Free"),
  fullAccess: z.boolean().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  timezone: z.string().optional()
});

export const palmAnalyzeSchema = z.object({
  name: z.string().optional().default("Seeker"),
  hand: z.string().optional().default("Right"),
  imageDataUrl: z.string().optional(),
  fullAccess: z.boolean().optional().default(false)
});

const birthProfileSchema = z.object({
  dateOfBirth: z.string().optional().default(""),
  timeOfBirth: z.string().optional().default(""),
  placeOfBirth: z.string().optional().default(""),
  latitude: z.string().optional().default(""),
  longitude: z.string().optional().default(""),
  timezone: z.string().optional().default("")
});

export const tarotDrawSchema = z.object({
  mode: z.enum(["spread", "daily"]).default("spread"),
  deckId: z.enum(["rider-waite", "thoth", "osho-zen", "lenormand", "angel-oracle", "vedic-tarot"]),
  spreadId: z.enum([
    "single",
    "three",
    "yes-no",
    "celtic-cross",
    "relationship",
    "career-finance",
    "year-ahead",
    "chakra",
    "shadow-work",
    "new-moon",
    "full-moon",
    "eclipse"
  ]),
  question: z.string().optional().default(""),
  layoutVariant: z.string().optional(),
  userName: z.string().optional().default("Seeker"),
  plan: z.enum(["Free", "Basic", "Premium", "VIP"]).optional().default("Free"),
  birthProfile: birthProfileSchema.optional()
});

const tarotReadingCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  arcana: z.enum(["major", "minor", "oracle"]),
  suit: z.string().nullable(),
  keywords: z.array(z.string()),
  orientation: z.enum(["upright", "reversed"]),
  positionLabel: z.string(),
  imageUrl: z.string(),
  element: z.string(),
  planet: z.string(),
  zodiac: z.string(),
  numerology: z.number().nullable()
});

export const tarotReadingSchema = z.object({
  id: z.string(),
  deckId: z.enum(["rider-waite", "thoth", "osho-zen", "lenormand", "angel-oracle", "vedic-tarot"]),
  deckLabel: z.string(),
  spreadId: z.enum([
    "single",
    "three",
    "yes-no",
    "celtic-cross",
    "relationship",
    "career-finance",
    "year-ahead",
    "chakra",
    "shadow-work",
    "new-moon",
    "full-moon",
    "eclipse"
  ]),
  spreadLabel: z.string(),
  question: z.string(),
  createdAt: z.string(),
  acknowledgement: z.string(),
  cards: z.array(tarotReadingCardSchema),
  cardReadings: z.array(
    z.object({
      positionLabel: z.string(),
      insight: z.string()
    })
  ),
  narrative: z.string(),
  guidance: z.array(z.string()),
  affirmation: z.string(),
  provider: z.enum(["openai", "fallback"]),
  crossInsights: z.object({
    kundli: z.string(),
    numerology: z.string()
  }),
  notes: z.string().optional()
});

export const tarotJournalQuerySchema = z.object({
  userId: z.string().min(1)
});

export const tarotJournalSaveSchema = z.object({
  userId: z.string().min(1),
  reading: tarotReadingSchema
});

export const tarotJournalDeleteSchema = z.object({
  userId: z.string().min(1),
  readingId: z.string().min(1)
});

export const horoscopeRequestSchema = z.object({
  sign: z.enum(HOROSCOPE_SIGNS),
  period: z.enum(HOROSCOPE_PERIODS).default("daily"),
  system: z.enum(HOROSCOPE_SYSTEMS).default("vedic"),
  plan: z.enum(["Free", "Basic", "Premium", "VIP"]).optional().default("Free"),
  userName: z.string().optional().default("Seeker"),
  birthProfile: birthProfileSchema.optional(),
  location: z
    .object({
      place: z.string().optional().default(""),
      latitude: z.string().optional().default(""),
      longitude: z.string().optional().default(""),
      timezone: z.string().optional().default("")
    })
    .optional()
});
