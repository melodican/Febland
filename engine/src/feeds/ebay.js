import { normalize, productLabel } from './normalize.js';

// eBay Sell — Fulfillment API (Orders).
// Auth: an OAuth *user* access token for the selling account (Authorization Code
// flow → refresh token). Simplest to start: paste a current user access token;
// wire the refresh exchange when you productionise.
//   EBAY_OAUTH_TOKEN=v^1.1#i^1#...   (user access token)
//   EBAY_ENDPOINT=https://api.ebay.com   (production; sandbox is api.sandbox.ebay.com)
const token = process.env.EBAY_OAUTH_TOKEN;
const endpoint = process.env.EBAY_ENDPOINT || 'https://api.ebay.com';

export const channel = 'eBay';
export const enabled = () => Boolean(token);

export async function fetchOrders({ since }) {
  if (!enabled()) return [];
  const filter = `creationdate:[${since}..]`;
  const url = `${endpoint}/sell/fulfillment/v1/order?limit=200&filter=${encodeURIComponent(filter)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`eBay ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const orders = (await res.json())?.orders || [];
  return orders.map((o) =>
    normalize({
      channel,
      externalId: `ebay-${o.orderId}`,
      product: productLabel((o.lineItems || []).map((li) => li.title)),
      customer: o.buyer?.username || '—',
      revenue: o.pricingSummary?.total?.value || 0,
      currency: o.pricingSummary?.total?.currency || 'GBP',
      placedAt: o.creationDate,
    })
  );
}
