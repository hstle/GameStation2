import React from 'react';
import { Game } from '../types';
import { Play, Calendar, Tag, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  onHostNetplay: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, onHostNetplay }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden group relative"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
          <button 
            onClick={() => onSelect(game)}
            className="w-full max-w-[140px] py-2.5 bg-emerald-500 text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all scale-90 group-hover:scale-100 duration-300"
          >
            <Play fill="currentColor" size={16} />
            Play Solo
          </button>
          <button 
            onClick={() => onHostNetplay(game)}
            className="w-full max-w-[140px] py-2.5 bg-white/10 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all scale-90 group-hover:scale-100 duration-300 border border-white/10"
          >
            <Globe size={16} />
            Host Netplay
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate pr-2">
            {game.title}
          </h3>
          <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] uppercase tracking-wider text-zinc-400 font-black border border-white/5">
            {game.platform}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {game.year}
          </span>
          <span className="flex items-center gap-1">
            <Tag size={12} />
            {game.genre}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
