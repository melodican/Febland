import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';

// Loads the "Dexter Brain" — the rules the agents decide by — from the
// sales-factory/brain/ markdown docs, plus the hard guardrails from env.

const here = dirname(fileURLToPath(import.meta.url));
const brainDir = join(here, '..', '..', 'sales-factory', 'brain');

export function loadBrain() {
  let docs = '';
  try {
    for (const file of readdirSync(brainDir).filter((f) => f.endsWith('.md')).sort()) {
      docs += `\n\n===== ${file} =====\n` + readFileSync(join(brainDir, file), 'utf8');
    }
  } catch {
    docs = '(brain docs not found — fill in sales-factory/brain/)';
  }
  return { docs, guardrails: config.guardrails };
}

export function guardrailText() {
  const g = config.guardrails;
  return [
    `HARD LIMITS — never exceed without escalating to a human:`,
    `- Max discount you may offer unaided: ${g.maxAutoDiscountPct}%`,
    `- Max quote value you may issue unaided: £${g.maxAutoQuoteGbp}`,
    `- May you grant credit terms unaided: ${g.allowAutoCredit ? 'yes' : 'NO — always escalate'}`,
  ].join('\n');
}
