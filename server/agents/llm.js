/**
 * LLM client for TriageAI agents, backed by Backboard.io.
 *
 * Each call is a single stateless message (memory off) that must return JSON.
 * Callers are expected to catch errors and fall back to deterministic logic
 * so the demo pipeline always completes.
 */

const BACKBOARD_URL = 'https://app.backboard.io/api/threads/messages';
const REQUEST_TIMEOUT_MS = 45_000;

export function isLLMConfigured() {
  return Boolean(process.env.backboard_api_key);
}

/**
 * Send a prompt to the LLM and parse its JSON response.
 *
 * @param {string} systemPrompt - Safety-constrained agent instructions
 * @param {string} userContent - Serialized patient context for this agent
 * @returns {Promise<object>} Parsed JSON payload from the model
 */
export async function callAgentLLM(systemPrompt, userContent) {
  const apiKey = process.env.backboard_api_key;
  if (!apiKey) {
    throw new Error('backboard_api_key is not set');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(BACKBOARD_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: userContent,
        system_prompt: systemPrompt,
        llm_provider: 'openai',
        model_name: 'gpt-4o',
        json_output: true,
        memory: 'off',
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backboard API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return parseJsonContent(data.content);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse model output into JSON, tolerating markdown code fences.
 */
function parseJsonContent(content) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('LLM returned empty content');
  }

  let text = content.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Grab the outermost JSON object in case the model added stray text
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('LLM response did not contain a JSON object');
  }

  return JSON.parse(text.slice(start, end + 1));
}
