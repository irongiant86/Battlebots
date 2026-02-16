'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 2) {
      await login(username.trim());
      setShowLogin(false);
      setUsername('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07070d]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
            BR
          </div>
          <span className="font-chakra font-bold text-lg text-white hidden sm:block">
            BotRoyale
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/fight"
            className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Fight
          </Link>
          <Link
            href="/rankings"
            className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Rankings
          </Link>
          {user && (
            <>
              <Link
                href="/my-bots"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                My Bots
              </Link>
              <Link
                href="/create"
                className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                + Create
              </Link>
            </>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 hidden sm:block">
                {user.username}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            </div>
          ) : (
            <>
              {showLogin ? (
                <form onSubmit={handleLogin} className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username..."
                    className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 w-32"
                    autoFocus
                    minLength={2}
                    maxLength={24}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
                  >
                    Go
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
