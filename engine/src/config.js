// Load .env if dotenv is installed; harmless if it isn't (shell env still works).
try { await import('dotenv/config'); } catch { /* dotenv optional */ }

function warnMissing(name, note) {
  const v = process.env[name];
  if (!v) console.warn(`[config] ${name} is not set — ${note}`);
  return v;
}

export const config = {
  // Optional. If unset, the Claude SDK falls back to an `ant auth login` OAuth
  // profile — so you can run the engine without ever pasting a key string.
  anthropicKey: process.env.ANTHROPIC_API_KEY || null,
  airtable: {
    key: warnMissing('AIRTABLE_API_KEY', 'using in-memory store until you add it.'),
    baseId: process.env.AIRTABLE_BASE_ID || null,
  },
  port: Number(process.env.PORT || 8080),
  // Hard guardrails — the orchestrator escalates to a human above these.
  guardrails: {
    maxAutoDiscountPct: Number(process.env.MAX_AUTO_DISCOUNT_PCT || 0),
    maxAutoQuoteGbp: Number(process.env.MAX_AUTO_QUOTE_GBP || 0),
    allowAutoCredit: String(process.env.ALLOW_AUTO_CREDIT || 'false') === 'true',
  },
  model: 'claude-opus-4-8',
};
