'use client';

import { use } from 'react';
import Navbar from '@/components/Navbar';
import BattleArena from '@/components/BattleArena';

export default function ArenaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <BattleArena battleId={id} />
      </main>
    </>
  );
}
