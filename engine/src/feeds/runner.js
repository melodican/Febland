import { connectors } from './index.js';
import { upsertOrders } from '../lib/airtable.js';

// Pull recent orders from every configured channel and write them (de-duped) to
// the Orders table. Run on a schedule (cron / n8n) to keep the tiles live.

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function pullAll({ since = startOfToday() } = {}) {
  const all = [];
  const report = [];
  for (const c of connectors) {
    if (!c.enabled()) {
      report.push({ channel: c.channel, status: 'skipped — no credentials yet' });
      continue;
    }
    try {
      const orders = await c.fetchOrders({ since });
      all.push(...orders);
      report.push({ channel: c.channel, status: 'ok', fetched: orders.length });
    } catch (err) {
      report.push({ channel: c.channel, status: 'error', error: err.message });
    }
  }
  const written = await upsertOrders(all);
  return { since, pulled: all.length, written, report };
}
