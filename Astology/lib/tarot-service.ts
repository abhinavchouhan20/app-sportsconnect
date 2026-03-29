import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { buildKundliSnapshot } from "@/lib/kundli-engine";
import { getOpenAIClient } from "@/lib/openai";
import { TAROT_SYSTEM_PROMPT } from "@/lib/prompts";
import { getDeckCards, getDeckLabel, getSpreadConfig, type TarotCard, type TarotDeckId, type TarotReading, type TarotReadingCard, type TarotSpreadId } from "@/lib/tarot-data";
import type { BirthProfile, PlanTier } from "@/lib/types";

const interpretationSchema = z.object({
  acknowledgement: z.string(),
  cardReadings: z.array(
    z.object({
      positionLabel: z.string(),
      insight: z.string()
    })
  ),
  narrative: z.string(),
  guidance: z.array(z.string()).min(3).max(3),
  affirmation: z.string(),
  kundliBridge: z.string().optional(),
  numerologyBridge: z.string().optional()
});

type DrawInput = {
  mode: "spread" | "daily";
  deckId: TarotDeckId;
  spreadId: TarotSpreadId;
  question: string;
  layoutVariant?: string;
  userName?: string;
  birthProfile?: BirthProfile;
  plan?: PlanTier;
};

export async function drawTarotReading(input: DrawInput): Promise<TarotReading> {
  const spread = getSpreadConfig(input.spreadId, input.layoutVariant);
  const cards = drawCards({
    deckId: input.deckId,
    count: spread.positions.length,
    personalSeed: `${input.birthProfile?.dateOfBirth || ""}|${input.userName || ""}|${input.question}|${input.spreadId}|${randomBytes(12).toString("hex")}`
  }).map((card, index) => ({
    ...card,
    positionLabel: spread.positions[index] ?? `Card ${index + 1}`
  }));

  return buildReading({
    input,
    cards,
    spreadLabel: spread.label
  });
}

export async function getDailyTarotReading(input: DrawInput): Promise<TarotReading> {
  const today = new Date().toISOString().slice(0, 10);
  const cards = drawCards({
    deckId: input.deckId,
    count: 1,
    personalSeed: `${today}|${input.birthProfile?.dateOfBirth || ""}|${input.userName || "Seeker"}|daily`
  }).map((card) => ({
    ...card,
    positionLabel: "Card of the Day"
  }));

  return buildReading({
    input: {
      ...input,
      spreadId: "single",
      question: input.question || "What energy surrounds me today?"
    },
    cards,
    spreadLabel: "Daily Card of the Day"
  });
}

async function buildReading({
  input,
  cards,
  spreadLabel
}: {
  input: DrawInput;
  cards: TarotReadingCard[];
  spreadLabel: string;
}): Promise<TarotReading> {
  const allowCross = input.plan === "Premium" || input.plan === "VIP";
  const kundliSnapshot = allowCross ? getKundliContext(input.birthProfile, input.userName) : "";
  const numerologyContext = allowCross ? getNumerologyContext(input.birthProfile) : "";
  const fallback = buildFallbackReading({
    input,
    cards,
    spreadLabel,
    kundliSnapshot,
    numerologyContext
  });
  const client = getOpenAIClient();

  if (!client) {
    return fallback;
  }

  try {
    const response = await client.responses.parse({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: TAROT_SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Deck: ${getDeckLabel(input.deckId)}`,
                `Spread: ${spreadLabel}`,
                `Question: ${input.question || "General guidance"}`,
                `Cards: ${cards.map((card) => `${card.positionLabel}: ${card.name} (${card.orientation})`).join("; ")}`,
                kundliSnapshot ? `Kundli bridge: ${kundliSnapshot}` : "Kundli bridge: not available or not unlocked.",
                numerologyContext ? `Numerology bridge: ${numerologyContext}` : "Numerology bridge: not available.",
                "Return warm, empowering, practical guidance."
              ].join("\n")
            }
          ]
        }
      ],
      text: {
        format: zodTextFormat(interpretationSchema, "tarot_interpretation")
      }
    });

    if (!response.output_parsed) {
      return fallback;
    }

    return {
      ...fallback,
      provider: "openai",
      acknowledgement: response.output_parsed.acknowledgement,
      cardReadings: response.output_parsed.cardReadings,
      narrative: response.output_parsed.narrative,
      guidance: response.output_parsed.guidance,
      affirmation: response.output_parsed.affirmation,
      crossInsights: {
        kundli: response.output_parsed.kundliBridge || fallback.crossInsights.kundli,
        numerology: response.output_parsed.numerologyBridge || fallback.crossInsights.numerology
      }
    };
  } catch {
    return fallback;
  }
}

function buildFallbackReading({
  input,
  cards,
  spreadLabel,
  kundliSnapshot,
  numerologyContext
}: {
  input: DrawInput;
  cards: TarotReadingCard[];
  spreadLabel: string;
  kundliSnapshot: string;
  numerologyContext: string;
}): TarotReading {
  const acknowledgement = input.question
    ? `For your ${spreadLabel.toLowerCase()} on "${input.question}", these are the cards that came forward.`
    : `These are the cards that came forward for your ${spreadLabel.toLowerCase()}.`;

  const cardReadings = cards.map((card) => ({
    positionLabel: card.positionLabel,
    insight: buildCardInsight(card, input.question)
  }));

  const narrative = `${cards[0]?.name || "This card"} opens the reading with ${cards[0]?.keywords[0] || "a strong symbolic message"}, while ${cards[cards.length - 1]?.name || "the final card"} shows where the energy wants to land next. Taken together, the spread describes a story of ${cards.map((card) => card.keywords[0]).filter(Boolean).join(", ")}, asking for honesty with what is changing and faith in what is quietly aligning.`;

  const guidance = [
    `Name the real question beneath the question, because ${cards[0]?.name || "the opening card"} suggests clarity begins with emotional honesty.`,
    `Act on the card in the action position first, even if the full outcome is not visible yet.`,
    `Return to what steadies your nervous system before making a major choice, so the reading becomes grounded guidance rather than pure intensity.`
  ];

  const affirmation = `I trust the message of this moment, and I move with courage, clarity, and self-respect.`;
  const allowCross = input.plan === "Premium" || input.plan === "VIP";

  return {
    id: createHash("sha256").update(`${Date.now()}|${Math.random()}`).digest("hex").slice(0, 16),
    deckId: input.deckId,
    deckLabel: getDeckLabel(input.deckId),
    spreadId: input.spreadId,
    spreadLabel,
    question: input.question,
    createdAt: new Date().toISOString(),
    acknowledgement,
    cards,
    cardReadings,
    narrative,
    guidance,
    affirmation,
    provider: "fallback",
    crossInsights: {
      kundli: allowCross
        ? kundliSnapshot || "Save birth details to activate kundli-linked tarot interpretation."
        : "Tarot + Kundli cross-reading is available on paid plans.",
      numerology: allowCross
        ? numerologyContext || "A full date of birth is needed for numerology cross-reading."
        : "Tarot + Numerology cross-reading is available on paid plans."
    }
  };
}

function buildCardInsight(card: TarotReadingCard, question: string) {
  const area = inferQuestionArea(question);
  return `${card.name} in the ${card.positionLabel.toLowerCase()} position emphasizes ${card.keywords.join(", ")}. In ${area} matters, this card asks you to work with ${card.orientation === "upright" ? "its direct lesson" : "the shadow side of the lesson"} rather than reacting to it on autopilot.`;
}

function inferQuestionArea(question: string) {
  const text = question.toLowerCase();
  if (/(love|relationship|partner|spouse|dating)/.test(text)) {
    return "relationship";
  }
  if (/(career|job|work|business|money|finance)/.test(text)) {
    return "career and money";
  }
  if (/(health|body|stress)/.test(text)) {
    return "wellbeing";
  }
  return "life";
}

function drawCards({
  deckId,
  count,
  personalSeed
}: {
  deckId: TarotDeckId;
  count: number;
  personalSeed: string;
}): TarotReadingCard[] {
  const deck = getDeckCards(deckId);
  const scored = deck
    .map((card) => ({
      card,
      score: createHash("sha256").update(`${personalSeed}|${card.id}`).digest("hex")
    }))
    .sort((a, b) => a.score.localeCompare(b.score))
    .slice(0, count);

  return scored.map(({ card }, index) =>
    toReadingCard(
      card,
      createHash("sha256").update(`${personalSeed}|orientation|${card.id}|${index}`).digest("hex")
    )
  );
}

function toReadingCard(card: TarotCard, orientationHash: string): TarotReadingCard {
  const orientation = parseInt(orientationHash.slice(0, 2), 16) < 179 ? "upright" : "reversed";

  return {
    id: card.id,
    name: card.name,
    arcana: card.arcana,
    suit: card.suit,
    keywords: orientation === "upright" ? card.keywords_upright : card.keywords_reversed,
    orientation,
    positionLabel: "",
    imageUrl: card.image_url,
    element: card.element,
    planet: card.planet,
    zodiac: card.zodiac,
    numerology: card.numerology
  };
}

function getKundliContext(birthProfile: BirthProfile | undefined, userName?: string) {
  if (
    !birthProfile?.dateOfBirth ||
    !birthProfile.timeOfBirth ||
    !(birthProfile.placeOfBirth || (birthProfile.latitude && birthProfile.longitude))
  ) {
    return "";
  }

  try {
    const snapshot = buildKundliSnapshot({
      name: userName || "Seeker",
      dateOfBirth: birthProfile.dateOfBirth,
      timeOfBirth: birthProfile.timeOfBirth,
      placeOfBirth:
        birthProfile.placeOfBirth || `${birthProfile.latitude}, ${birthProfile.longitude}`,
      latitude: birthProfile.latitude,
      longitude: birthProfile.longitude,
      timezone: birthProfile.timezone,
      chartStyle: "North Indian",
      fullAccess: false
    });

    return `The cards echo a ${snapshot.lagna.sign} Lagna / ${snapshot.moonSign} Moon pattern, with the current ${snapshot.dasha.current} dasha coloring timing. This makes the spread especially relevant to ${snapshot.nakshatra} themes and the chart's present karmic cycle.`;
  } catch {
    return "";
  }
}

function getNumerologyContext(birthProfile: BirthProfile | undefined) {
  if (!birthProfile?.dateOfBirth) {
    return "";
  }

  const digits = birthProfile.dateOfBirth
    .replaceAll("-", "")
    .split("")
    .map(Number)
    .filter((digit) => Number.isFinite(digit));
  if (digits.length === 0) {
    return "";
  }

  let sum = digits.reduce((total, value) => total + value, 0);
  while (![11, 22, 33].includes(sum) && sum > 9) {
    sum = sum
      .toString()
      .split("")
      .map(Number)
      .reduce((total, value) => total + value, 0);
  }

  return `Your birth date reduces to a Life Path ${sum}, so cards carrying the same number or nearby numerology can feel especially resonant right now.`;
}
