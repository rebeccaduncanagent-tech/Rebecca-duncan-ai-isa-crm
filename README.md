# Rebecca Duncan Real Estate — AI ISA CRM

A Next.js (App Router, TypeScript) scaffold for capturing and qualifying **Chicagoland** buyer and seller leads for **Rebecca Duncan Real Estate** (sponsored by **eXp Realty**), with **BoldTrail CRM** webhook sync.

> See [DISCLAIMER.md](./DISCLAIMER.md) — not legal advice; verify Fair Housing, TCPA, DNC, and MLS/IDX compliance before production.

## Features

- Landing page (`/`) with "I’m Buying" / "I’m Selling" CTAs
- Buyer (`/buyers`) and seller (`/sellers`) intake forms with AI-assistant disclosure and SMS/contact consent, plus inline confirmation
- Zod validation on every API input
- Deterministic lead scoring and hot/warm/nurture routing
- `AIQualifier` interface: rules-based default, OpenAI-compatible scaffold behind `AI_PROVIDER=openai` (falls back to rules on failure)
- BoldTrail webhook service (one retry on transient errors, typed result)
- Admin dashboard (`/admin/leads`) with filters and quick status updates
- In-memory `LeadRepository` interface, ready to swap for a database

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Environment variables

| Variable                                                                     | Purpose                                                                                 |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_BROKERAGE_NAME`, `NEXT_PUBLIC_MARKET` | Branding copy (defaults: Rebecca Duncan Real Estate / eXp Realty / Chicagoland)         |
| `BOLDTRAIL_WEBHOOK_URL`                                                      | BoldTrail webhook endpoint. If unset, sync is skipped and reported in response metadata |
| `BOLDTRAIL_API_KEY`                                                          | Optional; sent as a `Bearer` Authorization header                                       |
| `AI_PROVIDER`                                                                | `rules` (default) or `openai`                                                           |
| `OPENAI_API_KEY`, `OPENAI_MODEL`                                             | Required when `AI_PROVIDER=openai` (a clear error is raised if the key is missing)      |
| `OPENAI_BASE_URL`                                                            | Optional override for OpenAI-compatible providers                                       |

## API

- `POST /api/leads` — validate, score, qualify, store, attempt BoldTrail sync (failures are logged and returned in `meta.boldtrail`, never blocking)
- `GET /api/leads?type=&status=&temperature=` — list leads
- `PATCH /api/leads/:id/status` — body `{ "status": "new|contacted|qualified|nurtured" }`
- `POST /api/webhooks/boldtrail/test` — (disabled in production) sends a sample lead (or returns a dry-run payload preview if no webhook URL is set)

## How lead scoring works

Scores are 0–100 (`lib/scoring.ts`): **hot ≥ 75**, **warm 45–74**, **nurture < 45**.

- **Buyer:** pre-approval (up to 35), timeline (up to 30), complete budget range (15), target areas (10), beds/baths (5), consent (5)
- **Seller:** timeline (up to 35), complete address (25), motivated reason (up to 20), price range (10), property details (5), consent (5)

## Testing the BoldTrail webhook

```bash
# Dry run (no URL configured) shows the mapped payload
curl -X POST http://localhost:3000/api/webhooks/boldtrail/test

# Set BOLDTRAIL_WEBHOOK_URL (e.g., a webhook.site URL) in .env.local, restart, and repeat
```

Field mapping in `lib/boldtrail.ts` is generic; account-specific field names and auth are marked with `TODO`.

## Deployment (Vercel)

Import the repo in Vercel, set the env vars above, and deploy. The in-memory store is **per serverless instance and not persistent** on Vercel — use a database before real use.

## Tradeoffs / known limitations

- In-memory storage: data is lost on restart/cold start.
- No authentication; the admin page and `GET /api/leads` are public. **Add auth before production.**
- No rate limiting/CAPTCHA, SMS sending, DNC checks, or automated tests in v1.
- BoldTrail mapping is best-effort and untested against a live account.

## Next steps for production hardening

1. Authentication/authorization for admin and list/update APIs
2. Postgres (implement `LeadRepository`) with migrations
3. Observability: structured logging, error tracking, metrics
4. Queue + retries/dead-letter for CRM sync
5. Compliance review (Fair Housing, TCPA, DNC, MLS/IDX, privacy) and rate limiting/bot protection
