import { normalize, productLabel } from './normalize.js';

// Shopify Admin API — the Febland retail store.
// Auth: a custom-app Admin API access token (Settings → Apps → Develop apps).
//   SHOPIFY_SHOP=yourstore.myshopify.com
//   SHOPIFY_TOKEN=shpat_xxx
const shop = process.env.SHOPIFY_SHOP;
const token = process.env.SHOPIFY_TOKEN;
const VERSION = '2024-10';

export const channel = 'Febland (Shopify)';
export const enabled = () => Boolean(shop && token);

export async function fetchOrders({ since }) {
  if (!enabled()) return [];
  const url = `https://${shop}/admin/api/${VERSION}/orders.json?status=any&limit=250&created_at_min=${encodeURIComponent(since)}`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } });
  if (!res.ok) throw new Error(`Shopify ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { orders = [] } = await res.json();
  return orders.map((o) =>
    normalize({
      channel,
      externalId: `shopify-${o.id}`,
      product: productLabel((o.line_items || []).map((li) => li.title)),
      customer: [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || o.email || '—',
      revenue: o.total_price,
      currency: o.currency,
      placedAt: o.created_at,
    })
  );
}
