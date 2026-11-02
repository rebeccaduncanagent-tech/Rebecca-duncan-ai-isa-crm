"use client";

import { useCallback, useEffect, useState } from "react";
import { LEAD_STATUSES, TEMPERATURES } from "@/lib/schemas";
import type { Lead, LeadStatus } from "@/lib/types";

function locationSummary(lead: Lead) {
  return lead.leadType === "buyer"
    ? lead.location.targetAreas.join(", ")
    : `${lead.location.street}, ${lead.location.city} ${lead.location.zip}`;
}

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [type, setType] = useState("");
  const [temperature, setTemperature] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (temperature) qs.set("temperature", temperature);
    if (status) qs.set("status", status);
    try {
      const res = await fetch(`/api/leads?${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setLeads((await res.json()).leads);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [type, temperature, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function updateStatus(id: string, next: LeadStatus) {
    const res = await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
    if (!res.ok) setError("Failed to update status");
  }

  return (
    <>
      <div className="filters">
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>
        <label>
          Temperature
          <select
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          >
            <option value="">All</option>
            {TEMPERATURES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : leads.length === 0 ? (
        <p className="muted">No leads yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Created</th>
                <th>Lead</th>
                <th>Type</th>
                <th>Location</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.leadId}>
                  <td>{new Date(lead.createdAt).toLocaleString()}</td>
                  <td>
                    {lead.contact.name}
                    <br />
                    <span className="muted">
                      {lead.contact.email} · {lead.contact.phone}
                    </span>
                  </td>
                  <td>{lead.leadType}</td>
                  <td>{locationSummary(lead)}</td>
                  <td>
                    {lead.score}{" "}
                    <span className={`pill ${lead.temperature}`}>
                      {lead.temperature}
                    </span>
                  </td>
                  <td>
                    <select
                      aria-label={`Status for ${lead.contact.name}`}
                      value={lead.status}
                      onChange={(e) =>
                        void updateStatus(
                          lead.leadId,
                          e.target.value as LeadStatus,
                        )
                      }
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
