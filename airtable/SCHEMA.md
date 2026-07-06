# Febland Brain — Airtable schema

Four tables. `*` marks the primary field. The setup script (`engine/src/setup-airtable.js`) creates
these exactly; this doc is the reference for the manual/CSV path.

## Accounts — every prospect & customer
| Field | Type | Options / notes |
|-------|------|-----------------|
| Name * | Single line text | Business name |
| Segment | Single select | Retailer / Designer / Boutique / Hospitality / Home-stager (+ auto-added) |
| Subtype | Single line text | |
| Region, Town | Single line text | |
| Website | URL | |
| Fit score | Single select | High · Medium · Low |
| Size band | Single select | SME · Mid · Large |
| Velvet angle | Long text | The per-prospect hook |
| Why fit | Long text | |
| Email | Email | *(blank — filled by enrichment)* |
| Phone | Phone | *(blank)* |
| Contact name | Single line text | *(blank)* |
| LinkedIn | URL | *(blank)* |
| Contact status | Single select | Needs enrichment · Verified · Bounced · Opted out |
| Owner | Single select | Central AI · Mark · Dexter |
| Source | Single line text | |
| Stage | Single select | DISCOVERED → ENRICHED → QUALIFIED → ENGAGED → REPLIED → IN_CONVERSATION → ONBOARDING → ACTIVE → REORDER (· DISQUALIFIED · SUPPRESSED) |
| Next action | Single line text | |
| Next action due | Date/time | |
| Consent | Checkbox | PECR/UK-GDPR opt-out flag |

## Orders — feeds the revenue tiles
| Field | Type | Options / notes |
|-------|------|-----------------|
| External ID * | Single line text | Dedupe key, e.g. `woo-1234` |
| Channel | Single select | Trade Febland (Woo) · Febland (Shopify) · Faire · Amazon · eBay |
| Product | Single line text | |
| Customer | Single line text | |
| Revenue | Currency (£) | |
| Currency | Single line text | |
| Placed at | Date/time | |

## Rules — the guardrails the AI checks
| Field | Type |
|-------|------|
| Key * | Single line text |
| Value | Single line text |
| Notes | Long text |
Seeded with the hard limits (max auto-discount, max auto-quote, auto-credit) + trade terms.

## Jobs — every unit of work the central AI spawns (powers Tasks & Completed)
| Field | Type | Options / notes |
|-------|------|-----------------|
| Title * | Single line text | |
| Agent | Single select | Prospector · Qualifier · Outreach · Sales Agent · Onboarder · Merchandiser |
| Status | Single select | QUEUED · WORKING · NEEDS_APPROVAL · DONE · FAILED |
| Input | Long text | The job spec (JSON) |
| Result | Long text | What the agent returned (renders in the workspace) |
| Requested by | Single select | Central AI · Dexter · Schedule |
| Approval needed | Checkbox | Raises the amber "needs you" flag |
| Approved by | Single line text | |
| Related account | Link → Accounts | |
| Completed | Date/time | |
