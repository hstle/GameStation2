import React from 'react';
import { Game } from '../types';
import { Play, Calendar, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useRetroSound } from '../hooks/useRetroSound';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  isFocused?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, isFocused }) => {
  const { playSound } = useRetroSound();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = React.useState(game.thumbnail);
  const [hasError, setHasError] = React.useState(false);

  const getFallbackUrl = () => {
    const platformMap: Record<string, string> = {
      'Genesis': 'Sega%20-%20Mega%20Drive%20-%20Genesis',
      'SNES': 'Nintendo%20-%20Super%20Nintendo%20Entertainment%20System',
      'N64': 'Nintendo%20-%20Nintendo%2064',
      'GBA': 'Nintendo%20-%20Game%20Boy%20Advance',
      'GBC': 'Nintendo%20-%20Game%20Boy%20Color',
      'NES': 'Nintendo%20-%20Nintendo%20Entertainment%20System'
    };

    const folder = platformMap[game.platform];
    if (!folder) return `https://picsum.photos/seed/${game.id}/400/300`;

    // Try a different source or a slightly different format
    const encodedTitle = encodeURIComponent(game.title.replace(/:/g, ' -'));
    return `https://thumbnails.libretro.com/${folder}/Named_Boxarts/${encodedTitle}%20(USA).png`;
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallbackUrl());
    } else {
      // If fallback also fails, use a generic placeholder
      setImgSrc(`https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400`);
    }
  };

  React.useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isFocused]);

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -4, scale: 1.02 }}
      animate={isFocused ? { y: -4, scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' } : { y: 0, scale: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
      onMouseEnter={() => playSound('hover')}
      className={`bg-[#111111] border rounded-xl overflow-hidden group relative shadow-lg transition-all duration-200 ${isFocused ? 'ring-2 ring-emerald-500 shadow-emerald-500/20' : 'hover:shadow-emerald-500/10 hover:border-emerald-500/20'}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imgSrc}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={handleImageError}
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
