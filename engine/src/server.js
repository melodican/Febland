import express from 'express';
import { config } from './config.js';
import { handleInstruction } from './orchestrator.js';
import { usingRealAirtable } from './lib/airtable.js';

// Minimal HTTP surface. Febland Central's centre panel POSTs here; n8n can too.
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    model: config.model,
    airtable: usingRealAirtable() ? 'connected' : 'in-memory (no key yet)',
    anthropic: config.anthropicKey ? 'configured' : 'MISSING ANTHROPIC_API_KEY',
  });
});

// Dexter (or n8n) sends an instruction; the central AI plans + spawns agents.
app.post('/instruct', async (req, res) => {
  const instruction = req.body?.instruction;
  if (!instruction) return res.status(400).json({ error: 'Provide { "instruction": "..." }' });
  try {
    const out = await handleInstruction(instruction);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(config.port, () => {
  console.log(`Febland Central engine on :${config.port}`);
  console.log(`  POST /instruct  { "instruction": "Draft Tuesday's velvet email" }`);
  if (!config.anthropicKey) console.log('  ⚠  Set ANTHROPIC_API_KEY in .env to enable the AI.');
});
