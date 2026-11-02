"use client";

import { useState } from "react";
import { AiDisclosure, ConsentCheckbox } from "./Disclosures";
import { Success } from "./Success";
import { TIMELINE_OPTIONS } from "./options";
import { useLeadSubmit } from "./useLeadSubmit";

export function SellerForm() {
  const { submit, submitting, done, error } = useLeadSubmit();
  const [consent, setConsent] = useState(false);

  if (done) return <Success />;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    void submit({
      leadType: "seller",
      contact: { name: get("name"), email: get("email"), phone: get("phone") },
      location: { street: get("street"), city: get("city"), zip: get("zip") },
      answers: {
        propertyType: get("propertyType"),
        beds: Number(get("beds")),
        baths: Number(get("baths")),
        condition: get("condition"),
        timeline: get("timeline"),
        priceExpectation: {
          min: Number(get("priceMin")),
          max: Number(get("priceMax")),
        },
        reason: get("reason"),
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
        Property street address
        <input name="street" required autoComplete="address-line1" />
      </label>
      <div className="grid2">
        <label className="field">
          City
          <input name="city" required autoComplete="address-level2" />
        </label>
        <label className="field">
          ZIP
          <input name="zip" required autoComplete="postal-code" />
        </label>
      </div>
      <div className="grid2">
        <label className="field">
          Property type
          <select name="propertyType" defaultValue="single_family">
            <option value="single_family">Single family</option>
            <option value="condo">Condo</option>
            <option value="townhome">Townhome</option>
            <option value="multi_family">Multi-family</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="field">
          Condition
          <select name="condition" defaultValue="move_in_ready">
            <option value="move_in_ready">Move-in ready</option>
            <option value="needs_minor_work">Needs minor work</option>
            <option value="needs_major_work">Needs major work</option>
          </select>
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
            defaultValue={3}
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
            defaultValue={2}
            required
          />
        </label>
      </div>
      <div className="grid2">
        <label className="field">
          Price expectation min ($)
          <input name="priceMin" type="number" min={0} step={1000} required />
        </label>
        <label className="field">
          Price expectation max ($)
          <input name="priceMax" type="number" min={0} step={1000} required />
        </label>
      </div>
      <div className="grid2">
        <label className="field">
          Desired timeline
          <select name="timeline" defaultValue="0-3">
            {TIMELINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Reason for selling
          <select name="reason" defaultValue="other">
            <option value="relocating">Relocating</option>
            <option value="job_change">Job change</option>
            <option value="downsizing">Downsizing</option>
            <option value="upsizing">Upsizing</option>
            <option value="financial">Financial</option>
            <option value="inherited">Inherited property</option>
            <option value="divorce">Divorce</option>
            <option value="other">Other</option>
            <option value="just_curious">Just curious about value</option>
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
        {submitting ? "Submitting..." : "Request my home consultation"}
      </button>
    </form>
  );
}
