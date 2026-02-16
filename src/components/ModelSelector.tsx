'use client';

// ModelSelector — Laat gebruikers een AI model kiezen voor hun bot
import { useState, useEffect } from 'react';
import { AIModel, AIModelConfig } from '@/lib/types';

interface ModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
}

interface ModelWithAvailability extends AIModelConfig {
  available: boolean;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Groepeer per provider
  const anthropicModels = models.filter((m) => m.provider === 'anthropic');
  const openaiModels = models.filter((m) => m.provider === 'openai');

  return (
    <div className="space-y-4">
      {/* Anthropic modellen */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Anthropic (Claude)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {anthropicModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={value === model.id}
              onClick={() => model.available && onChange(model.id)}
            />
          ))}
        </div>
      </div>

      {/* OpenAI modellen */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          OpenAI (ChatGPT)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {openaiModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={value === model.id}
              onClick={() => model.available && onChange(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelCard({
  model,
  selected,
  onClick,
}: {
  model: ModelWithAvailability;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!model.available}
      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-opacity-100 bg-opacity-10'
          : model.available
          ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/8'
          : 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed'
      }`}
      style={
        selected
          ? {
              borderColor: model.color,
              backgroundColor: `${model.color}15`,
            }
          : undefined
      }
    >
      {/* Tier badge */}
      <div className="absolute top-2 right-2">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${
            model.tier === 'free'
              ? 'bg-green-500/20 text-green-400'
              : model.tier === 'premium'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {model.tier}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <span className="text-2xl">{model.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">
            {model.displayName}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
            {model.description}
          </div>
          {!model.available && (
            <div className="text-[10px] text-red-400 mt-1">
              API key niet geconfigureerd
            </div>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
          style={{ backgroundColor: model.color }}
        >
          ✓
        </div>
      )}
    </button>
  );
}
