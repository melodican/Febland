# How Febland Central runs — the operating model

The board + agents system that runs the sales side. Four layers; each already built.

```
  TRIGGERS ─────────────▶ CENTRAL AI ─────▶ BOARD (Airtable Jobs) ─────▶ WORKER ─────▶ agents fulfil
  when things happen       plans jobs         QUEUED · WORKING ·            drains the      the job
  (cron · event · human)                      NEEDS_APPROVAL · DONE         queue              │
                                                      ▲                                        │
                                              Dexter approves ◀── NEEDS_APPROVAL flag ─────────┘
```

## 1. The board — Airtable `Jobs`
Every task is a row: Title, Agent, Status, Input, Result, Approval-needed. Switch the table to a
**Kanban view grouped by Status** and you get a live board (Queued → Working → Needs You → Done)
Dexter can watch and drag. No extra software — the board *is* Airtable.

## 2. Triggers — what creates tasks (three sources)
| Source | How | Example |
|--------|-----|---------|
| **Schedule (cron)** | `src/routines.js` (internal) or n8n | 07:00 daily: source 20 prospects |
| **Event** | `POST /jobs` from a webhook (n8n) | a reply lands → draft a response |
| **Human** | `POST /instruct` from Febland Central | Dexter: "push velvet this week" |

The central AI (`orchestrator.js`) turns any instruction into 1–3 **QUEUED** jobs on the board.

## 3. The worker — agents fulfil tasks
`worker.js` drains the queue: claims a QUEUED job (→ WORKING), runs the assigned agent, writes the
result, sets **DONE** or **NEEDS_APPROVAL**. Runs on an internal tick *and* on demand via `POST /work`
(so n8n can own draining instead). Six agents: Prospector, Qualifier, Outreach, Sales Agent,
Onboarder, Merchandiser.

## 4. Human gates
Anything that sends outbound under Febland's name, or crosses a hard limit (discount / quote / credit
from the Rules table), comes back as **NEEDS_APPROVAL** — surfaced on the board and the dashboard's
amber "needs you" flag. Dexter approves; the job proceeds.

## The standing routines (the cron cadence that runs the business)
Defined in `engine/src/routines.js` — edit freely (or move to n8n):
| When | Routine |
|------|---------|
| Daily 07:00 | Source 20 new prospects, scored |
| Mon 08:00 | Draft Tuesday's velvet email (→ approval) |
| Mon 09:00 | Reorder nudges for dormant accounts |
| Hourly *(off until inbox wired)* | Check replies → draft responses |

## Tech stack — what plays each role
| Role | Tool | Status |
|------|------|--------|
| Board / queue / memory | **Airtable** | schema + setup built |
| Brains + agents + worker + scheduler | **the engine** (Node + Claude) | built |
| Triggers (cron + events), visual editing | **n8n** (optional — engine self-schedules too) | wiring guide in `engine/n8n/` |
| The model | **Claude** | wired |

You do **not** need a separate agent framework (CrewAI/LangGraph/AutoGPT) — the engine is that layer,
and it's simpler and more controllable for this. Anthropic's **Managed Agents** (server-hosted agents
with native cron deployments) is the heavyweight native option if ever wanted; not needed now.

## Endpoints (the whole system, over HTTP)
| Call | Does |
|------|------|
| `POST /instruct` `{instruction}` | central AI plans → QUEUED jobs |
| `POST /jobs` `{agent, goal}` | create a task for a specific agent (events) |
| `GET /jobs?status=` | read the board |
| `POST /work` | drain the queue now |
| `GET /revenue` · `POST /feeds/pull` | the channel-feed revenue tiles |
