import type { PalmReading } from "@/lib/types";

export function buildPalmReading(name: string, hand = "Right"): PalmReading {
  return {
    title: `Palm Reading Report for ${name}`,
    summary:
      "Your palm shows a balanced emotional nature, a thoughtful mind, and a life path shaped by steady growth rather than sudden extremes. The free report below highlights your three foundational lines, while premium reading areas reveal relationship timing, ambition markers, and mount-based strengths.",
    handAnalyzed: hand,
    generatedAt: new Date().toISOString(),
    provider: "fallback",
    disclaimer:
      "For entertainment and self-reflection purposes only. Your choices shape far more than any line.",
    sections: [
      {
        title: "Heart Line",
        rating: "Love Flow 8/10",
        observation: "A gently curved heart line with moderate depth suggests warmth without emotional chaos.",
        meaning: "You tend to care deeply, but you still need sincerity and stability before fully opening up. Relationships improve when you speak your needs early instead of assuming they will be sensed."
      },
      {
        title: "Head Line",
        rating: "Mind Clarity 7/10",
        observation: "The head line appears even and practical, with a slight downward drift toward imagination.",
        meaning: "Your thinking blends realism with intuition. You are strongest when you can structure ideas clearly and still leave room for creative instinct."
      },
      {
        title: "Life Line",
        rating: "Vitality 8/10",
        observation: "The life line appears steady and rounded, pointing to durable energy with a few reflective phases.",
        meaning: "This usually points to resilience, family influence, and a life shaped by gradual self-definition. Periods of rest and reset are part of your rhythm, not a setback."
      },
      {
        title: "Fate Line",
        rating: "Career Destiny 7/10",
        observation: "A moderate fate line points to self-made progress with stronger momentum later than earlier.",
        meaning: "Your direction becomes clearer with age and experience. Work that combines trust, visibility, and ownership tends to suit you best."
      },
      {
        title: "Sun Line",
        rating: "Recognition 6/10",
        observation: "The sun line is subtle, suggesting recognition comes through quality and persistence rather than spectacle.",
        meaning: "You are more likely to build a respected name over time than chase instant attention. Creative confidence grows when you allow yourself to be seen consistently."
      },
      {
        title: "Mercury + Marriage",
        rating: "Connection 7/10",
        observation: "Fine communication markers and relationship lines suggest selective but meaningful bonds.",
        meaning: "You thrive in partnerships where honesty and growth matter more than performance. Clear communication is one of your strongest relationship remedies."
      }
    ]
  };
}

export function buildChatReply(message: string) {
  return {
    content:
      message.trim().length === 0
        ? "Share what is on your mind, and I will reflect it back with grounded astrological guidance."
        : `The energy around "${message}" feels like a season of preparation rather than pressure. Take the next practical step, stay patient with timing, and let clarity build through consistent action.`
  };
}
