import { z } from "zod";
import { getServerEnv } from "../env";
import type { LeadInput, QualificationResult } from "../types";
import { RulesQualifier } from "./rules";
import type { AIQualifier } from "./types";

const responseSchema = z.object({
  summary: z.string(),
  missingFields: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

const SYSTEM_PROMPT = `You are an inside sales assistant for a Chicagoland real estate team.
Summarize the lead and suggest follow-up questions. Respond with JSON only:
{"summary": string, "missingFields": string[], "followUpQuestions": string[], "confidence": number 0-1}.
Fair Housing: never reference or infer protected classes and never steer by neighborhood demographics.`;

/** OpenAI-compatible scaffold. Falls back to rules on any failure so lead capture never breaks. */
export class OpenAIQualifier implements AIQualifier {
  private fallback = new RulesQualifier();

  async qualifyLead(lead: LeadInput): Promise<QualificationResult> {
    try {
      const env = getServerEnv();
      // Only send what qualification needs; omit contact PII.
      const { contact: _contact, ...safeLead } = lead;
      void _contact;
      const res = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: JSON.stringify(safeLead) },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`OpenAI responded ${res.status}`);
      const data = await res.json();
      return responseSchema.parse(
        JSON.parse(data.choices?.[0]?.message?.content ?? "{}"),
      );
    } catch (error) {
      console.error("[qualifier] OpenAI failed, using rules fallback:", error);
      return this.fallback.qualifyLead(lead);
    }
  }
}
