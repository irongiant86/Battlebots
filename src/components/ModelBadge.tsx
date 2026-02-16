'use client';

// ModelBadge — Toont welk AI model een bot gebruikt
import { AIModel, AI_MODELS } from '@/lib/types';

interface ModelBadgeProps {
  model: AIModel;
  size?: 'sm' | 'md' | 'lg';
  showProvider?: boolean;
}

export default function ModelBadge({
  model,
  size = 'sm',
  showProvider = false,
}: ModelBadgeProps) {
  const config = AI_MODELS[model];
  if (!config) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span>{config.icon}</span>
      <span>{showProvider ? config.displayName : config.shortName}</span>
    </span>
  );
}
