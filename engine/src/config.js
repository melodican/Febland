import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v) console.warn(`[config] ${name} is not set — related features will be disabled until you add it.`);
  return v;
}

export const config = {
  anthropicKey: required('ANTHROPIC_API_KEY'),
  airtable: {
    key: required('AIRTABLE_API_KEY'),
    baseId: required('AIRTABLE_BASE_ID'),
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
