import { think } from './lib/anthropic.js';
import { createJob } from './lib/airtable.js';
import { loadBrain, guardrailText } from './brain.js';
import { agents, agentNames } from './agents/index.js';

// The central AI. Given an instruction (from Dexter, a schedule, or an event), it
// plans a set of jobs and puts them on the board as QUEUED. It does NOT run them —
// the worker (worker.js) drains the queue. This separation is what makes the board
// real: tasks are created here, fulfilled there, visible throughout.

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string', description: "A short reply to whoever asked, in Febland's voice." },
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

export async function planInstruction(instruction, requestedBy = 'Dexter') {
  const { docs } = loadBrain();
  const plan = await think({
    system: `You are the central AI running Febland's sales side — you mirror how Dexter (the MD) thinks.
You break an instruction into jobs and assign the right agent to each. Available agents:
${agentNames.map((n) => `- ${n}: ${agents[n].role}`).join('\n')}

Rules of the business:
${docs}

${guardrailText()}

Keep the plan tight — usually 1–3 jobs. Only spawn what the instruction needs.`,
    prompt: `Instruction from ${requestedBy}: "${instruction}"\n\nPlan the jobs.`,
    schema: PLAN_SCHEMA,
    maxTokens: 2000,
  });

  const created = [];
  for (const job of plan.jobs) {
    const agent = agents[job.agent];
    if (!agent) continue;
    const rec = await createJob({
      Title: job.goal,
      Agent: agent.name,
      Status: 'QUEUED',
      Input: job.goal,
      'Requested by': requestedBy === 'Schedule' ? 'Schedule' : requestedBy === 'Dexter' ? 'Dexter' : 'Central AI',
    });
    created.push({ id: rec.id, agent: agent.name, goal: job.goal });
  }
  return { reply: plan.reply, created };
}
