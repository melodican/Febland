// One shape for every channel's orders, so the dashboard + Airtable treat them
// identically. Maps to the Orders table in sales-factory/orchestrator-and-brain.md.

export function money(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function productLabel(titles = []) {
  const t = titles.filter(Boolean);
  if (!t.length) return 'Order';
  return t.length > 1 ? `${t[0]} +${t.length - 1} more` : t[0];
}

export function normalize(o) {
  return {
    channel: o.channel,
    externalId: o.externalId, // dedupe key
    product: o.product || 'Order',
    customer: o.customer || '—',
    revenue: money(o.revenue),
    currency: o.currency || 'GBP',
    placedAt: o.placedAt || new Date().toISOString(),
  };
}

// Airtable field mapping (Orders table).
export function toAirtable(o) {
  return {
    Channel: o.channel,
    Product: o.product,
    Customer: o.customer,
    Revenue: o.revenue,
    Currency: o.currency,
    'Placed at': o.placedAt,
    'External ID': o.externalId,
  };
}

export function fromAirtable(f) {
  return {
    channel: f.Channel,
    product: f.Product,
    customer: f.Customer,
    revenue: money(f.Revenue),
    currency: f.Currency || 'GBP',
    placedAt: f['Placed at'],
    externalId: f['External ID'],
  };
}
