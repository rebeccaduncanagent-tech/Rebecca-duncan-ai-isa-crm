import { get, list, put } from "@vercel/blob";
import type { Lead, LeadFilter, LeadStatus } from "./types";

/** Swap this interface's implementation for a database (Postgres, etc.) later. */
export interface LeadRepository {
  create(lead: Lead): Promise<Lead>;
  list(filter?: LeadFilter): Promise<Lead[]>;
  get(leadId: string): Promise<Lead | null>;
  updateStatus(leadId: string, status: LeadStatus): Promise<Lead | null>;
}

class InMemoryLeadRepository implements LeadRepository {
  private leads = new Map<string, Lead>();

  async create(lead: Lead) {
    this.leads.set(lead.leadId, lead);
    return lead;
  }

  async list(filter: LeadFilter = {}) {
    return [...this.leads.values()]
      .filter((l) => matchesFilter(l, filter))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(leadId: string) {
    return this.leads.get(leadId) ?? null;
  }

  async updateStatus(leadId: string, status: LeadStatus) {
    const lead = this.leads.get(leadId);
    if (!lead) return null;
    const updated = { ...lead, status };
    this.leads.set(leadId, updated);
    return updated;
  }
}

function matchesFilter(l: Lead, filter: LeadFilter) {
  return (
    (!filter.type || l.leadType === filter.type) &&
    (!filter.status || l.status === filter.status) &&
    (!filter.temperature || l.temperature === filter.temperature)
  );
}

/**
 * Durable storage in a *private* Vercel Blob store: one JSON file per lead
 * at `leads/<leadId>.json`. Fine for a single agent's lead volume; move to
 * Postgres if this grows to many thousands of leads.
 */
class BlobLeadRepository implements LeadRepository {
  private path(leadId: string) {
    return `leads/${leadId}.json`;
  }

  private async write(lead: Lead) {
    await put(this.path(lead.leadId), JSON.stringify(lead), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }

  private async read(pathname: string): Promise<Lead | null> {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return JSON.parse(await new Response(result.stream).text()) as Lead;
  }

  async create(lead: Lead) {
    await this.write(lead);
    return lead;
  }

  async list(filter: LeadFilter = {}) {
    const pathnames: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: "leads/", cursor, limit: 1000 });
      pathnames.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const leads: Lead[] = [];
    // Read in small batches to stay friendly to the Blob API.
    for (let i = 0; i < pathnames.length; i += 20) {
      const batch = await Promise.all(
        pathnames.slice(i, i + 20).map((p) => this.read(p)),
      );
      for (const lead of batch) if (lead) leads.push(lead);
    }
    return leads
      .filter((l) => matchesFilter(l, filter))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(leadId: string) {
    return this.read(this.path(leadId));
  }

  async updateStatus(leadId: string, status: LeadStatus) {
    const lead = await this.get(leadId);
    if (!lead) return null;
    const updated = { ...lead, status };
    await this.write(updated);
    return updated;
  }
}

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

// In-memory fallback survives Next.js dev hot reloads but is lost on restart,
// so it is only meant for local development.
const globalForRepo = globalThis as unknown as { leadRepo?: LeadRepository };

export function getLeadRepository(): LeadRepository {
  if (!globalForRepo.leadRepo) {
    if (blobConfigured()) {
      globalForRepo.leadRepo = new BlobLeadRepository();
    } else {
      if (process.env.VERCEL) {
        console.warn(
          "[repository] No Blob store connected: leads are kept in memory and WILL be lost. Connect a private Blob store to this project.",
        );
      }
      globalForRepo.leadRepo = new InMemoryLeadRepository();
    }
  }
  return globalForRepo.leadRepo;
}
