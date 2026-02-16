'use client';

import { BotAvatar as BotAvatarType } from '@/lib/types';
import { generateAvatarSVG } from '@/lib/avatar-generator';

interface BotAvatarProps {
  avatar: BotAvatarType;
  size?: number;
  className?: string;
  glowColor?: string;
}

export default function BotAvatar({
  avatar,
  size = 80,
  className = '',
  glowColor,
}: BotAvatarProps) {
  const svg = generateAvatarSVG(avatar, size);
  const glow = glowColor || avatar.primaryColor;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 8px ${glow}40)`,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
