# Febland Growth Project

Building Febland's sales engine — using AI, agents and automation to reach **new trade and retail
customers** and generate revenue. Trade-first, per MD (Dexter).

Family business since 1952 · Blackpool · ~5,000 products · 500+ trade stockists ·
retail (Shopify) + trade (WooCommerce) + Faire/Amazon/eBay/Wayfair.

## The core idea in one line
Stop fighting the commodity price war on imported furniture; make the **custom velvet range** the
wedge, and switch from *generating* demand (cold calls) to *capturing* it (marketplaces, inbound,
search, and a continuously-growing prospect list feeding automated outreach).

Full reasoning: [`strategy/growth-strategy.md`](strategy/growth-strategy.md).

## The bigger build: an automated sales factory
The end goal is a **production line that runs the sales side end-to-end** — find → qualify →
engage → converse → onboard → sell → reorder — coordinated by a central "brain" that mirrors how
Dexter runs sales, taking new-customer work out of Mark's hands. Fully automated line, with human
approval gates at the risky seams that widen as it earns trust. Full design:
[`sales-factory/README.md`](sales-factory/README.md).

The prospecting engine below is **Station 1** of that factory, already prototyped.

## What's here
| Folder | What it is | Status |
|--------|-----------|--------|
| [`dashboard/`](dashboard/) | Febland Central — the cockpit concept + an interactive clickable prototype | **Prototype built** |
| [`sales-factory/`](sales-factory/) | Full factory architecture + the "Dexter Brain" intake templates to fill in | **Architecture + templates** |
| [`engine/`](engine/) | Runnable core — the central AI orchestrator + sub-agents + channel feeds (Node.js + Claude SDK) | **Runnable (needs API key)** |
| [`airtable/`](airtable/) | The Febland Brain base — schema, one-command setup script, and seed data (38 prospects + guardrails) | **Ready to build** |
| [`prospecting-engine/`](prospecting-engine/) | Station 1 — net-new UK trade prospect finder + a real 38-business sample, and n8n wiring | **Prototype built** |
| [`outreach/`](outreach/) | Velvet-led, segmented multichannel sequences that replace the Tuesday blast | **Draft copy** |
| [`strategy/`](strategy/) | The diagnosis and the trade-first growth plan | Living doc |

## Immediate next steps
1. Fill in the [`sales-factory/brain/`](sales-factory/brain/) templates (or hand me the raw info and I'll draft them for sign-off) — this is what makes the AI decide like Febland.
2. Add **Shopify + WooCommerce product exports** → velvet-led templates off real hero products.
3. Pick the CRM (HubSpot vs Airtable) and a contact-enrichment source.
4. First live batch: 50 High-fit prospects → segmented, velvet-led, multichannel sequences on n8n.
