import { pullAll, startOfToday } from './feeds/runner.js';
import { revenueSummary } from './feeds/summary.js';

// Pull every configured channel and print a revenue summary.
//   npm run feeds              (orders since start of today)
//   npm run feeds -- 7d        (orders from the last 7 days)
const arg = process.argv[2];
let since = startOfToday();
if (arg && /^\d+d$/.test(arg)) {
  const days = Number(arg.replace('d', ''));
  since = new Date(Date.now() - days * 86400000).toISOString();
}

console.log(`\nPulling channel feeds since ${since}\n`);
const result = await pullAll({ since });
for (const r of result.report) {
  const detail = r.fetched != null ? `${r.fetched} orders` : r.error || r.status;
  console.log(`  ${r.channel.padEnd(22)} ${r.status.padEnd(10)} ${detail}`);
}
console.log(`\nWrote ${result.written} new orders (deduped).\n`);

const s = await revenueSummary();
console.log(`Today: £${s.today}   |   Month to date: £${s.monthToDate}   |   Orders today: ${s.ordersToday}`);
console.log('By channel today:', s.byChannel);
