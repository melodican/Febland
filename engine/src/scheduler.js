import { routines } from './routines.js';
import { planInstruction } from './orchestrator.js';

// Fires the standing routines on their cron schedule. Uses node-cron if installed;
// if not, scheduling is simply off (the engine still serves the API, and n8n can
// drive the same routines via POST /instruct). So the dependency is optional.

export async function startScheduler() {
  let cron;
  try {
    cron = (await import('node-cron')).default;
  } catch {
    console.log('  ℹ node-cron not installed — internal schedules off. Trigger routines via n8n → POST /instruct, or `npm install`.');
    return;
  }
  const active = routines.filter((r) => r.enabled !== false);
  for (const r of active) {
    cron.schedule(
      r.cron,
      () => {
        console.log(`[routine] ${r.name}`);
        planInstruction(r.instruction, 'Schedule').catch((e) => console.error(`  routine "${r.name}" failed:`, e.message));
      },
      { timezone: 'Europe/London' }
    );
  }
  console.log(`  ✓ scheduler started — ${active.length} routine(s): ${active.map((r) => r.name).join(', ')}`);
}
