import { normalize, productLabel, money } from './normalize.js';

// Faire — external API for brands (the trade/wholesale marketplace).
// Auth: a Faire access token (generate in your Faire brand settings / API).
//   FAIRE_ACCESS_TOKEN=xxx
// NOTE: verify field names against Faire's current external-api docs — the
// order schema (item price field, order total) has changed across versions.
const token = process.env.FAIRE_ACCESS_TOKEN;
const base = process.env.FAIRE_ENDPOINT || 'https://www.faire.com/external-api/v2';

export const channel = 'Faire';
export const enabled = () => Boolean(token);

function orderRevenue(o) {
  // Prefer an order-level total if present; else sum item prices (cents → £).
  if (o.total?.amount_cents != null) return money(o.total.amount_cents / 100);
  const items = o.items || o.order_items || [];
  const cents = items.reduce((sum, it) => sum + (it.price_cents || 0) * (it.quantity || 1), 0);
  return money(cents / 100);
}

export async function fetchOrders({ since }) {
  if (!enabled()) return [];
  const url = `${base}/orders?limit=50&created_at_min=${encodeURIComponent(since)}`;
  const res = await fetch(url, { headers: { 'X-FAIRE-ACCESS-TOKEN': token } });
  if (!res.ok) throw new Error(`Faire ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const orders = (await res.json())?.orders || [];
  return orders.map((o) =>
    normalize({
      channel,
      externalId: `faire-${o.id}`,
      product: productLabel((o.items || o.order_items || []).map((it) => it.product_name || it.name)),
      customer: o.retailer?.name || o.address?.name || '—',
      revenue: orderRevenue(o),
      currency: o.currency || 'GBP',
      placedAt: o.created_at,
    })
  );
}
