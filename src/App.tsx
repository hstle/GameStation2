import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Game, View } from './types';
import { GAMES } from './data/games';
import { GameCard } from './components/GameCard';
import { Emulator } from './components/Emulator';
import { Gamepad2, Search, Menu, ArrowRight, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VirtuosoGrid } from 'react-virtuoso';
import { useRetroSound } from './hooks/useRetroSound';

const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { playSound } = useRetroSound();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    const hideTimer = setTimeout(() => setIsVisible(false), 10000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
    >
      <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-black shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <Download size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black uppercase tracking-tight text-white">Install GameStation</h4>
          <p className="text-[10px] text-zinc-500 font-medium">Add to Home Screen for the full immersive experience.</p>
        </div>
        <button 
          onClick={() => {
            playSound('click');
            setIsVisible(false);
          }}
          className="p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('library');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All Platforms');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(24);
  const gamesGridRef = useRef<HTMLElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { playSound } = useRetroSound();

  const categories = ['All Categories', ...new Set(GAMES.map(g => g.category))].sort();
  const letters = ['All', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  // Reset focus when filters change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [selectedPlatform, selectedCategory, selectedLetter, searchQuery]);

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All Platforms' || game.platform === selectedPlatform;
    const matchesCategory = selectedCategory === 'All Categories' || game.category === selectedCategory;
    
    let matchesLetter = true;
    if (selectedLetter !== 'All') {
      const firstChar = game.title.charAt(0).toUpperCase();
      if (selectedLetter === '#') {
        matchesLetter = /^[0-9]/.test(firstChar);
      } else {
        matchesLetter = firstChar === selectedLetter;
      }
    }

    return matchesSearch && matchesPlatform && matchesCategory && matchesLetter;
  });

  // Gamepad Support
  const lastButtonPressRef = useRef(0);
  const BUTTON_COOLDOWN = 150;

  useEffect(() => {
    let rafId: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0];

      if (gp && view === 'library') {
        const now = Date.now();
        if (now - lastButtonPressRef.current > BUTTON_COOLDOWN) {
          const up = gp.buttons[12]?.pressed || (gp.axes[1] < -0.5 && Math.abs(gp.axes[1]) > Math.abs(gp.axes[0]));
          const down = gp.buttons[13]?.pressed || (gp.axes[1] > 0.5 && Math.abs(gp.axes[1]) > Math.abs(gp.axes[0]));
          const left = gp.buttons[14]?.pressed || (gp.axes[0] < -0.5 && Math.abs(gp.axes[0]) > Math.abs(gp.axes[1]));
          const right = gp.buttons[15]?.pressed || (gp.axes[0] > 0.5 && Math.abs(gp.axes[0]) > Math.abs(gp.axes[1]));
          const select = gp.buttons[0]?.pressed;
          const l1 = gp.buttons[4]?.pressed;
          const r1 = gp.buttons[5]?.pressed;

          if (l1 || r1) {
            lastButtonPressRef.current = now;
            const currentIndex = letters.indexOf(selectedLetter);
            let nextIndex = currentIndex;
            if (l1) nextIndex = Math.max(0, currentIndex - 1);
            if (r1) nextIndex = Math.min(letters.length - 1, currentIndex + 1);
            if (nextIndex !== currentIndex) {
              setSelectedLetter(letters[nextIndex]);
              playSound('click');
              setFocusedIndex(-1);
            }
            return;
          }

          if (up || down || left || right || select) {
            if (select && focusedIndex !== -1) {
              lastButtonPressRef.current = now;
              handleSelectGame(filteredGames[focusedIndex]);
              return;
            }

            let moved = false;
            setFocusedIndex(prev => {
              if (prev === -1) {
                moved = true;
                return 0;
              }
              
              const cols = window.innerWidth >= 1280 ? 6 : window.innerWidth >= 1024 ? 5 : window.innerWidth >= 640 ? 3 : 2;
              let next = prev;

              if (right) next = Math.min(prev + 1, filteredGames.length - 1);
              else if (left) next = Math.max(prev - 1, 0);
              else if (down) next = Math.min(prev + cols, filteredGames.length - 1);
              else if (up) next = Math.max(prev - cols, 0);
              
              if (next !== prev) {
                moved = true;
                playSound('hover');
              }
              return next;
            });

            if (moved) {
              lastButtonPressRef.current = now;
            }
          }
        }
      }
      rafId = requestAnimationFrame(pollGamepad);
    };

    rafId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(rafId);
  }, [view, focusedIndex, filteredGames, playSound, letters, selectedLetter]);

  const handleSelectGame = (game: Game) => {
    playSound('click');
    setSelectedGame(game);
    setView('player');
  };

  const scrollToGames = () => {
    playSound('click');
    gamesGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLibraryClick = () => {
    playSound('click');
    setView('library');
    setSelectedGame(null);
    setSelectedPlatform('All Platforms');
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setTimeout(() => gamesGridRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      <PWAInstallPrompt />
      <AnimatePresence mode="wait">
        {/* Mute Toggle */}
        <div className="fixed bottom-6 right-6 z-[100]">
          <button
            onClick={() => {
              playSound('click');
              setIsMuted(!isMuted);
            }}
            className="w-12 h-12 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-2xl group"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            )}
          </button>
        </div>

        {/* Background Music */}
        <div className="sr-only pointer-events-none">
          <ReactPlayer
            src="https://www.youtube.com/watch?v=egai2BNnzhk&list=RDegai2BNnzhk&start_radio=1"
            playing={true}
            loop={true}
            volume={isMuted ? 0 : 0.1}
            width="0"
            height="0"
          />
        </div>
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
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={handleLibraryClick}>
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <Gamepad2 size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase italic">Game Station</span>
                  </div>

                    <div className="hidden md:flex items-center gap-8">
                      <button 
                        onClick={handleLibraryClick}
                        className={`text-[13px] font-medium uppercase tracking-wider transition-colors ${view === 'library' && selectedCategory === 'All Categories' && selectedPlatform === 'All Platforms' ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Library
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                          className={`text-[13px] font-medium uppercase tracking-wider transition-colors flex items-center gap-1.5 ${selectedCategory !== 'All Categories' ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
                        >
                          Categories
                          <Menu size={14} />
                        </button>
                      
                      <AnimatePresence>
                        {isCategoryDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                          >
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setIsCategoryDropdownOpen(false);
                                  scrollToGames();
                                }}
                                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/5 ${cat === selectedCategory ? 'text-emerald-500' : 'text-zinc-400'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
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
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors md:hidden">
                    <Menu size={20} />
                  </button>
                </div>
              </div>
            </header>

            {view === 'library' && (
              <>
                {/* Hero Section */}
                <section className="relative min-h-[70vh] md:h-[80vh] flex items-center overflow-hidden py-20 md:py-0">
                  <div className="absolute inset-0 z-0">
                    <img
                      src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920"
                      alt="Hero Background"
                      className="w-full h-full object-cover opacity-20 scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                  </div>

                  <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-[0.9] max-w-4xl">
                        The Golden Era <br />
                        <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Reborn.</span>
                      </h2>
                      <p className="text-zinc-400 max-w-xl text-base md:text-lg mb-10 leading-relaxed">
                        Experience the full power of Libretro in your browser. 
                        Play thousands of classics from N64, SNES, and more with zero latency.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={scrollToGames}
                          className="group bg-emerald-500 text-black px-8 md:px-10 py-4 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                        >
                          Start Playing
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                          onClick={scrollToGames}
                          className="bg-white/5 border border-white/10 px-8 md:px-10 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center justify-center"
                        >
                          Browse Library
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* Game Grid */}
                <main ref={gamesGridRef} className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                      <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic mb-2">Popular Games</h3>
                      <p className="text-zinc-500 text-sm">Hand-picked classics from the community.</p>
                    </div>
                    <div className="flex flex-col gap-6 w-full md:w-auto">
                      {/* Letter Filter */}
                      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 w-full overflow-hidden">
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide touch-pan-x scroll-smooth snap-x snap-mandatory">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mr-2 shrink-0">Index</span>
                          <div className="flex items-center gap-1 min-w-max px-2">
                            {letters.map((letter) => (
                              <button
                                key={letter}
                                onClick={() => {
                                  playSound('hover');
                                  setSelectedLetter(letter);
                                }}
                                className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-[11px] font-black transition-all snap-center ${
                                  letter === selectedLetter
                                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110 z-10'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {letter}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['All Platforms', 'Genesis', 'SNES', 'N64', 'GBA', 'GBC'].map((plat) => (
                          <button
                            key={plat}
                            onClick={() => {
                              playSound('hover');
                              setSelectedPlatform(plat);
                            }}
                            className={`whitespace-nowrap px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${
                              plat === selectedPlatform 
                                ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.2)]' 
                                : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-emerald-500/30 hover:text-white'
                            }`}
                          >
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-h-[600px]">
                    <VirtuosoGrid
                      useWindowScroll
                      data={filteredGames}
                      computeItemKey={(index, game) => game.id}
                      listClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                      itemContent={(index, game) => (
                        <GameCard
                          game={game}
                          onSelect={handleSelectGame}
                          isFocused={index === focusedIndex}
                        />
                      )}
                    />
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
                        We couldn't find any games matching your filters.
                      </p>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedPlatform('All Platforms');
                          setSelectedCategory('All Categories');
                        }}
                        className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-colors"
                      >
                        Clear all filters
                      </button>
                    </motion.div>
                  )}
                </main>
              </>
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
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
