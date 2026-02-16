// src/lib/ai.ts — Multi-provider AI integratie met streaming
// Ondersteunt Anthropic (Claude Sonnet, Haiku) en OpenAI (GPT-4o, GPT-4o-mini)

import { AIModel, AIProvider, AI_MODELS } from './types';

// Bepaal provider op basis van model ID
function getProvider(model: AIModel): AIProvider {
  return AI_MODELS[model].provider;
}

// Genereer een response met streaming — werkt voor alle modellen
export async function* streamBotResponse(
  model: AIModel,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const provider = getProvider(model);

  if (provider === 'anthropic') {
    yield* streamAnthropic(model, systemPrompt, userPrompt);
  } else if (provider === 'openai') {
    yield* streamOpenAI(model, systemPrompt, userPrompt);
  } else {
    throw new Error(`Onbekende provider voor model: ${model}`);
  }
}

// Niet-streaming versie voor eenvoudige calls
export async function generateBotResponse(
  model: AIModel,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const tokens: string[] = [];
  for await (const token of streamBotResponse(model, systemPrompt, userPrompt)) {
    tokens.push(token);
  }
  return tokens.join('');
}

// ============================================================
// ANTHROPIC PROVIDER (Claude Sonnet & Haiku)
// ============================================================
async function* streamAnthropic(
  model: AIModel,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is niet geconfigureerd');
  }

  const maxTokens = AI_MODELS[model].maxTokens;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API fout (${response.status}): ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') return;

          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'content_block_delta' && data.delta?.text) {
              yield data.delta.text;
            }
          } catch {
            // Skip onparseerbare regels
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================
// OPENAI PROVIDER (GPT-4o & GPT-4o-mini)
// ============================================================
async function* streamOpenAI(
  model: AIModel,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is niet geconfigureerd');
  }

  const maxTokens = AI_MODELS[model].maxTokens;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API fout (${response.status}): ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') return;

          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip onparseerbare regels
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================
// MODEL BESCHIKBAARHEID CHECK
// ============================================================
export function isModelAvailable(model: AIModel): boolean {
  const provider = getProvider(model);
  if (provider === 'anthropic') {
    return !!process.env.ANTHROPIC_API_KEY;
  }
  if (provider === 'openai') {
    return !!process.env.OPENAI_API_KEY;
  }
  return false;
}

// Geef alle beschikbare modellen terug (op basis van geconfigureerde API keys)
export function getAvailableModels(): AIModel[] {
  return (Object.keys(AI_MODELS) as AIModel[]).filter(isModelAvailable);
}
