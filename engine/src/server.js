import express from 'express';
import { config } from './config.js';
import { planInstruction } from './orchestrator.js';
import { processQueue, createDirectJob } from './worker.js';
import { startScheduler } from './scheduler.js';
import { usingRealAirtable, listJobs } from './lib/airtable.js';
import { pullAll } from './feeds/runner.js';
import { revenueSummary } from './feeds/summary.js';
import { connectors } from './feeds/index.js';

// Febland Central's engine. The board (Airtable Jobs) + central AI + worker + feeds.
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

// ---- The board / task queue ----

// Human or schedule sends an instruction; the central AI plans it into QUEUED jobs.
app.post('/instruct', async (req, res) => {
  const instruction = req.body?.instruction;
  if (!instruction) return res.status(400).json({ error: 'Provide { "instruction": "..." }' });
  try {
    res.json(await planInstruction(instruction, req.body?.requestedBy || 'Dexter'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events/webhooks (n8n) create a job for a specific agent directly.
app.post('/jobs', async (req, res) => {
  const { agent, goal, requestedBy } = req.body || {};
  if (!agent || !goal) return res.status(400).json({ error: 'Provide { "agent": "outreach", "goal": "..." }' });
  try {
    res.json(await createDirectJob({ agent, goal, requestedBy }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// The board itself — list jobs (optionally by status) for the dashboard.
app.get('/jobs', async (req, res) => {
  try {
    const jobs = await listJobs({ status: req.query.status });
    res.json(jobs.map((j) => ({ id: j.id, ...j.fields })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drain the queue on demand (n8n can poll this instead of the internal tick).
app.post('/work', async (req, res) => {
  try {
    res.json(await processQueue({ max: req.body?.max || 5 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Feeds / revenue ----
app.get('/feeds/status', (_req, res) => res.json(connectors.map((c) => ({ channel: c.channel, connected: c.enabled() }))));
app.post('/feeds/pull', async (req, res) => {
  try { res.json(await pullAll({ since: req.body?.since })); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/revenue', async (_req, res) => {
  try { res.json(await revenueSummary()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(config.port, async () => {
  console.log(`Febland Central engine on :${config.port}`);
  if (!config.anthropicKey) console.log('  ℹ No ANTHROPIC_API_KEY — will use your `ant auth login` OAuth profile.');

  // Start the scheduler (standing routines) unless disabled.
  if (process.env.SCHEDULER !== 'off') await startScheduler();

  // Internal worker tick — drains the queue so jobs get fulfilled without n8n.
  // Set WORKER=off to let n8n own draining via POST /work instead.
  if (process.env.WORKER !== 'off') {
    const every = Number(process.env.WORKER_INTERVAL_MS || 15000);
    setInterval(() => processQueue({ max: 5 }).catch((e) => console.error('worker:', e.message)), every);
    console.log(`  ✓ worker tick every ${every / 1000}s`);
  }
});
