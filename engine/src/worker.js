import { listJobs, updateJob, createJob } from './lib/airtable.js';
import { agents, agentByName } from './agents/index.js';

// The worker. Drains QUEUED jobs from the board: claims one (→ WORKING), runs the
// assigned agent, writes the result back, and sets DONE or NEEDS_APPROVAL. This is
// the "agents fulfilling tasks" loop. Run it on a tick (server does) or on demand.

export async function processQueue({ max = 5 } = {}) {
  const queued = (await listJobs({ status: 'QUEUED' })).slice(0, max);
  const results = [];
  for (const j of queued) {
    await updateJob(j.id, { Status: 'WORKING' }); // soft lock so it isn't picked twice
    const agent = agentByName[j.fields.Agent];
    if (!agent) {
      await updateJob(j.id, { Status: 'FAILED', Result: `Unknown agent: ${j.fields.Agent}` });
      results.push({ id: j.id, error: `Unknown agent: ${j.fields.Agent}` });
      continue;
    }
    try {
      const out = await agent.run(j.fields.Input || j.fields.Title);
      await updateJob(j.id, {
        Status: out.needsApproval ? 'NEEDS_APPROVAL' : 'DONE',
        Result: JSON.stringify(out),
        'Approval needed': Boolean(out.needsApproval),
      });
      results.push({ id: j.id, agent: agent.name, ...out });
    } catch (err) {
      await updateJob(j.id, { Status: 'FAILED', Result: String(err.message) });
      results.push({ id: j.id, agent: agent.name, error: err.message });
    }
  }
  return { processed: results.length, results };
}

// Create a single job directly on the board — for events/webhooks (n8n) that know
// exactly which agent should act. { agent: 'Outreach', goal: '...' }.
export async function createDirectJob({ agent, goal, requestedBy = 'Central AI' }) {
  if (!agents[agent] && !agentByName[agent]) {
    throw new Error(`Unknown agent '${agent}'. One of: ${Object.keys(agents).join(', ')}`);
  }
  const name = agents[agent] ? agents[agent].name : agent;
  const rec = await createJob({ Title: goal, Agent: name, Status: 'QUEUED', Input: goal, 'Requested by': requestedBy });
  return { id: rec.id, agent: name, goal };
}
