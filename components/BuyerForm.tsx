"use client";

import { useState } from "react";
import { AiDisclosure, ConsentCheckbox } from "./Disclosures";
import { Success } from "./Success";
import { TIMELINE_OPTIONS } from "./options";
import { useLeadSubmit } from "./useLeadSubmit";

export function BuyerForm() {
  const { submit, submitting, done, error } = useLeadSubmit();
  const [consent, setConsent] = useState(false);

  if (done) return <Success />;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    void submit({
      leadType: "buyer",
      contact: { name: get("name"), email: get("email"), phone: get("phone") },
      location: {
        targetAreas: get("areas")
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      },
      answers: {
        budget: {
          min: Number(get("budgetMin")),
          max: Number(get("budgetMax")),
        },
        beds: Number(get("beds")),
        baths: Number(get("baths")),
        timeline: get("timeline"),
        preApproval: get("preApproval"),
      },
      notes: get("notes") || undefined,
      consent: { contactSms: consent },
    });
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      <AiDisclosure />
      <label className="field">
        Name
        <input name="name" required autoComplete="name" />
      </label>
      <div className="grid2">
        <label className="field">
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="field">
          Phone
          <input name="phone" type="tel" required autoComplete="tel" />
        </label>
      </div>
      <label className="field">
        Target areas / neighborhoods (comma separated)
        <input
          name="areas"
          required
          placeholder="Lincoln Park, Naperville, Evanston"
        />
      </label>
      <div className="grid2">
        <label className="field">
          Budget min ($)
          <input name="budgetMin" type="number" min={0} step={1000} required />
        </label>
        <label className="field">
          Budget max ($)
          <input name="budgetMax" type="number" min={0} step={1000} required />
        </label>
      </div>
      <div className="grid2">
        <label className="field">
          Beds
          <input
            name="beds"
            type="number"
            min={0}
            max={20}
            defaultValue={2}
            required
          />
        </label>
        <label className="field">
          Baths
          <input
            name="baths"
            type="number"
            min={0}
            max={20}
            step={0.5}
            defaultValue={1}
            required
          />
        </label>
      </div>
      <div className="grid2">
        <label className="field">
          Timeline
          <select name="timeline" defaultValue="0-3">
            {TIMELINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Pre-approval status
          <select name="preApproval" defaultValue="no">
            <option value="yes">Pre-approved</option>
            <option value="in_progress">In progress</option>
            <option value="no">Not yet</option>
          </select>
        </label>
      </div>
      <label className="field">
        Additional notes
        <textarea name="notes" rows={3} maxLength={2000} />
      </label>
      <ConsentCheckbox checked={consent} onChange={setConsent} />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={submitting || !consent}>
        {submitting ? "Submitting..." : "Get matched with an agent"}
      </button>
    </form>
  );
}
