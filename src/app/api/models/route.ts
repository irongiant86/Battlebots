// GET /api/models — Beschikbare AI modellen ophalen
// Toont alleen modellen waarvoor een API key geconfigureerd is
import { NextResponse } from 'next/server';
import { getAllModels, AI_MODELS, AIModelConfig } from '@/lib/types';

export async function GET() {
  const allModels = getAllModels();

  // Check welke providers geconfigureerd zijn
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  const models = allModels.map((model: AIModelConfig) => ({
    ...model,
    available:
      (model.provider === 'anthropic' && hasAnthropic) ||
      (model.provider === 'openai' && hasOpenAI),
  }));

  return NextResponse.json({
    models,
    providers: {
      anthropic: hasAnthropic,
      openai: hasOpenAI,
    },
  });
}
