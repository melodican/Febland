import express from 'express';
import { config } from './config.js';
import { handleInstruction } from './orchestrator.js';
import { usingRealAirtable } from './lib/airtable.js';
import { pullAll } from './feeds/runner.js';
import { revenueSummary } from './feeds/summary.js';
import { connectors } from './feeds/index.js';

// Minimal HTTP surface. Febland Central's centre panel POSTs here; n8n can too.
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    model: config.model,
    airtable: usingRealAirtable() ? 'connected' : 'in-memory (no key yet)',
    anthropic: config.anthropicKey ? 'api key' : 'no key set — using `ant auth login` OAuth profile if present',
  });
});

// Feeds status — which channels are wired up.
app.get('/feeds/status', (_req, res) => {
  res.json(connectors.map((c) => ({ channel: c.channel, connected: c.enabled() })));
});

// Pull all channel feeds now (schedule this via cron/n8n).
app.post('/feeds/pull', async (req, res) => {
  try {
    res.json(await pullAll({ since: req.body?.since }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The numbers behind the dashboard's top revenue strip.
app.get('/revenue', async (_req, res) => {
  try {
    res.json(await revenueSummary());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  if (!config.anthropicKey) console.log('  ℹ  No ANTHROPIC_API_KEY — will use your `ant auth login` OAuth profile. Run `ant auth status` to check.');
});
