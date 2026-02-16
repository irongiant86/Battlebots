'use client';

interface TypewriterTextProps {
  text: string;
  className?: string;
}

// Toont tekst met een cursor als de bot nog "typt"
export default function TypewriterText({
  text,
  className = '',
}: TypewriterTextProps) {
  return (
    <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${className}`}>
      {text}
      <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5 align-middle opacity-70" />
    </div>
  );
}
