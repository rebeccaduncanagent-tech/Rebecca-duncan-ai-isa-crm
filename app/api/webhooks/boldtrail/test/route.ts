import { NextResponse } from "next/server";
import { syncLeadToBoldTrail, toBoldTrailPayload } from "@/lib/boldtrail";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";
import { errorResponse } from "@/lib/http";
import type { LeadInput } from "@/lib/types";

const sampleLead: LeadInput = {
  leadType: "buyer",
  contact: {
    name: "Test Lead",
    email: "test.lead@example.com",
    phone: "312-555-0100",
  },
  location: { targetAreas: ["Lincoln Park", "Evanston"] },
  answers: {
    budget: { min: 400000, max: 600000 },
    beds: 3,
    baths: 2,
    timeline: "0-3",
    preApproval: "yes",
  },
  notes: "Sample payload from /api/webhooks/boldtrail/test",
  consent: { contactSms: true },
  source: "boldtrail-test",
};

/** Admin only. Sends a sample lead to BoldTrail, or returns the payload preview (dry run) if no webhook URL is set. */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const payload = toBoldTrailPayload(sampleLead);
    if (!getServerEnv().BOLDTRAIL_WEBHOOK_URL) {
      return NextResponse.json({
        dryRun: true,
        message: "BOLDTRAIL_WEBHOOK_URL not set; nothing was sent.",
        payload,
      });
    }
    const result = await syncLeadToBoldTrail(sampleLead);
    return NextResponse.json(
      { dryRun: false, result, payload },
      { status: result.success ? 200 : 502 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
