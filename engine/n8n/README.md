# Wiring n8n to the engine

The engine self-schedules and self-drains, so **n8n is optional**. Use it when you want to trigger
routines visually, edit cadences without touching code, or catch external events (replies, form
submits, new orders). n8n just makes HTTP calls to the engine — three patterns:

Assume the engine is reachable at `http://ENGINE_HOST:8080` from your n8n.

## 1 · Scheduled routine → create tasks
**Nodes:** `Schedule Trigger` → `HTTP Request`
- Schedule Trigger: cron, e.g. `0 7 * * *` (daily 07:00).
- HTTP Request:
  - Method `POST`, URL `http://ENGINE_HOST:8080/instruct`
  - Body (JSON): `{ "instruction": "Source 20 net-new UK trade prospects, scored", "requestedBy": "Schedule" }`

The central AI plans it into QUEUED jobs on the board. (If you run routines here, set `SCHEDULER=off`
on the engine so they don't double-fire.)

## 2 · Drain the queue on a poll
**Nodes:** `Schedule Trigger` (every 5 min) → `HTTP Request`
- `POST http://ENGINE_HOST:8080/work` with body `{ "max": 5 }`

Only needed if you set `WORKER=off` on the engine to let n8n own execution timing. Otherwise the
engine's internal tick handles it.

## 3 · External event → create a task for one agent
**Nodes:** your trigger (`Webhook` / `Email` / `Gmail` / `Typeform` …) → `HTTP Request`
- `POST http://ENGINE_HOST:8080/jobs`
- Body: `{ "agent": "salesAgent", "goal": "A trade buyer replied: <paste>. Draft a response.", "requestedBy": "Event" }`
- Agents: `prospector`, `qualifier`, `outreach`, `salesAgent`, `onboarder`, `merchandiser`.

## 4 · (Optional) pull channel revenue on a schedule
**Nodes:** `Schedule Trigger` (e.g. every 15 min) → `HTTP Request`
- `POST http://ENGINE_HOST:8080/feeds/pull`  → writes new orders to Airtable for the revenue tiles.

---

### Notes
- Keep the engine private (VPN / internal network / auth in front) — these endpoints act on the
  business. Don't expose them to the open internet without an auth layer.
- Everything n8n does here, the engine can also do itself (routines + worker tick). Pick per node
  whether you want the control in n8n or in `engine/src/routines.js`.
