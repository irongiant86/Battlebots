'use client';

import Navbar from '@/components/Navbar';
import BotCreator from '@/components/BotCreator';

export default function CreateBotPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-chakra font-bold text-white mb-2">
            Create Your Fighter
          </h1>
          <p className="text-gray-400">
            Kies een naam, persoonlijkheid, AI model en avatar voor je bot.
          </p>
        </div>
        <BotCreator />
      </main>
    </>
  );
}
