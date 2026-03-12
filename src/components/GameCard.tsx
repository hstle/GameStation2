import React from 'react';
import { Game } from '../types';
import { Play, Calendar, Tag, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden group relative shadow-xl transition-all duration-300 hover:shadow-emerald-500/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <motion.button 
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.1 } 
            }}
            onClick={() => onSelect(game)}
            className="px-8 py-3 bg-emerald-500 text-black rounded-full font-bold uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-2xl"
          >
            <Play fill="currentColor" size={18} />
            Play Solo
          </motion.button>
        </div>
      </div>
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors truncate pr-2">
            {game.title}
          </h3>
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-zinc-800 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-400 font-bold border border-white/5 shrink-0">
            {game.platform}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-[8px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Calendar size={10} className="text-emerald-500 sm:w-3 sm:h-3" />
            {game.year}
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Tag size={10} className="text-emerald-500 sm:w-3 sm:h-3" />
            {game.genre}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
