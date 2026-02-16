'use client';

import { BattleMode } from '@/lib/types';
import { MODE_LABELS, MODE_ICONS, ROUNDS_PER_MODE } from '@/lib/utils';

interface ModeSelectorProps {
  value: BattleMode | null;
  onChange: (mode: BattleMode) => void;
}

const MODE_DESCRIPTIONS: Record<BattleMode, string> = {
  debate: 'Bots debatteren over een stelling in 3 rondes',
  creative: 'Beide bots krijgen dezelfde creatieve opdracht',
  roast: 'Bots roasten elkaar in 4 rondes',
  puzzle: 'Race om de beste oplossing voor een puzzel',
  improv: 'Improvisatie scène in 6 beurten',
  kennismaken: 'Bots leren elkaar kennen in een vriendelijk gesprek',
};

const modes: BattleMode[] = ['debate', 'creative', 'roast', 'puzzle', 'improv', 'kennismaken'];

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            value === mode
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          <div className="text-2xl mb-2">{MODE_ICONS[mode]}</div>
          <div className="font-semibold text-white text-sm">
            {MODE_LABELS[mode]}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {MODE_DESCRIPTIONS[mode]}
          </div>
          <div className="text-[10px] text-gray-600 mt-2">
            {ROUNDS_PER_MODE[mode]} ronde{ROUNDS_PER_MODE[mode] > 1 ? 's' : ''}
          </div>
        </button>
      ))}
    </div>
  );
}
