import { buildKundliSnapshot } from "@/lib/kundli-engine";
import { getOpenAIClient } from "@/lib/openai";
import { ASTROLOGY_CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { buildChatReply } from "@/lib/mock-ai";
import type { BirthProfile, KundliSnapshot, PlanTier } from "@/lib/types";

export async function buildAstroChatReply(input: {
  message: string;
  userName?: string;
  plan?: PlanTier;
  birthProfile?: BirthProfile;
}) {
  const client = getOpenAIClient();
  const snapshot = getSnapshotFromBirthProfile(input.birthProfile, input.userName);
  const chartContext = snapshot ? buildChatChartContext(snapshot) : "";

  if (!client) {
    return buildContextAwareFallbackReply(input.message, input.userName, snapshot);
  }

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini",
      instructions: ASTROLOGY_CHAT_SYSTEM_PROMPT,
      input: `User: ${input.userName || "Seeker"}\nPlan: ${input.plan || "Free"}\nQuestion: ${input.message}\n${
        chartContext ? `Saved Birth Profile Context:\n${chartContext}\nUse this kundli context naturally in your answer.` : "No birth profile context is available. Offer general astrology guidance and suggest saving birth details for chart-specific advice."
      }\nRespond as a wise Vedic guide in 3-5 sentences.`,
      max_output_tokens: 260
    });

    return {
      content: response.output_text || buildContextAwareFallbackReply(input.message, input.userName, snapshot).content
    };
  } catch {
    return buildContextAwareFallbackReply(input.message, input.userName, snapshot);
  }
}

function getSnapshotFromBirthProfile(birthProfile: BirthProfile | undefined, userName?: string) {
  if (!birthProfile) {
    return null;
  }

  const hasDate = Boolean(birthProfile.dateOfBirth);
  const hasTime = Boolean(birthProfile.timeOfBirth);
  const hasPlace = Boolean(birthProfile.placeOfBirth);
  const hasCoords = Boolean(birthProfile.latitude && birthProfile.longitude);

  if (!hasDate || !hasTime || (!hasPlace && !hasCoords)) {
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

function buildChatChartContext(snapshot: KundliSnapshot) {
  const keyPlanets = snapshot.planets
    .filter((planet) => ["Sun", "Moon", "Mars", "Jupiter", "Venus", "Saturn"].includes(planet.name))
    .map((planet) => `${planet.name}: ${planet.sign} House ${planet.house}`)
    .join("; ");

  const checks = snapshot.flags.map((flag) => `${flag.label}: ${flag.value}`).join("; ");

  return [
    `Lagna: ${snapshot.lagna.sign} ${snapshot.lagna.degree}`,
    `Moon Sign: ${snapshot.moonSign}`,
    `Nakshatra: ${snapshot.nakshatra}`,
    `Current Dasha: ${snapshot.dasha.current} until ${snapshot.dasha.until}`,
    `Key Grahas: ${keyPlanets}`,
    `Chart Checks: ${checks}`
  ].join("\n");
}

function buildContextAwareFallbackReply(message: string, userName: string | undefined, snapshot: KundliSnapshot | null) {
  if (!snapshot) {
    return buildChatReply(message);
  }

  const focus = inferFocus(message);
  const emphasis = getFocusLine(focus, snapshot);

  return {
    content: `${userName || "Seeker"}, your saved birth profile lets me read this through your chart rather than only general guidance. ${emphasis} Your ${snapshot.lagna.sign} Lagna, ${snapshot.moonSign} Moon, and current ${snapshot.dasha.current} dasha suggest that this period rewards steady choices, emotional clarity, and patient timing more than force. Use the next step that strengthens alignment instead of chasing certainty, and if you want, ask about love, marriage, career, money, or timing and I can answer from this kundli context.`
  };
}

function inferFocus(message: string) {
  const text = message.toLowerCase();
  if (/(marriage|relationship|love|partner|spouse)/.test(text)) {
    return "relationships";
  }
  if (/(career|job|profession|business|work|promotion)/.test(text)) {
    return "career";
  }
  if (/(money|wealth|finance|income|earning)/.test(text)) {
    return "money";
  }
  if (/(health|energy|stress|illness)/.test(text)) {
    return "health";
  }
  return "general";
}

function getFocusLine(focus: string, snapshot: KundliSnapshot) {
  switch (focus) {
    case "relationships":
      return `For relationship matters, the first place I would lean is your D9 thread, where the chart points toward ${snapshot.nakshatra} sensitivity and a ${snapshot.moonSign} emotional style that needs trust before commitment deepens.`;
    case "career":
      return `For career matters, your current ${snapshot.dasha.current} dasha and the tone of your ${snapshot.lagna.sign} Lagna suggest progress comes through consistency, visible competence, and long-form effort rather than impulsive moves.`;
    case "money":
      return `For money matters, I would read this as a period to build durable gains rather than chase shortcuts, especially while ${snapshot.dasha.current} is shaping the rhythm of decisions and support systems.`;
    case "health":
      return `For wellbeing, your chart is better used as a timing and self-care lens than a medical verdict, and the current dasha suggests pacing, rest, and routine matter more than extremes.`;
    default:
      return `At the broadest level, your chart shows a mix of ${snapshot.lagna.sign} outward style and ${snapshot.moonSign} inner processing, so clarity comes when action and feeling are kept in the same conversation.`;
  }
}
