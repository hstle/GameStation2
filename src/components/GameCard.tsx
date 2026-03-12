import React from 'react';
import { Game } from '../types';
import { Play, Calendar, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useRetroSound } from '../hooks/useRetroSound';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const { playSound } = useRetroSound();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onMouseEnter={() => playSound('hover')}
      className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden group relative shadow-lg transition-all duration-200 hover:shadow-emerald-500/10 hover:border-emerald-500/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[1px] flex flex-col items-center justify-center">
          <motion.button 
            initial={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.05 } 
            }}
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              onSelect(game);
            }}
            className="px-6 py-2 bg-emerald-500 text-black rounded-full text-xs font-black uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl"
          >
            <Play fill="currentColor" size={14} />
            Play
          </motion.button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors truncate pr-2">
            {game.title}
          </h3>
          <span className="px-1.5 py-0.5 bg-zinc-900 rounded-md text-[8px] uppercase tracking-widest text-zinc-500 font-black border border-white/5 shrink-0">
            {game.platform}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <Calendar size={8} className="text-emerald-500/50" />
            {game.year}
          </span>
          <span className="flex items-center gap-1">
            <Tag size={8} className="text-emerald-500/50" />
            {game.genre}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
