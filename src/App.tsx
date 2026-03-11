import React, { useState, useRef, useEffect } from 'react';
import { Game, View, NetplaySession } from './types';
import { GAMES } from './data/games';
import { GameCard } from './components/GameCard';
import { Emulator } from './components/Emulator';
import { NetplayLobby } from './components/NetplayLobby';
import { Gamepad2, Search, User, Menu, ArrowRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const [view, setView] = useState<View>('library');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All Platforms');
  const [sessions, setSessions] = useState<NetplaySession[]>([]);
  const [isNetplay, setIsNetplay] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [confirmSession, setConfirmSession] = useState<NetplaySession | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const gamesGridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('lobby:update', (updatedSessions: NetplaySession[]) => {
      setSessions(updatedSessions);
    });

    socketRef.current.on('session:created', (session: NetplaySession) => {
      const game = GAMES.find(g => g.id === session.gameId);
      if (game) {
        setSelectedGame(game);
        setIsNetplay(true);
        setCurrentSessionId(session.id);
        setView('player');
      }
    });

    socketRef.current.on('session:ready', () => {
      // Logic to start the game once both players are in
      console.log('Session ready!');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setIsNetplay(false);
    setCurrentSessionId(undefined);
    setView('player');
  };

  const handleHostSession = (game: Game) => {
    socketRef.current?.emit('session:create', {
      gameId: game.id,
      gameTitle: game.title,
      hostName: 'Guest_' + Math.floor(Math.random() * 1000)
    });
  };

  const handleJoinSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setConfirmSession(session);
    }
  };

  const confirmJoin = () => {
    if (confirmSession) {
      const game = GAMES.find(g => g.id === confirmSession.gameId);
      if (game) {
        setSelectedGame(game);
        setIsNetplay(true);
        setCurrentSessionId(confirmSession.id);
        setView('player');
        socketRef.current?.emit('session:join', confirmSession.id);
      }
      setConfirmSession(null);
    }
  };

  const scrollToGames = () => {
    gamesGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All Platforms' || game.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      <AnimatePresence mode="wait">
        {view !== 'player' ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Navigation */}
            <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('library')}>
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Gamepad2 size={24} />
                  </div>
                  <span className="text-xl font-black tracking-tighter uppercase italic">Game Station</span>
                </div>

                <div className="hidden md:flex items-center gap-8 mx-8">
                  <button 
                    onClick={() => setView('library')}
                    className={`text-sm font-bold uppercase tracking-widest transition-colors ${view === 'library' ? 'text-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Library
                  </button>
                  <button 
                    onClick={() => setView('lobby')}
                    className={`text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${view === 'lobby' ? 'text-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <Globe size={14} />
                    Netplay Lobby
                  </button>
                </div>

                <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
                    <User size={16} />
                    Sign In
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors md:hidden">
                    <Menu size={20} />
                  </button>
                </div>
              </div>
            </header>

            {view === 'library' ? (
              <>
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920"
                      alt="Hero Background"
                      className="w-full h-full object-cover opacity-30 scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                  </div>

                  <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        {sessions.length} Active Netplay Sessions
                      </div>
                      <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-[0.9]">
                        The Golden Era <br />
                        <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Reborn.</span>
                      </h2>
                      <p className="text-zinc-400 max-w-xl text-lg mb-10 leading-relaxed">
                        Experience the full power of Libretro in your browser. 
                        Play thousands of classics from N64, SNES, PSX, and more with zero latency 
                        and cloud save support.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={scrollToGames}
                          className="group bg-emerald-500 text-black px-10 py-4 rounded-full font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                        >
                          Start Playing
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                          onClick={scrollToGames}
                          className="bg-white/5 border border-white/10 px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
                        >
                          Browse Library
                        </button>
                        <button 
                          onClick={() => setView('lobby')}
                          className="bg-white/5 border border-white/10 px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Globe size={20} />
                          Netplay Lobby
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* Game Grid */}
                <main ref={gamesGridRef} className="max-w-7xl mx-auto px-4 py-20 w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">Popular Games</h3>
                      <p className="text-zinc-500">Hand-picked classics from the community.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['All Platforms', 'Genesis', 'SNES', 'N64', 'GBA', 'GBC', 'PSX'].map((plat) => (
                          <button
                            key={plat}
                            onClick={() => setSelectedPlatform(plat)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold border transition-all ${
                              plat === selectedPlatform 
                                ? 'bg-emerald-500 text-black border-emerald-500' 
                                : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-emerald-500/30 hover:text-white'
                            }`}
                          >
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onSelect={handleSelectGame}
                        onHostNetplay={handleHostSession}
                      />
                    ))}
                  </div>

                  {filteredGames.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-32 bg-white/5 border border-white/5 rounded-3xl"
                    >
                      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 mx-auto mb-6">
                        <Search size={40} />
                      </div>
                      <h4 className="text-2xl font-bold text-zinc-400 mb-2">No games found</h4>
                      <p className="text-zinc-600 max-w-xs mx-auto">
                        We couldn't find any games matching "{searchQuery}" in {selectedPlatform}.
                      </p>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedPlatform('All Platforms');
                        }}
                        className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-colors"
                      >
                        Clear all filters
                      </button>
                    </motion.div>
                  )}
                </main>
              </>
            ) : (
              <NetplayLobby 
                sessions={sessions} 
                onJoin={handleJoinSession}
                onCreate={() => {
                  setView('library');
                  setTimeout(scrollToGames, 100);
                }}
              />
            )}

            {/* Footer */}
            <footer className="border-t border-white/5 py-20 bg-[#050505]">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-black">
                        <Gamepad2 size={24} />
                      </div>
                      <span className="text-2xl font-black tracking-tighter uppercase italic">Game Station</span>
                    </div>
                    <p className="text-zinc-500 max-w-sm leading-relaxed">
                      The world's most advanced web-based retro gaming platform. 
                      Built by fans, for fans. Powered by the Libretro ecosystem.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-zinc-400">Platform</h4>
                    <ul className="space-y-4 text-zinc-500 text-sm">
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">Game Library</a></li>
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">Leaderboards</a></li>
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">Cloud Saves</a></li>
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">API Access</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-zinc-400">Community</h4>
                    <ul className="space-y-4 text-zinc-500 text-sm">
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">Discord Server</a></li>
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">GitHub Repo</a></li>
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">Support Forum</a></li>
                      <li><a href="#" className="hover:text-emerald-500 transition-colors">Twitter / X</a></li>
                    </ul>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                  <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">DMCA</a>
                  </div>
                  <div>
                    © 2026 Game Station. All rights reserved. Not affiliated with SEGA, Nintendo, or Sony.
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            {selectedGame && (
              <Emulator
                key={selectedGame.id}
                game={selectedGame}
                onBack={() => setView('library')}
                isNetplay={isNetplay}
                sessionId={currentSessionId}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmSession && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Join Netplay Session?</h3>
              <p className="text-zinc-400 mb-8">
                You are about to join <span className="text-white font-bold">{confirmSession.hostName}'s</span> session of <span className="text-emerald-400 font-bold">{confirmSession.gameTitle}</span>.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmSession(null)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmJoin}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                >
                  Join Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
