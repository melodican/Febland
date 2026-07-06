# The Central AI (Orchestrator) + the Airtable Brain

This is the technical spine of Febland Central — how the central AI in the middle of the dashboard
actually **spawns agents**, and the Airtable "brain" every agent reads and writes. Build against this.

```
        Dexter  ─────►  CENTRAL AI (orchestrator)  ─────►  spawns a sub-agent per job
                          reads rules + memory                 │
                          decides next best action             ▼
   Febland Central  ◄────  writes back to memory   ◄────  agent does the work, returns result
   (Tasks / Workspace / Completed columns)                (or escalates to a human gate)
```

- **Orchestration & glue:** n8n (you already run it)
- **Reasoning (central AI + every sub-agent):** Claude API
- **Memory / single source of truth:** Airtable
- **Rules:** the `brain/` docs, loaded into the orchestrator's system prompt + retrieval

---

## 1. The Airtable base — "Febland Brain"

One base, these tables. Field types in brackets.

### `Accounts` (every prospect & customer — the core record)
| Field | Type | Notes |
|-------|------|------|
| Name | text | Business name |
| Segment | single-select | Retailer · Designer · Boutique · Hospitality · Home-stager |
| Stage | single-select | DISCOVERED · ENRICHED · QUALIFIED · ENGAGED · REPLIED · IN_CONVERSATION · ONBOARDING · ACTIVE · REORDER · DISQUALIFIED · SUPPRESSED |
| Fit score | single-select | High · Medium · Low |
| Velvet angle | long text | The per-prospect hook |
| Website / Region / Town | text | |
| Contact name / Email / Phone / LinkedIn | text | Filled by enrichment, verified |
| Owner | single-select | `Central AI` or `Mark` (who's driving it now) |
| Last action / Next action | text | |
| Next action due | date | |
| Consent / opt-out | checkbox + date | PECR/UK-GDPR suppression |
| Source | text | prospecting-engine / Faire / referral |
| Linked jobs | link → Jobs | |
| Linked orders | link → Orders | |

### `Jobs` (every unit of work the central AI spawns — powers Tasks & Completed)
| Field | Type | Notes |
|-------|------|------|
| Title | text | e.g. "Draft Tuesday's email" |
| Agent | single-select | Prospector · Qualifier · Outreach · Sales · Onboarder · Merchandiser |
| Status | single-select | QUEUED · WORKING · NEEDS_APPROVAL · DONE · FAILED |
| Input | long text (JSON) | The job spec the orchestrator handed the agent |
| Result | long text (JSON) | What the agent returned (renders in the Workspace) |
| Related account | link → Accounts | |
| Requested by | single-select | Central AI · Dexter · Schedule |
| Approval needed / Approved by | checkbox / text | The human gate |
| Created / Completed | datetime | Drives the Completed timestamps |

### `Orders` (feeds the channel-revenue tiles + reorder logic)
| Field | Type | Notes |
|-------|------|------|
| Channel | single-select | Trade (Woo) · Shopify · Faire · Amazon · eBay |
| Product / SKU | text | |
| Customer | text / link → Accounts | |
| Revenue | currency | |
| Placed at | datetime | |
| External ID | text | de-dupe key from the source platform |

### `Rules` (the guardrails the orchestrator checks before acting)
Key/value from `brain/03-pricing-and-terms.md`: max auto-discount, max auto-quote, credit-never-auto,
MOQ, etc. Editable by Dexter without touching code.

---

## 2. The agent-spawn contract

Every sub-agent the central AI spawns speaks the same shape, so agents are swappable and the
dashboard renders any of them uniformly.

**Job spec in** (orchestrator → agent):
```json
{
  "job_id": "rec123",
  "agent": "Merchandiser",
  "goal": "Draft Tuesday's trade email, velvet-led, segmented",
  "account_id": null,
  "context": { "hero_product": "Coastal velvet artwork", "segments": ["retailer","designer","boutique"] },
  "authority": { "max_discount_pct": 0, "may_send": false }
}
```

**Result out** (agent → orchestrator → Airtable `Jobs.Result`):
```json
{
  "job_id": "rec123",
  "status": "NEEDS_APPROVAL",
  "summary": "Drafted Tuesday email for 3 segments",
  "artifact": { "type": "email_draft", "subject": "…", "body": "…" },
  "needs_approval": true,
  "reason": "Outbound copy — human gate before first send"
}
```

`artifact.type` (`email_draft`, `prospect_list`, `diagnosis`, `line_sheet`, …) tells Febland
Central how to render it in the **Workspace**. `status` drives the **Tasks → Completed** movement.
`needs_approval` raises the amber "Needs you" flag.

---

## 3. What the orchestrator does on every turn
1. Take the trigger (Dexter's instruction, a schedule, or an inbound reply/webhook).
2. Load relevant `Accounts`/`Jobs` from Airtable + the `brain/` rules.
3. Decide the next best action; write a `Jobs` row (`QUEUED`).
4. Spawn the right agent with the job spec.
5. On result: write it back; if `needs_approval`, set `NEEDS_APPROVAL` and surface it to Dexter;
   else mark `DONE`.
6. Never exceed a `Rules` hard limit without a human — always escalate instead.

---

## 4. Build order (each step ships something usable)
1. **Airtable base** stood up with the tables above + seeded from `prospecting-engine/prospects-sample.csv`.
2. **Channel-revenue tiles → live**: n8n pulls `Orders` from each platform API into Airtable; the
   dashboard's top strip reads it. *(Immediate daily value, no agents yet.)*
3. **Orchestrator v1** in n8n: Dexter's chat → creates a `Job` → spawns **one** agent (start with
   Outreach or Merchandiser) → result to Workspace.
4. **Add agents one at a time** (Prospector → Qualifier → Sales → Onboarder → Merchandiser), each
   honouring the spawn contract + gates.
5. **Wire Tasks/Completed** to the `Jobs` table so the columns reflect real live state.

---

## What I need from you to build this for real
- **Airtable** account (free tier fine to start) + invite, or say the word and I'll give you the
  exact base to create.
- **API access** to each channel (Shopify, WooCommerce, Amazon, eBay, Faire) — or tell me who
  administers each and I'll list the exact keys/scopes needed.
- **Access to your n8n** (or an export) so I build the orchestrator where your automation already lives.
- The filled-in `brain/` docs (esp. the hard limits in `03-pricing-and-terms.md`) so the gates are real.
