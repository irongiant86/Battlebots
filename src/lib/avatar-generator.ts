// src/lib/avatar-generator.ts — Generatieve SVG robot avatars

import { BotAvatar } from './types';

// Genereer SVG string op basis van avatar config
export function generateAvatarSVG(avatar: BotAvatar, size: number = 120): string {
  const { shape, primaryColor, secondaryColor, pattern, expression } = avatar;
  const half = size / 2;

  const shapePath = getShapePath(shape, size);
  const patternDef = getPatternDef(pattern, primaryColor, secondaryColor);
  const eyesAndMouth = getExpression(expression, size);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    ${patternDef}
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#glow)">
    ${shapePath}
  </g>
  ${eyesAndMouth}
  <circle cx="${half}" cy="${size * 0.18}" r="${size * 0.04}" fill="${secondaryColor}" opacity="0.8"/>
</svg>`;
}

function getShapePath(shape: BotAvatar['shape'], size: number): string {
  const half = size / 2;
  const fill = 'url(#botPattern)';
  const stroke = 'rgba(255,255,255,0.2)';

  switch (shape) {
    case 'circle':
      return `<circle cx="${half}" cy="${half}" r="${half * 0.85}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;

    case 'hexagon': {
      const r = half * 0.85;
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(' ');
      return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    }

    case 'diamond':
      return `<polygon points="${half},${size * 0.08} ${size * 0.92},${half} ${half},${size * 0.92} ${size * 0.08},${half}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;

    case 'shield':
      return `<path d="M ${half} ${size * 0.08} L ${size * 0.88} ${size * 0.28} L ${size * 0.88} ${size * 0.58} Q ${size * 0.88} ${size * 0.88} ${half} ${size * 0.95} Q ${size * 0.12} ${size * 0.88} ${size * 0.12} ${size * 0.58} L ${size * 0.12} ${size * 0.28} Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;

    case 'star': {
      const outerR = half * 0.85;
      const innerR = half * 0.4;
      const points = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(' ');
      return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    }

    default:
      return `<circle cx="${half}" cy="${half}" r="${half * 0.85}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }
}

function getPatternDef(
  pattern: BotAvatar['pattern'],
  primary: string,
  secondary: string
): string {
  switch (pattern) {
    case 'solid':
      return `<pattern id="botPattern" width="1" height="1"><rect width="1" height="1" fill="${primary}"/></pattern>`;

    case 'stripes':
      return `<pattern id="botPattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="${primary}"/>
        <line x1="0" y1="0" x2="10" y2="10" stroke="${secondary}" stroke-width="3" opacity="0.4"/>
      </pattern>`;

    case 'dots':
      return `<pattern id="botPattern" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="${primary}"/>
        <circle cx="6" cy="6" r="2" fill="${secondary}" opacity="0.5"/>
      </pattern>`;

    case 'circuit':
      return `<pattern id="botPattern" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="${primary}"/>
        <path d="M 0 8 L 6 8 L 8 4 L 10 12 L 12 8 L 16 8" stroke="${secondary}" stroke-width="1.5" fill="none" opacity="0.4"/>
      </pattern>`;

    case 'flames':
      return `<pattern id="botPattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="${primary}"/>
        <path d="M 10 20 Q 8 14 10 10 Q 12 6 10 0" stroke="${secondary}" stroke-width="2" fill="none" opacity="0.3"/>
        <path d="M 4 20 Q 2 16 4 12 Q 6 8 4 4" stroke="${secondary}" stroke-width="1.5" fill="none" opacity="0.2"/>
      </pattern>`;

    default:
      return `<pattern id="botPattern" width="1" height="1"><rect width="1" height="1" fill="${primary}"/></pattern>`;
  }
}

function getExpression(expression: BotAvatar['expression'], size: number): string {
  const half = size / 2;
  const eyeY = size * 0.42;
  const eyeL = half - size * 0.15;
  const eyeR = half + size * 0.15;
  const mouthY = size * 0.62;
  const eyeSize = size * 0.06;

  switch (expression) {
    case 'neutral':
      return `
        <circle cx="${eyeL}" cy="${eyeY}" r="${eyeSize}" fill="white"/>
        <circle cx="${eyeR}" cy="${eyeY}" r="${eyeSize}" fill="white"/>
        <circle cx="${eyeL}" cy="${eyeY}" r="${eyeSize * 0.5}" fill="#1a1a2e"/>
        <circle cx="${eyeR}" cy="${eyeY}" r="${eyeSize * 0.5}" fill="#1a1a2e"/>
        <line x1="${half - size * 0.1}" y1="${mouthY}" x2="${half + size * 0.1}" y2="${mouthY}" stroke="white" stroke-width="2" stroke-linecap="round"/>`;

    case 'angry':
      return `
        <circle cx="${eyeL}" cy="${eyeY}" r="${eyeSize}" fill="white"/>
        <circle cx="${eyeR}" cy="${eyeY}" r="${eyeSize}" fill="white"/>
        <circle cx="${eyeL}" cy="${eyeY}" r="${eyeSize * 0.5}" fill="#ff2d55"/>
        <circle cx="${eyeR}" cy="${eyeY}" r="${eyeSize * 0.5}" fill="#ff2d55"/>
        <line x1="${eyeL - eyeSize}" y1="${eyeY - eyeSize * 1.2}" x2="${eyeL + eyeSize}" y2="${eyeY - eyeSize * 0.5}" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="${eyeR + eyeSize}" y1="${eyeY - eyeSize * 1.2}" x2="${eyeR - eyeSize}" y2="${eyeY - eyeSize * 0.5}" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M ${half - size * 0.1} ${mouthY + size * 0.02} Q ${half} ${mouthY - size * 0.04} ${half + size * 0.1} ${mouthY + size * 0.02}" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;

    case 'smirk':
      return `
        <circle cx="${eyeL}" cy="${eyeY}" r="${eyeSize}" fill="white"/>
        <circle cx="${eyeR}" cy="${eyeY}" r="${eyeSize}" fill="white"/>
        <circle cx="${eyeL + 2}" cy="${eyeY}" r="${eyeSize * 0.5}" fill="#1a1a2e"/>
        <circle cx="${eyeR + 2}" cy="${eyeY}" r="${eyeSize * 0.5}" fill="#1a1a2e"/>
        <path d="M ${half - size * 0.08} ${mouthY} Q ${half + size * 0.04} ${mouthY + size * 0.06} ${half + size * 0.12} ${mouthY - size * 0.02}" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;

    case 'determined':
      return `
        <rect x="${eyeL - eyeSize}" y="${eyeY - eyeSize * 0.5}" width="${eyeSize * 2}" height="${eyeSize}" rx="2" fill="white"/>
        <rect x="${eyeR - eyeSize}" y="${eyeY - eyeSize * 0.5}" width="${eyeSize * 2}" height="${eyeSize}" rx="2" fill="white"/>
        <circle cx="${eyeL}" cy="${eyeY}" r="${eyeSize * 0.35}" fill="#1a1a2e"/>
        <circle cx="${eyeR}" cy="${eyeY}" r="${eyeSize * 0.35}" fill="#1a1a2e"/>
        <line x1="${half - size * 0.08}" y1="${mouthY}" x2="${half + size * 0.08}" y2="${mouthY}" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`;

    case 'crazy':
      return `
        <circle cx="${eyeL}" cy="${eyeY - 2}" r="${eyeSize * 1.2}" fill="white"/>
        <circle cx="${eyeR}" cy="${eyeY + 2}" r="${eyeSize * 0.8}" fill="white"/>
        <circle cx="${eyeL + 1}" cy="${eyeY - 3}" r="${eyeSize * 0.5}" fill="#ff2d55"/>
        <circle cx="${eyeR - 1}" cy="${eyeY + 1}" r="${eyeSize * 0.4}" fill="#2d7aff"/>
        <path d="M ${half - size * 0.12} ${mouthY} Q ${half} ${mouthY + size * 0.08} ${half + size * 0.12} ${mouthY}" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;

    default:
      return '';
  }
}

// Random avatar genereren
export function randomAvatar(): BotAvatar {
  const shapes: BotAvatar['shape'][] = ['circle', 'hexagon', 'diamond', 'shield', 'star'];
  const patterns: BotAvatar['pattern'][] = ['solid', 'stripes', 'dots', 'circuit', 'flames'];
  const expressions: BotAvatar['expression'][] = ['neutral', 'angry', 'smirk', 'determined', 'crazy'];

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  ];

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const primary = pick(colors);
  let secondary = pick(colors);
  while (secondary === primary) secondary = pick(colors);

  return {
    shape: pick(shapes),
    primaryColor: primary,
    secondaryColor: secondary,
    pattern: pick(patterns),
    expression: pick(expressions),
  };
}
