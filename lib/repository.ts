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
      .filter(
        (l) =>
          (!filter.type || l.leadType === filter.type) &&
          (!filter.status || l.status === filter.status) &&
          (!filter.temperature || l.temperature === filter.temperature),
      )
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

// Survives Next.js dev hot reloads. Data is lost on restart/serverless cold start (v1 limitation).
const globalForRepo = globalThis as unknown as { leadRepo?: LeadRepository };

export function getLeadRepository(): LeadRepository {
  globalForRepo.leadRepo ??= new InMemoryLeadRepository();
  return globalForRepo.leadRepo;
}
