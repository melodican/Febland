# Group-wide policies — escalation gates & compliance

The rules that keep an autonomous system safe. These apply across **all four businesses**.

## Human-approval gates (what an agent must NEVER do alone) ✅ _(defaults — Dexter to confirm £/%)_
Agents act on the routine and **draft** the rest; these always go to a human first:
- **Outbound under our name** — the first send of any new campaign is approved before it goes out.
- **Money** — any discount, quote, or credit terms beyond the hard limits in the **Rules** table
  (`max_auto_discount_pct`, `max_auto_quote_gbp`, `allow_auto_credit`). Default: **£0 / 0% / no auto
  credit** until Dexter sets them.
- **New commitments** — accepting a storage/rental tenancy, booking an upholstery job at a price,
  agreeing a delivery date — draft it, a human confirms.
- **Anything ambiguous or a complaint** — route to a person, don't guess.

As the system proves itself, these gates **widen** (higher auto-limits, more it can do unaided) —
deliberately, with evidence, not on day one.

## Data & compliance ✅ / ❓
- **UK-GDPR / PECR** — B2B outreach runs on legitimate interest: relevant, easy opt-out, suppression
  list honoured. Customer data handled lawfully; no secrets or card data stored in the brain.
- ❓ _Any sector-specific rules for storage/rental tenancies (contracts, deposits) to encode._

## The trust model
Every action is logged on the board (Airtable Jobs) with who requested it and the result, and
summarised in the staff briefing — so there's always an audit trail of what the AI did and why.
