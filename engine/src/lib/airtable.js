import { config } from '../config.js';

// The factory's memory. Tables mirror sales-factory/orchestrator-and-brain.md.
// If Airtable isn't configured yet, these fall back to an in-memory store so the
// engine still runs end-to-end with zero dependencies. The `airtable` package is
// imported lazily, only when a key is present — so in-memory mode needs no install.

let base = null;
if (config.airtable.key && config.airtable.baseId) {
  const Airtable = (await import('airtable')).default;
  base = new Airtable({ apiKey: config.airtable.key }).base(config.airtable.baseId);
}

const memory = { Accounts: [], Jobs: [], Orders: [] };

export async function createJob(fields) {
  if (!base) {
    const rec = { id: `job_${memory.Jobs.length + 1}`, fields: { ...fields } };
    memory.Jobs.push(rec);
    return rec;
  }
  const [rec] = await base('Jobs').create([{ fields }]);
  return { id: rec.id, fields: rec.fields };
}

export async function listJobs({ status } = {}) {
  if (!base) return memory.Jobs.filter((j) => !status || j.fields.Status === status);
  const records = await base('Jobs')
    .select(status ? { filterByFormula: `{Status} = '${status}'` } : {})
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields }));
}

export async function updateJob(id, fields) {
  if (!base) {
    const rec = memory.Jobs.find((j) => j.id === id);
    if (rec) Object.assign(rec.fields, fields);
    return rec;
  }
  const [rec] = await base('Jobs').update([{ id, fields }]);
  return { id: rec.id, fields: rec.fields };
}

export async function listAccounts({ stage, maxRecords = 50 } = {}) {
  if (!base) return memory.Accounts.filter((a) => !stage || a.fields.Stage === stage);
  const records = await base('Accounts')
    .select({ maxRecords, ...(stage ? { filterByFormula: `{Stage} = '${stage}'` } : {}) })
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields }));
}

export async function upsertAccounts(rows) {
  if (!base) {
    rows.forEach((f) => memory.Accounts.push({ id: `acc_${memory.Accounts.length + 1}`, fields: f }));
    return rows.length;
  }
  // Airtable caps create at 10 per call.
  for (let i = 0; i < rows.length; i += 10) {
    await base('Accounts').create(rows.slice(i, i + 10).map((fields) => ({ fields })));
  }
  return rows.length;
}

// ---- Orders (feeds → dashboard revenue tiles) ----

async function existingOrderIds() {
  if (!base) return new Set(memory.Orders.map((o) => o.fields['External ID']));
  const records = await base('Orders').select({ fields: ['External ID'] }).all();
  return new Set(records.map((r) => r.fields['External ID']).filter(Boolean));
}

// De-dupes on External ID so re-running a feed never double-counts revenue.
export async function upsertOrders(normalizedOrders) {
  const { toAirtable } = await import('../feeds/normalize.js');
  const seen = await existingOrderIds();
  const fresh = normalizedOrders.filter((o) => o.externalId && !seen.has(o.externalId));
  if (!fresh.length) return 0;
  const rows = fresh.map((o) => toAirtable(o));
  if (!base) {
    rows.forEach((fields) => memory.Orders.push({ id: `ord_${memory.Orders.length + 1}`, fields }));
    return rows.length;
  }
  for (let i = 0; i < rows.length; i += 10) {
    await base('Orders').create(rows.slice(i, i + 10).map((fields) => ({ fields })));
  }
  return rows.length;
}

export async function listOrders() {
  const { fromAirtable } = await import('../feeds/normalize.js');
  if (!base) return memory.Orders.map((o) => fromAirtable(o.fields));
  const records = await base('Orders').select().all();
  return records.map((r) => fromAirtable(r.fields));
}

export const usingRealAirtable = () => Boolean(base);
