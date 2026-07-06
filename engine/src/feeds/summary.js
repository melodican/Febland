import { listOrders } from '../lib/airtable.js';
import { money } from './normalize.js';

// Computes exactly what the dashboard's top strip shows: today's revenue,
// month-to-date, and a per-channel breakdown for today.

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function revenueSummary() {
  const orders = await listOrders();
  const today = startOfToday();
  const month = startOfMonth();

  let todayTotal = 0;
  let mtdTotal = 0;
  let ordersToday = 0;
  const byChannel = {};

  for (const o of orders) {
    const when = new Date(o.placedAt);
    if (when >= month) mtdTotal += o.revenue;
    if (when >= today) {
      todayTotal += o.revenue;
      ordersToday += 1;
      byChannel[o.channel] = money((byChannel[o.channel] || 0) + o.revenue);
    }
  }

  return {
    today: money(todayTotal),
    monthToDate: money(mtdTotal),
    ordersToday,
    byChannel,
    currency: 'GBP',
    asOf: new Date().toISOString(),
  };
}
