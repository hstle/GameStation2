import React, { useState, useEffect, useRef } from 'react';
import { Game } from '../types';
import { ChevronLeft, Maximize2, Settings, Volume2, Save, Download, RefreshCw, Keyboard, Gamepad2, AlertCircle, Loader2, Globe, ExternalLink, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRetroSound } from '../hooks/useRetroSound';

interface EmulatorProps {
  game: Game;
  onBack: () => void;
}

const PLATFORM_MAPPING: Record<string, string> = {
  'Genesis': 'segaMD',
  'SNES': 'snes',
  'N64': 'n64',
  'GBA': 'gba',
  'GBC': 'gbc',
  'NES': 'nes',
  'PSX': 'pcsx_rearmed'
};

declare global {
  interface Window {
    EJS_player: any;
    EJS_gameUrl: string;
    EJS_core: string;
    EJS_pathtodata: string;
    EJS_startOnLoaded: boolean;
    EJS_onGameStart: () => void;
    EJS_onLoad: () => void;
    EJS_volume: number;
    EJS_DEBUG_XX: boolean;
  }
}

export const Emulator: React.FC<EmulatorProps> = ({ game, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { playSound } = useRetroSound();

  const loadingMessages = [
    "Initializing Isolated Environment...",
    `Downloading ${game.platform} Core...`,
    "Allocating Virtual Memory...",
    "Syncing ROM Data...",
    "Preparing Video Driver...",
    "Ready to Play!"
  ];

  useEffect(() => {
    let isMounted = true;
    let stepInterval: any;

    const setupIframe = () => {
      if (!iframeRef.current) return;

      // Start status message rotation
      stepInterval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 2 ? prev + 1 : prev));
      }, 1500);

      const core = PLATFORM_MAPPING[game.platform] || 'segaMD';
      
      // Use proxy for PSX or Archive.org to bypass CORS
      // Improved logic to handle Archive.org ZIP sub-files
      const romUrl = (game.platform === 'PSX' || game.romUrl.includes('archive.org'))
        ? `/api/v1/stream?url=${encodeURIComponent(game.romUrl)}`
        : game.romUrl;
      
      // Use a more robust pathtodata and add more config options
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: black; }
              #game { width: 100%; height: 100%; }
            </style>
            <script src="https://js.puter.com/v2/"></script>
          </head>
          <body>
            <div id="game"></div>
            <script>
              window.onerror = function(msg, url, line, col, error) {
                window.parent.postMessage({ type: 'EJS_ERROR', message: msg }, '*');
                return false;
              };

              // Puter.js can be used here if needed for custom fetching
              // but EmulatorJS handles its own fetching. 
              // We use the server-side proxy for the main ROM.

              window.EJS_player = '#game';
              window.EJS_gameUrl = '${romUrl}';
              window.EJS_core = '${core}';
              window.EJS_pathtodata = 'https://cdn.emulatorjs.org/latest/data/';
              window.EJS_language = 'en-US';
              window.EJS_startOnLoaded = true;
              
              if ('${core}' === 'psx' || '${core}' === 'pcsx_rearmed') {
                window.EJS_threads = false;
                window.EJS_async = true;
                window.EJS_webgl = true;
                window.EJS_ad_url = '';
                // PSX BIOS (SCPH5501 is highly compatible)
                const biosUrl = 'http://api.allorigins.win/get?url=https%3A//archive.org/download/ps1-2-BIOS/SCPH1001.BIN';
                window.EJS_biosUrl = '/api/v1/stream?url=' + encodeURIComponent(biosUrl);
              }
              
              window.EJS_volume = ${isMuted ? 0 : 1};
              window.EJS_DEBUG_XX = true;
              window.EJS_mouse = false;
              window.EJS_multitap = false;
              
              const originalLog = console.log;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'EJS_LOG', message: args.join(' ') }, '*');
                originalLog.apply(console, args);
              };

              window.EJS_onGameStart = () => {
                window.parent.postMessage({ type: 'EJS_GAME_START' }, '*');
              };

              window.EJS_onLoad = () => {
                window.parent.postMessage({ type: 'EJS_LOADED' }, '*');
              };
            </script>
            <script 
              src="/api/v1/stream?url=${encodeURIComponent('https://cdn.emulatorjs.org/latest/data/loader.js')}" 
              crossorigin="anonymous"
              onerror="window.parent.postMessage({ type: 'EJS_ERROR', message: 'Failed to load emulator engine script' }, '*')"
            ></script>
          </body>
        </html>
      `;

      iframeRef.current.srcdoc = html;
    };

    const loadTimeout = setTimeout(() => {
      if (isLoading && isMounted) {
        setError('The emulator is taking too long to respond. This usually happens if the ROM file is blocked or the engine failed to initialize.');
        setIsLoading(false);
      }
    }, 25000); // 25 second timeout

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'EJS_GAME_START') {
        if (isMounted) {
          clearTimeout(loadTimeout);
          setLoadingStep(loadingMessages.length - 1);
          setTimeout(() => {
            if (isMounted) setIsLoading(false);
          }, 500);
        }
      } else if (data.type === 'EJS_LOG') {
        console.log('Emulator Engine:', data.message);
      } else if (data.type === 'EJS_LOADED') {
        if (isMounted) {
          setLoadingStep(prev => Math.max(prev, 4)); // Move to "Preparing Video Driver" step
        }
      } else if (data.type === 'EJS_ERROR') {
        if (isMounted) {
          clearTimeout(loadTimeout);
          setError(data.message || 'An unknown error occurred in the emulator engine.');
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Small delay to ensure the component is fully mounted and the iframe ref is stable
    // Also acts as a debounce to prevent race conditions if game changes rapidly
    const setupTimeout = setTimeout(setupIframe, 300);

    return () => {
      isMounted = false;
      clearTimeout(setupTimeout);
      clearTimeout(loadTimeout);
      if (stepInterval) clearInterval(stepInterval);
      window.removeEventListener('message', handleMessage);
    };
  }, [game, reloadCount]);

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Emulator Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0a0a0a] border-b border-white/5 z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              playSound('click');
              onBack();
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Exit</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            <img src={game.thumbnail} className="w-8 h-8 rounded object-cover border border-white/10" alt="" />
            <div className="flex flex-col">
              <h2 className="text-white font-bold tracking-tight leading-none mb-1">{game.title}</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                  Isolated Engine
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              playSound('click');
              setIsMuted(!isMuted);
            }} 
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            {isMuted ? <Volume2 size={18} className="opacity-50" /> : <Volume2 size={18} />}
          </button>
          <button 
            onClick={() => {
              playSound('click');
              handleFullscreen();
            }} 
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col lg:flex-row bg-[#050505]">
        {/* Emulator Screen */}
        <div className="flex-1 relative flex items-center justify-center p-4 lg:p-12">
          <div 
            ref={containerRef}
            className="w-full max-w-5xl h-full max-h-[80vh] bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col items-center justify-center border border-white/5 rounded-sm overflow-hidden"
          >
            <AnimatePresence>
              {isLoading && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-[#050505] flex flex-col items-center justify-center text-center p-8"
                >
                  {/* Prominent Loading Indicator */}
                  <div className="relative w-32 h-32 mb-12">
                    <motion.div 
                      className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"
                    />
                    <motion.div 
                      className="absolute inset-0 border-4 border-emerald-500 border-t-transparent border-r-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="absolute inset-4 border-2 border-emerald-500/20 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gamepad2 className="text-emerald-500" size={40} />
                    </div>
                  </div>

                  {/* Progress Text */}
                  <div className="max-w-md w-full">
                    <motion.h3 
                      key={loadingStep}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-2xl font-bold text-white mb-4 tracking-tight"
                    >
                      {loadingMessages[loadingStep]}
                    </motion.h3>
                    
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-6 border border-white/5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
                        System: {game.platform} / Core: {PLATFORM_MAPPING[game.platform]}
                      </p>
                      {loadingStep > 2 && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-emerald-500/60 text-[9px] font-medium mt-4"
                        >
                          Tip: If the loading bar stalls, check your internet or try refreshing.
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-20 bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-8 overflow-y-auto"
                >
                  <div className="max-w-xl w-full">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                      <AlertCircle size={40} className="text-red-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Engine Initialization Failed</h3>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                      {error}
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <HelpCircle size={16} className="text-emerald-500" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Troubleshooting Steps</h4>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex gap-3 text-xs text-zinc-400">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">1</span>
                          <span>Check your internet connection. The emulator requires external cores and assets from <code className="text-emerald-500">emulatorjs.org</code>.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-zinc-400">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">2</span>
                          <span>Disable any ad-blockers or privacy extensions (like uBlock Origin or Brave Shields) that might be blocking the emulator scripts or ROM stream.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-zinc-400">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">3</span>
                          <span>If you're using a VPN, try disabling it as it might interfere with the content delivery network.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-zinc-400">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">4</span>
                          <span>Try clearing your browser cache and refreshing the page.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button 
                        onClick={() => {
                          playSound('click');
                          setReloadCount(prev => prev + 1);
                          setIsLoading(true);
                          setError(null);
                          setLoadingStep(0);
                        }}
                        className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                      >
                        <RefreshCw size={18} />
                        Retry Engine
                      </button>
                      <button 
                        onClick={() => {
                          playSound('click');
                          onBack();
                        }}
                        className="w-full sm:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={18} />
                        Back to Library
                      </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5">
                      <a 
                        href="https://emulatorjs.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-zinc-600 hover:text-zinc-400 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Visit EmulatorJS Documentation
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Isolated Iframe Mount Point */}
            <iframe 
              key={`${game.id}-solo-${reloadCount}`}
              ref={iframeRef}
              className="w-full h-full border-none"
              title="Emulator Content"
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="hidden lg:flex w-80 flex-col border-l border-white/5 bg-[#0a0a0a] p-6 overflow-y-auto">
          <div className="mb-8">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">System Info</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Platform</span>
                <span className="text-emerald-400 font-mono">{game.platform}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Engine</span>
                <span className="text-white font-mono">EmulatorJS (Isolated)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className="text-emerald-500 font-mono">Active</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Keyboard size={14} className="text-emerald-500" />
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Controls</h4>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Controls are automatically mapped. You can customize them in the emulator settings menu (hover over the bottom of the game screen).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
