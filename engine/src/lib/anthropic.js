import { config } from '../config.js';

// How both the central AI and every sub-agent think. The SDK is imported lazily,
// so the rest of the engine (board, queue, feeds) loads without it installed —
// only actually calling the model requires `@anthropic-ai/sdk` + a credential.
let client;
async function getClient() {
  if (!client) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    client = new Anthropic(); // resolves ANTHROPIC_API_KEY, or an `ant auth login` OAuth profile
  }
  return client;
}

/**
 * Pass a `schema` (JSON Schema) to force structured JSON out — the return value
 * is then the parsed object. Without a schema you get the text string.
 */
export async function think({ system, prompt, messages, schema, maxTokens = 8000, model = config.model }) {
  const c = await getClient();
  const msgs = messages || [{ role: 'user', content: prompt }];
  const params = {
    model,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' }, // let Claude decide how hard to think per task
    system,
    messages: msgs,
  };
  if (schema) params.output_config = { format: { type: 'json_schema', schema } };
  const res = await c.messages.create(params);
  if (res.stop_reason === 'refusal') throw new Error('Claude declined this request (safety). Rework the prompt.');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return schema ? JSON.parse(text) : text;
}
