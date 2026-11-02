import type { LeadInput, QualificationResult } from "../types";
import type { AIQualifier } from "./types";

/*
 * FAIR HOUSING GUARDRAIL: qualification questions and summaries must only
 * concern the buyer's/seller's stated needs (budget, timeline, property
 * details). Never ask about, infer, or steer by protected classes (race,
 * color, religion, sex, disability, familial status, national origin, etc.)
 * and never recommend or discourage neighborhoods based on who lives there.
 * If a user asks for demographic info about an area, politely decline and
 * refer them to official sources or a licensed agent.
 */
export class RulesQualifier implements AIQualifier {
  async qualifyLead(lead: LeadInput): Promise<QualificationResult> {
    const missingFields: string[] = [];
    const followUpQuestions: string[] = [];
    let summary: string;
    let totalChecks: number;

    if (lead.leadType === "buyer") {
      const { budget, preApproval, timeline, beds, baths } = lead.answers;
      totalChecks = 5;
      summary = `Buyer targeting ${lead.location.targetAreas.join(", ")}; budget $${budget.min.toLocaleString("en-US")}-$${budget.max.toLocaleString("en-US")}; ${beds} bd/${baths} ba; timeline ${timeline}; pre-approval: ${preApproval}.`;
      if (budget.min <= 0 || budget.max <= 0) {
        missingFields.push("budget");
        followUpQuestions.push(
          "What monthly payment or price range is comfortable?",
        );
      }
      if (preApproval !== "yes") {
        missingFields.push("preApproval");
        followUpQuestions.push(
          "Would you like an introduction to a trusted lender to get pre-approved?",
        );
      }
      if (timeline === "6+") {
        followUpQuestions.push(
          "What would make you move sooner than 6 months?",
        );
      }
      if (beds <= 0) missingFields.push("beds");
      if (baths <= 0) missingFields.push("baths");
    } else {
      const { answers, location } = lead;
      totalChecks = 5;
      summary = `Seller at ${location.street}, ${location.city} ${location.zip}; ${answers.propertyType.replace("_", " ")}, ${answers.beds} bd/${answers.baths} ba; condition ${answers.condition}; timeline ${answers.timeline}; reason: ${answers.reason}.`;
      if (
        answers.priceExpectation.min <= 0 ||
        answers.priceExpectation.max <= 0
      ) {
        missingFields.push("priceExpectation");
        followUpQuestions.push("What price are you hoping to achieve?");
      }
      if (answers.condition !== "move_in_ready") {
        followUpQuestions.push(
          "What updates or repairs does the home need before listing?",
        );
      }
      if (answers.reason === "other" || answers.reason === "just_curious") {
        followUpQuestions.push("What is prompting you to consider selling?");
      }
      if (answers.beds <= 0) missingFields.push("beds");
      if (answers.baths <= 0) missingFields.push("baths");
    }

    if (!lead.notes) {
      followUpQuestions.push("Is there anything else we should know?");
    }

    const confidence = Number(
      Math.max(0.2, 1 - missingFields.length / totalChecks).toFixed(2),
    );
    return { summary, missingFields, followUpQuestions, confidence };
  }
}
