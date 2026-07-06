# Febland Central — Engine

The runnable core behind Febland Central: the **central AI** (orchestrator) that Dexter talks to,
and the **sub-agents** it spawns to run the sales factory. Built on Node.js + the official Claude
SDK, writing to the Airtable brain. This is the layer the dashboard's centre panel drives.

```
POST /instruct ──▶ Orchestrator (central AI) ──▶ plans jobs ──▶ spawns an agent per job
                     reads brain/ rules + guardrails              │
   returns reply + results ◀── writes Jobs to Airtable ◀──────────┘  (escalates past hard limits)
```

## What runs today
- **`/instruct`** — send an instruction; the central AI plans 1–3 jobs and spawns the matching agents
  (Prospector, Qualifier, Outreach, Sales, Onboarder, Merchandiser).
- Each agent returns the **spawn-contract shape** (`summary`, `artifact`, `needsApproval`, `reason`)
  so the dashboard can render any of them the same way and raise the amber "needs you" flag.
- **Guardrails** from `.env` (max auto-discount, max auto-quote, auto-credit) are injected into every
  agent + the planner, so nothing exceeds them without a human.
- **Airtable optional** — with no key it uses an in-memory store so you can run it end-to-end today;
  add the key and it writes real `Jobs`/`Accounts`.

## Authenticating Claude — two ways (no key string required)
The engine's `new Anthropic()` client resolves credentials automatically. Pick one:

**A) OAuth login (no key to paste) — easiest for testing on your own machine**
```bash
ant auth login      # opens a browser; log in with your Claude developer account
ant auth status     # confirms which credential is active
```
The SDK reads the stored OAuth profile — leave `ANTHROPIC_API_KEY` unset. Note: this logs into a
Claude **developer** account (API access/billing), not a personal Claude Pro/Max or ChatGPT
subscription — those aren't licensed to power a backend and will rate-limit.

**B) API key — the durable choice for the always-on production engine**
Put `ANTHROPIC_API_KEY=...` in `.env`. Right for a server/n8n deployment where interactive OAuth
login isn't practical.

## Run it
```bash
cd engine
npm install
cp .env.example .env      # optional: add ANTHROPIC_API_KEY, or use OAuth (above) and leave it blank
npm start                 # server on :8080
# or, one-shot from the terminal:
npm run instruct -- "Draft Tuesday's velvet-led trade email"
```
Check it's alive: `curl localhost:8080/health` (shows whether it's using a key or an OAuth profile).

Send an instruction:
```bash
curl -s localhost:8080/instruct -H 'content-type: application/json' \
  -d '{"instruction":"Find 20 boutique hotels that would want statement velvet"}' | jq
```

## The only thing it needs from you
A Claude developer login — either **OAuth** (`ant auth login`, no key string) or an
**`ANTHROPIC_API_KEY`**. Both point at a Claude API account; OAuth just skips the key. Everything
else runs on sensible defaults; add Airtable + the channel keys when you're ready to go live.

## Channel feeds (the revenue tiles)
Connectors in `src/feeds/` pull orders from each channel, normalise them to one shape, **de-dupe on
order ID** (re-running never double-counts), and write to the Airtable `Orders` table. `/revenue`
then serves today / month-to-date / by-channel — exactly what the dashboard's top strip shows.

| Channel | Connector | Auth needed (see `.env.example`) |
|---------|-----------|----------------------------------|
| WooCommerce (trade) | `feeds/woocommerce.js` | Site URL + read-only REST key/secret |
| Shopify (retail) | `feeds/shopify.js` | Shop domain + Admin API token |
| Faire (wholesale) | `feeds/faire.js` | Brand access token |
| Amazon | `feeds/amazon.js` | LWA client id/secret + refresh token + marketplace |
| eBay | `feeds/ebay.js` | OAuth user access token |

Each channel is **independent** — it's skipped until its credentials are present, so you can turn
them on one at a time (Shopify or WooCommerce first is easiest).

```bash
npm run feeds            # pull today's orders from every configured channel + print a summary
npm run feeds -- 7d      # last 7 days
```
Endpoints (for the dashboard / n8n): `GET /feeds/status`, `POST /feeds/pull`, `GET /revenue`.

> Amazon/eBay/Faire order schemas evolve — those connectors are built to the current API shape with
> the field mappings commented; verify a field or two against the live docs on first real pull.

## Map to the rest of the repo
| This engine | Elsewhere |
|-------------|-----------|
| `src/orchestrator.js` | the "central AI" in `dashboard/` |
| `src/agents/` | the Tasks-board stations in `dashboard/` |
| `src/brain.js` | reads `sales-factory/brain/` |
| Airtable tables | `sales-factory/orchestrator-and-brain.md` |

## Not done yet (next builds)
- Wire the channel APIs (Shopify/WooCommerce/Amazon/eBay/Faire) into `Orders` for the revenue tiles.
- Contact enrichment step for the Prospector (Companies House / Places / verifier).
- Multichannel send (email domain + LinkedIn) once copy is approved.
