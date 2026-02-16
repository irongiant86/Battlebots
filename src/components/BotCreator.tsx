'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BotAvatar as BotAvatarType, BotStyle, AIModel, CreateBotRequest } from '@/lib/types';
import { randomAvatar } from '@/lib/avatar-generator';
import BotAvatar from './BotAvatar';
import ModelSelector from './ModelSelector';

const STYLE_OPTIONS: { value: BotStyle; icon: string; label: string; description: string }[] = [
  { value: 'aggressive', icon: '\u2694\uFE0F', label: 'Aggressive', description: 'Directe, scherpe toon. Geen genade.' },
  { value: 'analytical', icon: '\uD83E\uDDE0', label: 'Analytical', description: 'Data-driven, logisch, methodisch' },
  { value: 'creative', icon: '\uD83C\uDFA8', label: 'Creative', description: 'Out-of-the-box, verrassend' },
  { value: 'diplomatic', icon: '\uD83D\uDD4A\uFE0F', label: 'Diplomatic', description: 'Genuanceerd, gebalanceerd' },
  { value: 'comedic', icon: '\uD83D\uDE02', label: 'Comedic', description: 'Humor als primair wapen' },
  { value: 'philosophical', icon: '\uD83D\uDD2E', label: 'Philosophical', description: 'Diepzinnig, abstract, wijsgerig' },
  { value: 'streetwise', icon: '\uD83D\uDD25', label: 'Streetwise', description: 'Straattaal, recht-voor-z\'n-raap' },
  { value: 'poetic', icon: '\u270D\uFE0F', label: 'Poetic', description: 'Lyrisch, beeldend, taalkunstenaar' },
  { value: 'custom', icon: '\u2699\uFE0F', label: 'Custom', description: 'Volledig custom system prompt' },
];

const TRAIT_OPTIONS = [
  'sarcastisch', 'formeel', 'informeel', 'creatief', 'grappig',
  'serieus', 'provocerend', 'kalm', 'energiek', 'mysterieus',
  'direct', 'subtiel', 'chaotisch', 'logisch', 'emotioneel',
];

const SHAPES: BotAvatarType['shape'][] = ['circle', 'hexagon', 'diamond', 'shield', 'star'];
const PATTERNS: BotAvatarType['pattern'][] = ['solid', 'stripes', 'dots', 'circuit', 'flames'];
const EXPRESSIONS: BotAvatarType['expression'][] = ['neutral', 'angry', 'smirk', 'determined', 'crazy'];

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
];

export default function BotCreator() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Stap 1: Identiteit
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [catchphrase, setCatchphrase] = useState('');

  // Stap 2: Persoonlijkheid
  const [style, setStyle] = useState<BotStyle>('aggressive');
  const [traits, setTraits] = useState<string[]>([]);

  // Stap 3: Instructions + Model
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState<AIModel>('claude-sonnet-4-5-20250929');

  // Stap 4: Avatar
  const [avatar, setAvatar] = useState<BotAvatarType>(randomAvatar());

  const toggleTrait = (trait: string) => {
    setTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait].slice(0, 5)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const body: CreateBotRequest = {
      name,
      tagline,
      avatar,
      personality: {
        systemPrompt,
        style,
        traits,
        catchphrase,
      },
      model,
    };

    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/bots/${data.bot.id}`);
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Netwerkfout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s <= step
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/5 text-gray-600'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-0.5 ${
                  s < step ? 'bg-amber-600' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Identiteit */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-chakra font-bold text-white">
            Identiteit
          </h2>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Bot naam *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DestroyerOfWorlds"
              maxLength={24}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
            />
            <span className="text-xs text-gray-600 mt-1 block">
              {name.length}/24
            </span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tagline *
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Vernietigt je met feiten en logica"
              maxLength={80}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
            />
            <span className="text-xs text-gray-600 mt-1 block">
              {tagline.length}/80
            </span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Catchphrase (optioneel)
            </label>
            <input
              type="text"
              value={catchphrase}
              onChange={(e) => setCatchphrase(e.target.value)}
              placeholder="Prepare to be enlightened, mortal."
              maxLength={100}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={name.trim().length < 2 || tagline.trim().length < 1}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            Volgende
          </button>
        </div>
      )}

      {/* Step 2: Persoonlijkheid */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-chakra font-bold text-white">
            Persoonlijkheid
          </h2>
          <div>
            <label className="block text-sm text-gray-400 mb-3">
              Stijl preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    style === opt.value
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <div className="text-xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-semibold text-white">
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-3">
              Traits (max 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAIT_OPTIONS.map((trait) => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    traits.includes(trait)
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
            >
              Terug
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Volgende
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Instructions + AI Model */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-chakra font-bold text-white">
            AI Model & Instructions
          </h2>

          {/* Model selectie — het hart van deze feature */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">
              Kies AI Model
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Elk model heeft een unieke stijl en sterke punten. Kies het model dat past bij je bot&apos;s persoonlijkheid.
            </p>
            <ModelSelector value={model} onChange={setModel} />
          </div>

          {/* Custom instructions */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Custom instructions (optioneel)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Beschrijf HOE je bot communiceert, niet WAT hij moet zeggen. Dit is je geheime wapen — andere users zien dit niet.
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Gebruik altijd precies 3 argumenten. Eindig elke response met een retorische vraag."
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 font-mono text-sm resize-none"
            />
            <span className="text-xs text-gray-600 mt-1 block">
              {systemPrompt.length}/1000
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
            >
              Terug
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Volgende
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Avatar */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-chakra font-bold text-white">
            Avatar
          </h2>

          {/* Preview */}
          <div className="flex justify-center py-4">
            <BotAvatar avatar={avatar} size={120} />
          </div>

          {/* Randomize */}
          <button
            onClick={() => setAvatar(randomAvatar())}
            className="w-full py-2 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            Randomize
          </button>

          {/* Shape */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Vorm</label>
            <div className="flex gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s}
                  onClick={() => setAvatar({ ...avatar, shape: s })}
                  className={`px-3 py-2 rounded-lg text-xs capitalize ${
                    avatar.shape === s
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Primaire kleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatar({ ...avatar, primaryColor: c })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    avatar.primaryColor === c
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Secundaire kleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatar({ ...avatar, secondaryColor: c })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    avatar.secondaryColor === c
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Patroon</label>
            <div className="flex gap-2 flex-wrap">
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAvatar({ ...avatar, pattern: p })}
                  className={`px-3 py-2 rounded-lg text-xs capitalize ${
                    avatar.pattern === p
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Expression */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Expressie
            </label>
            <div className="flex gap-2 flex-wrap">
              {EXPRESSIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setAvatar({ ...avatar, expression: e })}
                  className={`px-3 py-2 rounded-lg text-xs capitalize ${
                    avatar.expression === e
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
            >
              Terug
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Opslaan...' : 'Create Bot!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
