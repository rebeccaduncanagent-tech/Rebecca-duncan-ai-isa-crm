import type { z } from "zod";
import type {
  LEAD_STATUSES,
  TEMPERATURES,
  buyerLeadSchema,
  leadFilterSchema,
  leadInputSchema,
  sellerLeadSchema,
} from "./schemas";

export type LeadInput = z.infer<typeof leadInputSchema>;
export type BuyerLeadInput = z.infer<typeof buyerLeadSchema>;
export type SellerLeadInput = z.infer<typeof sellerLeadSchema>;
export type LeadFilter = z.infer<typeof leadFilterSchema>;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type Temperature = (typeof TEMPERATURES)[number];

export interface QualificationResult {
  summary: string;
  missingFields: string[];
  followUpQuestions: string[];
  confidence: number;
}

export interface SyncResult {
  success: boolean;
  statusCode: number;
  message: string;
}

export type LeadRecord = {
  leadId: string;
  createdAt: string;
  consentedAt: string;
  score: number;
  temperature: Temperature;
  status: LeadStatus;
  qualification: QualificationResult;
};

export type Lead = LeadInput & LeadRecord;
