import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
try { await import('dotenv/config'); } catch { /* optional */ }

// Builds the Febland Brain base — creates the Accounts, Orders, Rules and Jobs
// tables (with proper field types + options), then optionally seeds Accounts and
// Rules. Run against an EMPTY base you create in the Airtable UI:
//   1. Create a base in Airtable, open it, copy the base ID from the URL (app...).
//   2. Create a personal access token with scopes: schema.bases:write, data.records:write
//   3. AIRTABLE_API_KEY=pat... AIRTABLE_BASE_ID=app... node src/setup-airtable.js --seed

const API = 'https://api.airtable.com/v0';
const KEY = process.env.AIRTABLE_API_KEY;
const BASE = process.env.AIRTABLE_BASE_ID;
const SEED = process.argv.includes('--seed');
const here = dirname(fileURLToPath(import.meta.url));
const airtableDir = join(here, '..', '..', 'airtable');

if (!KEY || !BASE) {
  console.error('Missing AIRTABLE_API_KEY and/or AIRTABLE_BASE_ID.');
  console.error('Create an empty base in Airtable, copy its ID (app...), and a PAT with schema.bases:write + data.records:write.');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
async function api(path, method = 'GET', body) {
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// Field helpers
const sel = (...names) => ({ type: 'singleSelect', options: { choices: names.map((n) => ({ name: n })) } });
const dt = { type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'Europe/London' } };
const check = { type: 'checkbox', options: { icon: 'check', color: 'greenBright' } };
const currency = { type: 'currency', options: { precision: 2, symbol: '£' } };

const STAGES = ['DISCOVERED', 'ENRICHED', 'QUALIFIED', 'ENGAGED', 'REPLIED', 'IN_CONVERSATION', 'ONBOARDING', 'ACTIVE', 'REORDER', 'DISQUALIFIED', 'SUPPRESSED'];
const AGENTS = ['Prospector', 'Qualifier', 'Outreach', 'Sales Agent', 'Onboarder', 'Merchandiser'];
const CHANNELS = ['Trade Febland (Woo)', 'Febland (Shopify)', 'Faire', 'Amazon', 'eBay'];

async function listTables() {
  const { tables = [] } = await api(`/meta/bases/${BASE}/tables`);
  return tables;
}

async function createTable(name, fields) {
  const existing = (await listTables()).find((t) => t.name === name);
  if (existing) {
    console.log(`  · ${name} already exists — skipping`);
    return existing;
  }
  const t = await api(`/meta/bases/${BASE}/tables`, 'POST', { name, fields });
  console.log(`  ✓ created ${name}`);
  return t;
}

async function seed(table, rows) {
  for (let i = 0; i < rows.length; i += 10) {
    await api(`/${BASE}/${encodeURIComponent(table)}`, 'POST', {
      records: rows.slice(i, i + 10).map((fields) => ({ fields })),
      typecast: true, // auto-creates any missing single-select options
    });
  }
  console.log(`  ✓ seeded ${rows.length} rows into ${table}`);
}

async function main() {
  console.log(`Building Febland Brain in base ${BASE}\n`);

  const accounts = await createTable('Accounts', [
    { name: 'Name', type: 'singleLineText' },
    { name: 'Segment', ...sel('Independent furniture retailer', 'Interior designer', 'Lifestyle / interiors boutique', 'Hospitality / contract FF&E', 'Home staging / furnisher') },
    { name: 'Subtype', type: 'singleLineText' },
    { name: 'Region', type: 'singleLineText' },
    { name: 'Town', type: 'singleLineText' },
    { name: 'Website', type: 'url' },
    { name: 'Fit score', ...sel('High', 'Medium', 'Low') },
    { name: 'Size band', ...sel('SME', 'Mid', 'Large') },
    { name: 'Velvet angle', type: 'multilineText' },
    { name: 'Why fit', type: 'multilineText' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'phoneNumber' },
    { name: 'Contact name', type: 'singleLineText' },
    { name: 'LinkedIn', type: 'url' },
    { name: 'Contact status', ...sel('Needs enrichment', 'Verified', 'Bounced', 'Opted out') },
    { name: 'Owner', ...sel('Central AI', 'Mark', 'Dexter') },
    { name: 'Source', type: 'singleLineText' },
    { name: 'Stage', ...sel(...STAGES) },
    { name: 'Next action', type: 'singleLineText' },
    { name: 'Next action due', ...dt },
    { name: 'Consent', ...check },
  ]);

  await createTable('Orders', [
    { name: 'External ID', type: 'singleLineText' },
    { name: 'Channel', ...sel(...CHANNELS) },
    { name: 'Product', type: 'singleLineText' },
    { name: 'Customer', type: 'singleLineText' },
    { name: 'Revenue', ...currency },
    { name: 'Currency', type: 'singleLineText' },
    { name: 'Placed at', ...dt },
  ]);

  await createTable('Rules', [
    { name: 'Key', type: 'singleLineText' },
    { name: 'Value', type: 'singleLineText' },
    { name: 'Notes', type: 'multilineText' },
  ]);

  await createTable('Jobs', [
    { name: 'Title', type: 'singleLineText' },
    { name: 'Agent', ...sel(...AGENTS) },
    { name: 'Status', ...sel('QUEUED', 'WORKING', 'NEEDS_APPROVAL', 'DONE', 'FAILED') },
    { name: 'Input', type: 'multilineText' },
    { name: 'Result', type: 'multilineText' },
    { name: 'Requested by', ...sel('Central AI', 'Dexter', 'Schedule') },
    { name: 'Approval needed', ...check },
    { name: 'Approved by', type: 'singleLineText' },
    { name: 'Related account', type: 'multipleRecordLinks', options: { linkedTableId: accounts.id } },
    { name: 'Completed', ...dt },
  ]);

  if (SEED) {
    console.log('\nSeeding data…');
    const acc = JSON.parse(fs.readFileSync(join(airtableDir, 'accounts-seed.json'), 'utf8'));
    const rules = JSON.parse(fs.readFileSync(join(airtableDir, 'rules-seed.json'), 'utf8'));
    await seed('Accounts', acc);
    await seed('Rules', rules);
  }

  console.log('\nDone. Add AIRTABLE_API_KEY + AIRTABLE_BASE_ID to engine/.env and the engine will read/write this base.');
}

main().catch((e) => { console.error('\nSetup failed:', e.message); process.exit(1); });
