import React, { useState } from 'react';
import { Game } from '../types';
import { X, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface BulkAddProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkAdd = ({ onClose, onSuccess }: BulkAddProps) => {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleBulkAdd = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessCount(null);

    try {
      // Expecting JSON array of games
      const games = JSON.parse(input);
      if (!Array.isArray(games)) throw new Error('Input must be a JSON array of games');

      const response = await fetch('/api/games/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(games),
      });

      if (!response.ok) throw new Error('Failed to add games');
      
      const result = await response.json();
      setSuccessCount(result.count);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncGitHub = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      // This is a mock for now, but I'll implement the logic to fetch from GitHub
      // and then add to the database.
      const response = await fetch('/api/sync/github', { method: 'POST' });
      if (!response.ok) throw new Error('Sync failed');
      const result = await response.json();
      setSuccessCount(result.count);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-2">Bulk Add Games</h2>
          <p className="text-zinc-500 text-sm">Add multiple games at once or sync from the repository.</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Upload size={20} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Manual JSON Import</h3>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"id": "game-1", "title": "Game Title", ...}]'
            className="w-full h-64 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-all mb-4"
          />

          <button
            onClick={handleBulkAdd}
            disabled={isSubmitting || !input.trim()}
            className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-tight hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
            Import Games
          </button>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <RefreshCw size={20} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Sync from Repository</h3>
          </div>
          
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Automatically scan the <strong>hstle/gamestation</strong> repository for new Genesis games (.md files) and fetch their metadata and box art.
          </p>

          <button
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-tight hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
            Sync Now
          </button>

          {successCount !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500"
            >
              <Check size={20} />
              <span className="text-sm font-bold">Successfully added {successCount} games!</span>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"
            >
              <AlertCircle size={20} />
              <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
