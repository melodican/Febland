import { think } from './lib/anthropic.js';
import { createJob, updateJob } from './lib/airtable.js';
import { loadBrain, guardrailText } from './brain.js';
import { agents, agentNames } from './agents/index.js';

// The central AI. Given an instruction from Dexter, it plans a set of jobs,
// spawns the right sub-agent for each, and honours the human-approval gates.
// This is what the centre panel of Febland Central talks to.

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string', description: "A short reply to Dexter, in Febland's voice." },
    jobs: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          agent: { type: 'string', enum: agentNames },
          goal: { type: 'string' },
        },
        required: ['agent', 'goal'],
      },
    },
  },
  required: ['reply', 'jobs'],
};

export async function handleInstruction(instruction) {
  const { docs } = loadBrain();
  const plan = await think({
    system: `You are the central AI running Febland's sales side — you mirror how Dexter (the MD) thinks.
You break an instruction into jobs and spawn the right agent for each. Available agents:
${agentNames.map((n) => `- ${n}: ${agents[n].role}`).join('\n')}

Rules of the business:
${docs}

${guardrailText()}

Keep the plan tight — usually 1–3 jobs. Only spawn what the instruction needs.`,
    prompt: `Dexter says: "${instruction}"\n\nPlan the jobs.`,
    schema: PLAN_SCHEMA,
    maxTokens: 2000,
  });

  const results = [];
  for (const job of plan.jobs) {
    const agent = agents[job.agent];
    if (!agent) continue;
    const record = await createJob({
      Title: job.goal,
      Agent: agent.name,
      Status: 'WORKING',
      'Requested by': 'Dexter',
    });
    try {
      const out = await agent.run(job.goal);
      await updateJob(record.id, {
        Status: out.needsApproval ? 'NEEDS_APPROVAL' : 'DONE',
        Result: JSON.stringify(out),
        'Approval needed': out.needsApproval,
      });
      results.push({ jobId: record.id, agent: agent.name, ...out });
    } catch (err) {
      await updateJob(record.id, { Status: 'FAILED', Result: String(err.message) });
      results.push({ jobId: record.id, agent: agent.name, error: err.message });
    }
  }

  return { reply: plan.reply, results };
}
