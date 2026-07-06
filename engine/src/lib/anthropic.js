import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

// Single shared client. Reads ANTHROPIC_API_KEY from the environment.
const client = new Anthropic();

/**
 * Call Claude. This is how both the central AI and every sub-agent think.
 * Pass a `schema` (JSON Schema) to force structured JSON out — the return value
 * is then the parsed object. Without a schema you get the text string.
 */
export async function think({ system, prompt, messages, schema, maxTokens = 8000, model = config.model }) {
  const msgs = messages || [{ role: 'user', content: prompt }];
  const params = {
    model,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' }, // let Claude decide how hard to think per task
    system,
    messages: msgs,
  };
  if (schema) {
    params.output_config = { format: { type: 'json_schema', schema } };
  }
  const res = await client.messages.create(params);
  if (res.stop_reason === 'refusal') {
    throw new Error('Claude declined this request (safety). Rework the prompt.');
  }
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return schema ? JSON.parse(text) : text;
}
