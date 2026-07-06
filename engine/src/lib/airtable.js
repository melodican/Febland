import Airtable from 'airtable';
import { config } from '../config.js';

// The factory's memory. Tables mirror sales-factory/orchestrator-and-brain.md.
// If Airtable isn't configured yet, these fall back to an in-memory store so the
// engine still runs end-to-end for demos.

let base = null;
if (config.airtable.key && config.airtable.baseId) {
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

export const usingRealAirtable = () => Boolean(base);
