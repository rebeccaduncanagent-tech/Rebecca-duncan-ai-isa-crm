import { getServerEnv } from "../env";
import { OpenAIQualifier } from "./openai";
import { RulesQualifier } from "./rules";
import type { AIQualifier } from "./types";

export type { AIQualifier } from "./types";

/** Chooses the qualifier via the AI_PROVIDER env flag (rules | openai). */
export function getQualifier(): AIQualifier {
  return getServerEnv().AI_PROVIDER === "openai"
    ? new OpenAIQualifier()
    : new RulesQualifier();
}
