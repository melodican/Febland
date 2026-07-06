import { handleInstruction } from './orchestrator.js';

// Quick local test without the server:  npm run instruct -- "Find 20 boutique hotels"
const instruction = process.argv.slice(2).join(' ') || "Draft Tuesday's velvet-led trade email";
console.log(`\n> ${instruction}\n`);
const out = await handleInstruction(instruction);
console.log('Central AI:', out.reply, '\n');
for (const r of out.results) {
  console.log(`— [${r.agent}] ${r.summary || r.error}`);
  if (r.needsApproval) console.log(`  ⚠ needs your approval: ${r.reason}`);
  if (r.artifact) console.log(`\n${r.artifact}\n`);
}
