import { getServerEnv } from "./env";
import type { Lead, LeadInput, SyncResult } from "./types";

type BoldTrailSource = LeadInput &
  Partial<Pick<Lead, "leadId" | "score" | "temperature" | "qualification">>;

/**
 * Best-effort generic mapping.
 * TODO: Field names/custom fields differ per BoldTrail account. Confirm the
 * exact webhook contract (names, tags, custom field keys) with your account.
 */
export function toBoldTrailPayload(lead: BoldTrailSource) {
  const [firstName, ...rest] = lead.contact.name.split(/\s+/);
  const base = {
    external_id: lead.leadId,
    first_name: firstName,
    last_name: rest.join(" "),
    email: lead.contact.email,
    phone: lead.contact.phone,
    lead_type: lead.leadType,
    source: lead.source,
    // TODO: map to the account's lead score / rating field.
    score: lead.score,
    temperature: lead.temperature,
    notes: [lead.qualification?.summary, lead.notes].filter(Boolean).join("\n"),
    tags: [lead.leadType, lead.temperature].filter(Boolean),
    consent_sms: lead.consent.contactSms,
  };
  if (lead.leadType === "buyer") {
    return {
      ...base,
      target_areas: lead.location.targetAreas,
      price_min: lead.answers.budget.min,
      price_max: lead.answers.budget.max,
      beds: lead.answers.beds,
      baths: lead.answers.baths,
      timeline: lead.answers.timeline,
      pre_approved: lead.answers.preApproval,
    };
  }
  return {
    ...base,
    address: lead.location.street,
    city: lead.location.city,
    zip: lead.location.zip,
    property_type: lead.answers.propertyType,
    beds: lead.answers.beds,
    baths: lead.answers.baths,
    condition: lead.answers.condition,
    timeline: lead.answers.timeline,
    price_min: lead.answers.priceExpectation.min,
    price_max: lead.answers.priceExpectation.max,
    selling_reason: lead.answers.reason,
  };
}

const isTransient = (status: number) => status === 429 || status >= 500;

async function post(url: string, apiKey: string | undefined, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: confirm auth header scheme for your BoldTrail account.
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
}

/** Sends a lead to BoldTrail; retries once on network errors, 429 and 5xx. Never throws. */
export async function syncLeadToBoldTrail(
  lead: BoldTrailSource,
): Promise<SyncResult> {
  let env;
  try {
    env = getServerEnv();
  } catch (error) {
    return { success: false, statusCode: 0, message: String(error) };
  }
  if (!env.BOLDTRAIL_WEBHOOK_URL) {
    return {
      success: false,
      statusCode: 0,
      message: "BOLDTRAIL_WEBHOOK_URL is not configured; sync skipped",
    };
  }
  const payload = toBoldTrailPayload(lead);
  let last: SyncResult = { success: false, statusCode: 0, message: "not sent" };
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await post(
        env.BOLDTRAIL_WEBHOOK_URL,
        env.BOLDTRAIL_API_KEY,
        payload,
      );
      last = {
        success: res.ok,
        statusCode: res.status,
        message: res.ok
          ? "Synced to BoldTrail"
          : `BoldTrail responded ${res.status}`,
      };
      if (res.ok || !isTransient(res.status)) return last;
    } catch (error) {
      last = {
        success: false,
        statusCode: 0,
        message: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  return last;
}
