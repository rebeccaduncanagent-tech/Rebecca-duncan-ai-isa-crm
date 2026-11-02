import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { syncLeadToBoldTrail } from "@/lib/boldtrail";
import { errorResponse } from "@/lib/http";
import { getQualifier } from "@/lib/qualifier";
import { getLeadRepository } from "@/lib/repository";
import { scoreLead, temperatureFor } from "@/lib/scoring";
import { leadFilterSchema, leadInputSchema } from "@/lib/schemas";
import type { Lead, SyncResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = leadInputSchema.parse(await request.json());
    const score = scoreLead(input);
    const qualification = await getQualifier().qualifyLead(input);
    const now = new Date().toISOString();
    const lead: Lead = {
      ...input,
      leadId: randomUUID(),
      createdAt: now,
      consentedAt: now,
      score,
      temperature: temperatureFor(score),
      status: "new",
      qualification,
    };
    await getLeadRepository().create(lead);

    // Non-blocking by design: a CRM failure must never lose or reject the lead.
    let boldtrail: SyncResult;
    try {
      boldtrail = await syncLeadToBoldTrail(lead);
    } catch (error) {
      boldtrail = { success: false, statusCode: 0, message: String(error) };
    }
    if (!boldtrail.success) {
      console.error("[boldtrail] sync failed:", boldtrail.message);
    }

    return NextResponse.json({ lead, meta: { boldtrail } }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const filter = leadFilterSchema.parse({
      type: params.get("type") ?? undefined,
      status: params.get("status") ?? undefined,
      temperature: params.get("temperature") ?? undefined,
    });
    const leads = await getLeadRepository().list(filter);
    return NextResponse.json({ leads, total: leads.length });
  } catch (error) {
    return errorResponse(error);
  }
}
