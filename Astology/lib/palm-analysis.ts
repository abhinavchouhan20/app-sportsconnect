import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient } from "@/lib/openai";
import { PALMISTRY_SYSTEM_PROMPT } from "@/lib/prompts";
import { buildPalmReading } from "@/lib/mock-ai";
import type { PalmReading } from "@/lib/types";

const palmSectionSchema = z.object({
  title: z.string(),
  rating: z.string(),
  observation: z.string(),
  meaning: z.string()
});

const palmResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  handAnalyzed: z.string(),
  sections: z.array(palmSectionSchema).min(3).max(6)
});

export async function analyzePalmImage(input: {
  name: string;
  hand: string;
  imageDataUrl?: string;
  fullAccess: boolean;
}): Promise<PalmReading> {
  const fallback = gatePalmReading(buildPalmReading(input.name, input.hand), input.fullAccess);
  const client = getOpenAIClient();

  if (!client || !input.imageDataUrl) {
    return fallback;
  }

  try {
    const response = await client.responses.parse({
      model: process.env.OPENAI_PALM_MODEL ?? "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: PALMISTRY_SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Name: ${input.name || "Seeker"}\nHand analyzed: ${input.hand}\nDescribe what is actually visible in the palm and then interpret it with warmth.`
            },
            {
              type: "input_image",
              image_url: input.imageDataUrl,
              detail: "high"
            }
          ]
        }
      ],
      text: {
        format: zodTextFormat(palmResponseSchema, "palm_report")
      }
    });

    if (!response.output_parsed) {
      return fallback;
    }

    return gatePalmReading(
      {
        ...response.output_parsed,
        generatedAt: new Date().toISOString(),
        provider: "openai",
        disclaimer:
          "For entertainment and self-reflection purposes only. Your choices shape far more than any line."
      },
      input.fullAccess
    );
  } catch {
    return fallback;
  }
}

function gatePalmReading(reading: PalmReading, fullAccess: boolean): PalmReading {
  return {
    ...reading,
    sections: fullAccess ? reading.sections : reading.sections.slice(0, 3)
  };
}
