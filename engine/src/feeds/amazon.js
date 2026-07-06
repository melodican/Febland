import { normalize } from './normalize.js';

// Amazon Selling Partner API (SP-API) — Orders.
// Auth: Login-with-Amazon (LWA) refresh token → short-lived access token.
// Amazon dropped the AWS SigV4/role requirement in 2023 for most Orders calls,
// so the LWA access token alone is enough.
//   AMAZON_CLIENT_ID=amzn1.application-oa2-client.xxx
//   AMAZON_CLIENT_SECRET=xxx
//   AMAZON_REFRESH_TOKEN=Atzr|xxx
//   AMAZON_MARKETPLACE_ID=A1F83G8C2ARO7P   (UK)
//   AMAZON_ENDPOINT=https://sellingpartnerapi-eu.amazon.com   (default EU)
const clientId = process.env.AMAZON_CLIENT_ID;
const clientSecret = process.env.AMAZON_CLIENT_SECRET;
const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
const marketplaceId = process.env.AMAZON_MARKETPLACE_ID || 'A1F83G8C2ARO7P';
const endpoint = process.env.AMAZON_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

export const channel = 'Amazon';
export const enabled = () => Boolean(clientId && clientSecret && refreshToken);

async function accessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Amazon LWA ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).access_token;
}

export async function fetchOrders({ since }) {
  if (!enabled()) return [];
  const token = await accessToken();
  const url = `${endpoint}/orders/v0/orders?MarketplaceIds=${marketplaceId}&CreatedAfter=${encodeURIComponent(since)}`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  if (!res.ok) throw new Error(`Amazon SP-API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const orders = (await res.json())?.payload?.Orders || [];
  // Amazon restricts buyer PII and item detail behind extra calls/roles; the
  // order total + date are enough for the revenue tiles. Enrich later if needed.
  return orders.map((o) =>
    normalize({
      channel,
      externalId: `amazon-${o.AmazonOrderId}`,
      product: o.NumberOfItemsShipped ? `${o.NumberOfItemsShipped} item(s)` : 'Amazon order',
      customer: 'Amazon buyer',
      revenue: o.OrderTotal?.Amount || 0,
      currency: o.OrderTotal?.CurrencyCode || 'GBP',
      placedAt: o.PurchaseDate,
    })
  );
}
