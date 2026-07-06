# The Feblands Dashboard

The cockpit — where Dexter walks in of a morning and sees **everything** in one look. It's not a
separate product; it's the **face of the Sales Factory** (`../sales-factory/`):

| Dashboard area | What it really is |
|----------------|-------------------|
| **Top — finances** | The commerce layer consolidated: Shopify, Amazon, eBay, Wayfair, WooCommerce (trade), Faire |
| **Left — agent boards** | The 7 factory stations, live: what each agent is working on + the human-gate flags |
| **Centre — the main agent** | The orchestrator brain. Dexter talks to it; it breaks instructions into jobs and hands them to the station agents |
| **Right — live sales** | The orders layer: Sale · Product · Platform · Customer · Revenue · time |

## The interactive prototype
`feblands-dashboard.html` is a working, clickable mockup (published as a Claude Artifact). It uses
**sample data**, but the interactions are real: talk to the main agent, use the quick actions,
approve/hold the two items waiting on Dexter, watch sales tick in. It's here to align everyone on
the vision and to show the board — not yet wired to live data.

- **Velvet-plum accent** — a deliberate nod to the range that's actually winning.
- **Amber = "needs you"** — those flags are the human approval gates from the architecture.
- Light + dark themes; responsive.

## What makes it real (the build behind the mockup)
The layout is the easy part; the value is the plumbing:

1. **Finance consolidation** — pull orders/revenue from each channel's API (Shopify Admin API,
   Amazon SP-API, eBay, Wayfair, WooCommerce REST, Faire) into one store, normalise currency/fees,
   and surface today / MTD / by-channel. This is the highest-effort, highest-value integration.
2. **Agent boards** — read live state from the factory's Airtable brain (each record's station +
   status), so the boards reflect what's genuinely happening.
3. **Sales feed** — a real-time stream of new orders across channels (webhooks where available).
4. **Main agent** — the orchestrator (Claude + n8n) exposed as a chat: it reads the brain, dispatches
   jobs to station agents, and routes anything past a hard limit back to Dexter as an approval.

## Where it sits on the roadmap
This is the **Phase 4–5 surface** — the dashboard gets richer as each station comes online. Sensible
first slice: the **finance-consolidation strip** (immediate daily value for Dexter, and useful even
before the agents are live), then bolt the agent boards + main-agent chat on as the factory fills in.

## Next steps
- Confirm the layout/priorities with Dexter using the prototype.
- Decide the first live slice (recommended: finance consolidation).
- List every channel + how we authenticate to each API.
