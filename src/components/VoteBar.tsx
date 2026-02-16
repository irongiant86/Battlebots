'use client';

interface VoteBarProps {
  bot1Votes: number;
  bot2Votes: number;
  bot1Name: string;
  bot2Name: string;
}

export default function VoteBar({
  bot1Votes,
  bot2Votes,
  bot1Name,
  bot2Name,
}: VoteBarProps) {
  const total = bot1Votes + bot2Votes;
  const bot1Pct = total > 0 ? Math.round((bot1Votes / total) * 100) : 50;
  const bot2Pct = 100 - bot1Pct;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-blue-400 font-medium">
          {bot1Name} — {bot1Pct}%
        </span>
        <span className="text-red-400 font-medium">
          {bot2Pct}% — {bot2Name}
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
          style={{ width: `${bot1Pct}%` }}
        />
        <div
          className="bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
          style={{ width: `${bot2Pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
        <span>{bot1Votes} votes</span>
        <span>{bot2Votes} votes</span>
      </div>
    </div>
  );
}
