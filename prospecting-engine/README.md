# Febland Trade Prospecting Engine

**Goal:** stop the new-customer engine being gated on how many cold calls Mark can make in a day.
Instead, continuously build and enrich a database of **net-new UK trade prospects**, segmented and
scored, ready to drop straight into automated multichannel outreach. Mark stops *finding* leads and
only *closes* the warm replies.

This folder is the working prototype. `prospects-sample.csv` is a real, hand-verified sample of
**38 genuine UK businesses** across the five buyer segments below — proof of the output quality
before we scale it to thousands.

---

## Why this attacks the real bottleneck

Today: **one identical email every Tuesday to the same ~500 businesses you already know.**
That is a retention nudge to an existing base, not a machine for reaching *new* accounts.

Your actual addressable UK market is far larger than 500. This engine widens the top of the funnel
so the Tuesday email (and Mark, and LinkedIn) have a constant supply of fresh, relevant, segmented
targets — with the **custom velvet range as the wedge** that makes the approach land (see
`../strategy/growth-strategy.md`).

---

## The five target segments

| # | Segment | Why they buy from Febland | Best-fit product hook |
|---|---------|---------------------------|-----------------------|
| 1 | **Independent furniture retailers** | Resell your ranges; want stock rivals don't carry | Custom velvet = exclusive, un-price-matchable stock |
| 2 | **Interior designers / studios** | Specify & procure furniture per project (FF&E) | Bespoke velvet statement pieces, made to order |
| 3 | **Lifestyle / homeware / gift boutiques** | Curated differentiated stock + gift lines | Velvet artwork, cushions, mosaic lamps, gifts |
| 4 | **Hospitality / contract FF&E** | Volume contract buys for hotels/bars/restaurants | Custom velvet seating, headboards, statement bar pieces |
| 5 | **Home staging / holiday-let furnishers** | Repeat bulk buyers; need photogenic pieces | Velvet hero pieces that lift listing photos |

Segments 2, 3, 4 and 5 are the sharpest fit for the **velvet wedge** because they buy on
*differentiation and look*, not on lowest price — which is exactly where the imported commodity
catalogue struggles.

---

## Data schema (`prospects-sample.csv`)

| Field | Meaning |
|-------|---------|
| `company` | Business name |
| `segment` | One of the five segments above |
| `subtype` | Finer classification |
| `region`, `town` | Location (drives regional campaigns + delivery friction) |
| `website` | Public site (the enrichment key) |
| `fit_score` | High / Medium / Low — likelihood of buying, scored on the rubric below |
| `size_band` | SME / Mid / Large — shapes offer & expected order size |
| `velvet_angle` | The specific custom-velvet hook for *this* prospect |
| `why_fit` | One-line rationale (also the raw material for personalised outreach) |
| `email`, `phone`, `contact_name`, `linkedin` | **Contact fields — intentionally blank** (see below) |
| `contact_status` | `Needs enrichment` until verified contact data is attached |
| `source` | Where the record came from |

### Fit-scoring rubric
- **High** — differentiation-led buyer (designer, statement/lifestyle boutique, hospitality FF&E,
  stager) OR independent retailer with premium/"distinctive" positioning; local = bonus.
- **Medium** — plausible buyer but narrower aesthetic fit or larger/own-brand.
- **Low** — partial competitor (makes own upholstery), very large own-brand retailer, or a curation
  (e.g. strict Scandi) that only a tight product edit would suit. *Kept in, deprioritised* — Low ≠ ignore.

---

## Honest note on contact data

The contact columns are **deliberately empty**. Scraping or guessing business emails/phones and
firing outreach at them is how you (a) email the wrong people, (b) hit the wrong person at a company,
and (c) damage sender reputation and the Febland name. Enrichment is a **separate, verifiable step**:

1. **Enrich** each row from its `website` — pull the real trade/buying contact, generic inbox,
   phone, and a named decision-maker where public (Companies House directors, LinkedIn, site
   "contact"/"stockist enquiry" pages).
2. **Verify** deliverability before sending (email-verification pass).
3. **Consent/compliance** — B2B outreach in the UK runs under PECR/UK-GDPR legitimate-interest;
   keep it relevant, keep an easy opt-out, log suppressions.

Recommended enrichment sources (pick per budget): Companies House API (free, UK directors &
filings), Google Places/Maps (address, phone, category), and a B2B email provider
(Apollo / Hunter / Lusha / Cognism) for verified contacts. Faire's own retailer directory is a
warm source too.

---

## How it scales (the actual "engine")

The sample was built by hand to prove quality. Productionised, the loop is:

```
 SEED queries per segment x region  ->  DISCOVER businesses (search / directories / maps / Faire)
        -> DEDUPE against Shopify + Woo customer list (exclude existing 500)
        -> CLASSIFY segment + subtype + size
        -> SCORE fit + attach velvet_angle
        -> ENRICH verified contact (Companies House / Places / email provider)
        -> VERIFY deliverability
        -> PUSH to n8n outreach as a new, segmented lead
```

Everything except human judgement on edge cases is automatable. Target: a steady flow of
**net-new, de-duplicated, scored, contactable** prospects every week.

### Wiring into your existing n8n

You already built the lead-gen automation — this is what feeds it, restructured:

- **Webhook / CSV / Google Sheet in** — this engine writes new scored rows.
- **Router node on `segment`** — each segment gets its own message + cadence (a designer is not
  pitched like a holiday-let furnisher).
- **Personalisation** — merge `velvet_angle` + `why_fit` into the opener so no email reads as a blast.
- **Multichannel** — email step + LinkedIn step (Mark's account or a sales inbox), not email alone.
- **Reply handling** — any reply → route to Mark to close; auto-suppress from further sequence.
- **Suppression** — de-dupe against existing 500 + anyone who's replied/opted out.

The point: the Tuesday blast becomes *segmented, velvet-led, multichannel sequences to a
continuously growing net-new list* — and Mark spends his day closing, not dialling.

---

## Next steps
1. You send the **Shopify + WooCommerce exports** → I use them to build the segment-specific
   velvet-led message templates off your *real* hero products.
2. Pick a paid enrichment source (or start free with Companies House + Places) and I'll spec the
   enrichment step.
3. Decide batch size for the first live run (suggest 50 High-fit prospects) and I'll prep the
   n8n import + sequences.
