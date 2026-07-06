# Velvet-Led Outreach Sequences

Replaces the single Tuesday blast with **segmented, multichannel sequences** — every touch leads with
the custom velvet range (the differentiator), personalised per prospect. Drop these into n8n via the
prospecting engine's fields (`velvet_angle`, `why_fit`, `segment`).

> **Draft v0.1** — finalised once the Shopify/WooCommerce exports give real hero products, prices and
> lead times, and Mark's real objection responses land in the brain. `{{merge_fields}}` come from the
> prospect record. **Nothing sends until Dexter approves the copy** (the human gate).

**Cadence (per prospect, spread over ~2–3 weeks):** Email 1 → LinkedIn connect → Email 2 → LinkedIn
message → Email 3 (break-up). A reply at any point stops the sequence and routes to Mark to close.

---

## 1 · Interior designers & studios
**Hook:** bespoke, spec-able statement pieces made to order.

**Email 1 — the wedge**
> Subject: Statement pieces your competitors can't spec
>
> Hi {{first_name}},
> I came across {{company}}'s work on {{project_or_site}} — {{one_specific_compliment}}.
> We're Febland, family-run in Blackpool since 1952. The reason I'm writing: we design and print our
> own **custom velvet furniture and artwork** in-house, so you can spec pieces that are genuinely
> exclusive to your scheme — not the same catalogue stock every other studio sources.
> Worth me sending a few examples for your library?
> — {{sender}}

**LinkedIn connect note**
> Hi {{first_name}} — love {{company}}'s work. We make bespoke velvet pieces UK designers use for
> statement moments; thought it'd be a useful supplier to know. {{sender}}, Febland.

**Email 2 — proof**
> Subject: A couple of the velvet pieces I mentioned
> {{2_hero_examples}} — made to order, [X]-week lead time, from [MOQ]. Happy to post a swatch. Any
> projects on at the moment where a statement piece would land?

**Email 3 — break-up**
> Subject: Should I close your file?
> No worries if the timing's off, {{first_name}} — I'll leave it here. If a scheme ever needs a
> piece no one else can source, we're a quick email away. The line sheet's attached for whenever.

---

## 2 · Hospitality / contract FF&E
**Hook:** custom velvet seating, headboards and statement bar/lobby pieces at contract volume.

**Email 1**
> Subject: Bespoke velvet for {{hotel_or_project}} — made in the UK
> Hi {{first_name}}, Febland here (Blackpool, since 1952). We make custom-printed velvet contract
> furniture — the kind of statement lobby/bar pieces that photograph well and set a property apart —
> plus a broad contract range behind it. If you've a refurb or new opening in the pipeline, I'd love
> to show you what's possible. — {{sender}}

**LinkedIn message (after connect)**
> {{first_name}}, we supply bespoke velvet + contract furniture to UK hospitality. Any projects where
> a differentiated statement piece would help? Happy to send our contract line sheet.

**Email 2 / 3** — as above, swapping in a hospitality example and lead-time/MOQ for contract orders.

---

## 3 · Independent furniture retailers
**Hook:** exclusive velvet stock rivals literally can't price-match + 5,000-line catalogue behind it.

**Email 1**
> Subject: Stock the shop down the road can't get
> Hi {{first_name}}, {{compliment_on_their_shop}}. We're Febland — 70+ years supplying independent
> retailers. Our angle for you: a **custom velvet range made in our own workshop**, so it's exclusive
> stock no one can undercut you on — and we drop-ship, so you can test it without holding stock.
> Want the line sheet? — {{sender}}

**Email 2** — lead with the best-selling velvet piece + the drop-ship / low-MOQ reassurance.
**Email 3** — break-up, offer a sample.

---

## 4 · Lifestyle / homeware / gift boutiques
**Hook:** velvet artwork, mosaic lamps, mirrors and giftable accessories — differentiated, photogenic.

**Email 1**
> Subject: Something different for {{shop}}'s shelves
> Hi {{first_name}}, love {{shop}}'s curation. We're Febland (Blackpool, est. 1952) — we make custom
> velvet artwork and stock statement lighting, mirrors and giftware that stands out in a curated
> space. Small opening order is fine, and we drop-ship. Shall I send the gift + velvet line sheet?

**Email 2 / 3** — hero the velvet artwork + a couple of giftable lines; break-up with a sample offer.

---

## 5 · Home stagers / holiday-let furnishers
**Hook:** photogenic velvet hero pieces that lift listing photos; repeat bulk buying.

**Email 1**
> Subject: Hero pieces that lift the listing photos
> Hi {{first_name}}, Febland here. For staging and short-let furnishing, our **custom velvet pieces**
> are the kind of statement item that makes a room photograph — and we can supply in volume with
> drop-ship. Worth a look for your next project? Happy to send the line sheet + trade pricing.

**Email 2 / 3** — volume/repeat terms + a staged-room example; break-up with the line sheet attached.

---

## Notes for the send engine (n8n)
- **Personalise the opener** from `why_fit` / `velvet_angle` — no two emails read identically.
- **Deliverability**: dedicated warmed sending domain; verify every address first; easy opt-out;
  suppress the existing 500 + anyone who's replied.
- **Reply handling**: any reply → stop sequence → route to Mark with the thread + prospect context.
- **Compliance**: UK B2B under PECR/UK-GDPR legitimate interest — keep it relevant, log suppressions.
