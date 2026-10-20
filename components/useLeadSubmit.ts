"use client";

import { useState } from "react";

interface Issue {
  path: string;
  message: string;
}

/** Posts a lead payload to /api/leads and tracks submission state. */
export function useLeadSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: unknown) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const issues: Issue[] = data.issues ?? [];
        setError(
          issues.length
            ? issues.map((i) => `${i.path}: ${i.message}`).join("; ")
            : (data.error ?? "Something went wrong"),
        );
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, done, error };
}
