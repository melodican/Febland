import { think } from '../lib/anthropic.js';
import { loadBrain, guardrailText } from '../brain.js';

// Each sub-agent the central AI can spawn. They all share one shape:
//   run(job) -> { summary, artifact, needsApproval, reason }
// so the orchestrator and dashboard can treat any agent uniformly.
// (See sales-factory/orchestrator-and-brain.md — the agent-spawn contract.)

const brand = () => {
  const { docs } = loadBrain();
  return `You are a sales agent for Febland — a family-run furniture, lighting, artwork and gifts
company in Blackpool, trading since 1952. Your wedge is Febland's custom-printed velvet artwork and
furniture, made in-house — differentiated stock no importer can undercut.

Decide and write like Febland, using these rules:
${docs}

${guardrailText()}`;
};

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    artifact: { type: 'string', description: 'The deliverable, e.g. email text, a prospect list, a diagnosis.' },
    artifactType: { type: 'string', enum: ['email_draft', 'prospect_list', 'line_sheet', 'diagnosis', 'note'] },
    needsApproval: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['summary', 'artifact', 'artifactType', 'needsApproval', 'reason'],
};

function makeAgent(name, role, guidance) {
  return {
    name,
    role,
    async run(goal, context = '') {
      return think({
        system: brand(),
        prompt: `You are the ${name} (${role}). ${guidance}\n\nJob: ${goal}\n${context ? `Context: ${context}` : ''}\n\nReturn your result. Set needsApproval=true for anything that sends outbound under Febland's name, offers a discount/quote/credit beyond the hard limits, or is ambiguous.`,
        schema: RESULT_SCHEMA,
        maxTokens: 4000,
      });
    },
  };
}

export const agents = {
  prospector: makeAgent('Prospector', 'Station 1 — Source',
    'Find net-new UK trade prospects matching the ideal customer profile, segmented and fit-scored. Never invent contact emails/phones — mark them for enrichment.'),
  qualifier: makeAgent('Qualifier', 'Station 2 — Enrich & score',
    'Score a prospect for fit and attach the specific custom-velvet hook for that buyer.'),
  outreach: makeAgent('Outreach', 'Station 3 — Engage',
    'Write velvet-led, segment-specific outreach (email + LinkedIn opener). Personalise; never send a generic blast. Always needsApproval on first send to a batch.'),
  salesAgent: makeAgent('Sales Agent', 'Station 4 — Converse',
    'Reply to a trade prospect, answer questions, handle objections, move toward a line sheet or call. Escalate quotes/discounts/credit beyond the hard limits.'),
  onboarder: makeAgent('Onboarder', 'Station 5 — Onboard',
    'Draft the steps to set up a new trade account. Credit terms always need human approval.'),
  merchandiser: makeAgent('Merchandiser', 'Station 6 — Sell',
    'Produce a personalised velvet-led line sheet or reorder nudge for an account based on its segment and history.'),
};

export const agentNames = Object.keys(agents);
