import { normalize, productLabel } from './normalize.js';

// WooCommerce REST API — the Febland trade portal (where most trade sales land).
// Auth: a read-only API key pair (WooCommerce → Settings → Advanced → REST API).
//   WOO_SITE=https://trade.febland.co.uk
//   WOO_KEY=ck_xxx
//   WOO_SECRET=cs_xxx
const site = process.env.WOO_SITE;
const key = process.env.WOO_KEY;
const secret = process.env.WOO_SECRET;

export const channel = 'Trade Febland (Woo)';
export const enabled = () => Boolean(site && key && secret);

export async function fetchOrders({ since }) {
  if (!enabled()) return [];
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = `${site}/wp-json/wc/v3/orders?per_page=100&after=${encodeURIComponent(since)}`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`WooCommerce ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const orders = await res.json();
  return orders.map((o) =>
    normalize({
      channel,
      externalId: `woo-${o.id}`,
      product: productLabel((o.line_items || []).map((li) => li.name)),
      customer: [o.billing?.first_name, o.billing?.last_name].filter(Boolean).join(' ') || o.billing?.company || '—',
      revenue: o.total,
      currency: o.currency,
      placedAt: o.date_created_gmt ? `${o.date_created_gmt}Z` : o.date_created,
    })
  );
}
