import { z } from "zod";

export const TIMELINES = ["asap", "0-3", "3-6", "6+"] as const;
export const PRE_APPROVALS = ["yes", "in_progress", "no"] as const;
export const PROPERTY_TYPES = [
  "single_family",
  "condo",
  "townhome",
  "multi_family",
  "other",
] as const;
export const CONDITIONS = [
  "move_in_ready",
  "needs_minor_work",
  "needs_major_work",
] as const;
export const SELLING_REASONS = [
  "relocating",
  "job_change",
  "downsizing",
  "upsizing",
  "financial",
  "inherited",
  "divorce",
  "other",
  "just_curious",
] as const;
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "nurtured",
] as const;
export const TEMPERATURES = ["hot", "warm", "nurture"] as const;
export const LEAD_TYPES = ["buyer", "seller"] as const;

const text = (max = 200) => z.string().trim().min(1).max(max);
const money = z.number().int().min(0).max(1_000_000_000);
const rangeOrdered = (r: { min: number; max: number }) => r.max >= r.min;

const contactSchema = z.object({
  name: text(100),
  email: z.email().max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-.\s\d]{7,20}$/, "Enter a valid phone number"),
});

const consentSchema = z.object({
  contactSms: z
    .boolean()
    .refine((v) => v === true, "Consent is required to be contacted"),
});

const notesSchema = z.string().trim().max(2000).optional();

export const buyerLeadSchema = z.object({
  leadType: z.literal("buyer"),
  contact: contactSchema,
  location: z.object({ targetAreas: z.array(text(80)).min(1).max(20) }),
  answers: z.object({
    budget: z
      .object({ min: money, max: money })
      .refine(rangeOrdered, "Max budget must be at least min budget"),
    beds: z.number().int().min(0).max(20),
    baths: z.number().min(0).max(20),
    timeline: z.enum(TIMELINES),
    preApproval: z.enum(PRE_APPROVALS),
  }),
  notes: notesSchema,
  consent: consentSchema,
  source: text(50).default("website"),
});

export const sellerLeadSchema = z.object({
  leadType: z.literal("seller"),
  contact: contactSchema,
  location: z.object({
    street: text(150),
    city: text(80),
    zip: z
      .string()
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  }),
  answers: z.object({
    propertyType: z.enum(PROPERTY_TYPES),
    beds: z.number().int().min(0).max(20),
    baths: z.number().min(0).max(20),
    condition: z.enum(CONDITIONS),
    timeline: z.enum(TIMELINES),
    priceExpectation: z
      .object({ min: money, max: money })
      .refine(rangeOrdered, "Max price must be at least min price"),
    reason: z.enum(SELLING_REASONS),
  }),
  notes: notesSchema,
  consent: consentSchema,
  source: text(50).default("website"),
});

export const leadInputSchema = z.discriminatedUnion("leadType", [
  buyerLeadSchema,
  sellerLeadSchema,
]);

export const statusUpdateSchema = z.object({ status: z.enum(LEAD_STATUSES) });

export const leadFilterSchema = z.object({
  type: z.enum(LEAD_TYPES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  temperature: z.enum(TEMPERATURES).optional(),
});
