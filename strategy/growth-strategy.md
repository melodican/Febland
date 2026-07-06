# Febland Growth Strategy — Working Notes

_Owner: Glen · Focus per MD (Dexter): grow **trade** · Date started: July 2026_

## The problem, stated honestly

Sales are down. The industry is down with them. But the constraint isn't product, showroom or
staff — it's **demand**. And we've been trying to *generate* demand (cold outreach) when the
cheaper, faster win in a soft market is to *capture* demand that already exists.

- **Demand generation** = persuading someone who wasn't going to buy. Cold calling is this. It is
  the hardest, slowest channel and it gets *worse* in a downturn. Mark isn't failing — the channel
  is low-yield by nature. Ten more Marks wouldn't fix it.
- **Demand capture** = being present at the moment a buyer is already looking. Cheaper, faster, and
  it scales without headcount.

## The two things that reframe everything

### 1. Lean on what's already winning: custom velvet
We *import* furniture from Italy and China — a **commodity**. Every competitor buys similar goods
from similar suppliers, so it's a price war, and in a down market that war is brutal. It's why cold
outreach and generic social feel like pushing water uphill: no reason for a new buyer to switch.

The **custom-printed velvet artwork & furniture** is the opposite: proprietary, made in Blackpool,
visually striking, made-to-order (high margin, low stock risk), and **nobody else has it.** It's
already having "a lot of luck." That is the **wedge** for everything — the reason a trade account
switches to us, the reason retail stops scrolling, the reason social finally works.

**Decision:** make the velvet range the tip of the spear across all channels. The 5,000-line
imported catalogue becomes the "…and we carry everything else too" that follows once we have
attention — not the lead.

### 2. Name the trade bottleneck precisely
We send **one identical email every Tuesday to the same ~500 businesses we already know.** That's a
retention nudge to an existing base, not a new-customer engine. To reach *new* trade accounts, two
things must change:
- **Grow the list past 500.** The addressable UK market is far bigger (see below).
- **Make outreach velvet-led, segmented and multichannel** (email + LinkedIn), not one blast.

The WooCommerce trade portal already *converts* — most trade sales come through it. The problem is
**traffic and new accounts into it**, not the portal itself.

## The plan (trade-first, per Dexter)

1. **Prospecting engine** *(building now — see `../prospecting-engine/`)* — a continuously growing,
   segmented, scored database of net-new UK trade prospects. Fixes Mark's bottleneck: he closes
   warm replies instead of dialling cold.
2. **Velvet-led multichannel outreach** — replace the Tuesday blast with segmented sequences
   (email + LinkedIn), personalised, leading with custom velvet. Runs on the existing n8n.
3. **Faire + marketplace optimisation** — ensure the full velvet range is featured and discoverable
   on Faire (inbound trade discovery we're under-using), and audit Amazon/eBay/Wayfair coverage.
4. **Own the niche in search** — "custom printed velvet furniture wholesale", "bespoke upholstery
   trade supplier UK": high buying intent, almost no competition *because we're one of the few
   doing it*. Point the WooCommerce/trade SEO at it.
5. **Reposition social around velvet** — generic product shots drown in the interiors feed; bold
   custom velvet is scroll-stopping and made for Pinterest/Reels. This serves retail (showroom +
   site) *and* trade (buyers discover us). Fixes the "social is unfruitful" problem.

## Target segments (trade)
Independent furniture retailers · interior designers/studios · lifestyle/homeware/gift boutiques ·
hospitality & contract FF&E · home staging / holiday-let furnishers. Segments 2–5 are the sharpest
velvet fit — they buy on differentiation and look, not lowest price.

## How AI/agents fit (the honest version)
AI doesn't conjure demand. It removes the **labour wall** — building & enriching prospect lists,
generating listings/feeds for marketplaces at 5,000-SKU scale, producing room-set imagery and
short-form video without a photoshoot, personalising outreach. That labour wall is the only real
thing keeping us off the channels where buyers already are.

## Open inputs needed
- Shopify (retail) + WooCommerce (trade) product exports → build velvet-led templates off real
  hero products.
- Choice of contact-enrichment source (Companies House + Google Places free tier, or paid
  Apollo/Hunter/Cognism).
- Rough trade vs retail revenue split & average order value (sizes the paid-channel maths).
