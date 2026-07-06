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

## Run it
```bash
cd engine
npm install
cp .env.example .env      # add ANTHROPIC_API_KEY (Airtable optional to start)
npm start                 # server on :8080
# or, one-shot from the terminal:
npm run instruct -- "Draft Tuesday's velvet-led trade email"
```
Check it's alive: `curl localhost:8080/health`

Send an instruction:
```bash
curl -s localhost:8080/instruct -H 'content-type: application/json' \
  -d '{"instruction":"Find 20 boutique hotels that would want statement velvet"}' | jq
```

## The only thing it needs from you
An **`ANTHROPIC_API_KEY`** (console.anthropic.com) to switch the AI on. Everything else runs on
sensible defaults; add Airtable + the channel keys when you're ready to make it live and persistent.

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
