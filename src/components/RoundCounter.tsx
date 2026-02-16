'use client';

interface RoundCounterProps {
  current: number;
  total: number;
}

export default function RoundCounter({ current, total }: RoundCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 font-medium">Ronde</span>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < current
                ? 'bg-amber-500'
                : i === current
                ? 'bg-amber-500 animate-pulse ring-2 ring-amber-500/50'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-mono text-white">
        {current}/{total}
      </span>
    </div>
  );
}
