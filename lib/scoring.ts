import type { LeadInput, Temperature } from "./types";

const TIMELINE_POINTS = { asap: 30, "0-3": 22, "3-6": 10, "6+": 3 } as const;
const SELLER_TIMELINE_POINTS = {
  asap: 35,
  "0-3": 26,
  "3-6": 12,
  "6+": 4,
} as const;
const PRE_APPROVAL_POINTS = { yes: 35, in_progress: 15, no: 0 } as const;
const MOTIVATED_REASONS = new Set([
  "relocating",
  "job_change",
  "financial",
  "inherited",
  "divorce",
]);

/** Deterministic 0-100 score. Contact + consent are required, so worth 5 base points. */
export function scoreLead(lead: LeadInput): number {
  let score = 5;
  if (lead.leadType === "buyer") {
    const { budget, beds, baths, timeline, preApproval } = lead.answers;
    score += PRE_APPROVAL_POINTS[preApproval];
    score += TIMELINE_POINTS[timeline];
    if (budget.min > 0 && budget.max > 0) score += 15;
    else if (budget.max > 0) score += 8;
    if (lead.location.targetAreas.length > 0) score += 10;
    if (beds > 0 && baths > 0) score += 5;
  } else {
    const { answers, location } = lead;
    score += SELLER_TIMELINE_POINTS[answers.timeline];
    if (location.street && location.city && location.zip) score += 25;
    if (MOTIVATED_REASONS.has(answers.reason)) score += 20;
    else if (answers.reason === "downsizing" || answers.reason === "upsizing")
      score += 14;
    else if (answers.reason === "other") score += 8;
    if (answers.priceExpectation.min > 0 && answers.priceExpectation.max > 0)
      score += 10;
    score += 5;
  }
  return Math.max(0, Math.min(100, score));
}

export function temperatureFor(score: number): Temperature {
  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "nurture";
}
