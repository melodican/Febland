import { planInstruction } from './orchestrator.js';
import { processQueue } from './worker.js';

// Plan an instruction into jobs, then drain the queue — end-to-end, from the terminal.
//   npm run instruct -- "Find 20 boutique hotels"
const instruction = process.argv.slice(2).join(' ') || "Draft this week's velvet-led trade email";
console.log(`\n> ${instruction}\n`);

const plan = await planInstruction(instruction);
console.log('Central AI:', plan.reply);
console.log(`Queued ${plan.created.length} job(s):`, plan.created.map((c) => c.agent).join(', '), '\n');

const res = await processQueue({ max: 10 });
for (const r of res.results) {
  console.log(`— [${r.agent}] ${r.summary || r.error}`);
  if (r.needsApproval) console.log(`  ⚠ needs approval: ${r.reason}`);
  if (r.artifact) console.log(`\n${r.artifact}\n`);
}
