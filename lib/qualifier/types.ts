import type { LeadInput, QualificationResult } from "../types";

export interface AIQualifier {
  qualifyLead(leadInput: LeadInput): Promise<QualificationResult>;
}
