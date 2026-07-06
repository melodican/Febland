import { listJobs } from './lib/airtable.js';
import { revenueSummary } from './feeds/summary.js';

// The staff briefing — a plain-English digest of what the AI has been doing, read
// off the board (Jobs) + the revenue feeds. n8n schedules GET /briefing daily and
// emails/Slacks it to the team (see company-brain/staff-and-reporting.md).

export async function buildBriefing() {
  const [done, working, queued, needs] = await Promise.all([
    listJobs({ status: 'DONE' }),
    listJobs({ status: 'WORKING' }),
    listJobs({ status: 'QUEUED' }),
    listJobs({ status: 'NEEDS_APPROVAL' }),
  ]);
  let rev = null;
  try { rev = await revenueSummary(); } catch { /* feeds not live yet */ }

  const L = ['FEBLAND CENTRAL — daily briefing', ''];
  if (rev) {
    const chans = Object.entries(rev.byChannel).map(([c, v]) => `${c} £${v}`).join(', ') || 'no orders yet today';
    L.push(`Revenue today: £${rev.today} (${rev.ordersToday} orders) · MTD £${rev.monthToDate}`);
    L.push(`By channel: ${chans}`);
    L.push('');
  }
  L.push(`Work: ${done.length} done · ${working.length} in progress · ${queued.length} queued · ${needs.length} need you`);
  L.push('');

  if (done.length) {
    L.push('Completed:');
    done.slice(0, 12).forEach((j) => L.push(`  ✓ [${j.fields.Agent}] ${j.fields.Title}`));
    L.push('');
  }
  if (needs.length) {
    L.push('⚠ NEEDS YOU (waiting on a human):');
    needs.forEach((j) => L.push(`  • [${j.fields.Agent}] ${j.fields.Title}`));
    L.push('');
  }
  if (!done.length && !needs.length && !working.length) L.push('Quiet so far — no agent activity yet.');
  return L.join('\n');
}
