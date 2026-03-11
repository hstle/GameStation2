import React from 'react';
import { NetplaySession } from '../types';
import { Users, Play, Clock, Shield, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface NetplayLobbyProps {
  sessions: NetplaySession[];
  onJoin: (sessionId: string) => void;
  onCreate: () => void;
}

export const NetplayLobby: React.FC<NetplayLobbyProps> = ({ sessions, onJoin, onCreate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Globe size={18} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Netplay Lobby</h2>
          </div>
          <p className="text-zinc-500">Join active sessions or host your own multiplayer game.</p>
        </div>
        <button
          onClick={onCreate}
          className="bg-emerald-500 text-black px-8 py-3 rounded-full font-bold hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
        >
          Host New Session
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl">
            <Users size={48} className="mx-auto text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">No active sessions</h3>
            <p className="text-zinc-600">Be the first to host a game!</p>
          </div>
        ) : (
          sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-500/30 transition-colors group"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center text-emerald-500 border border-white/5">
                  <Play fill="currentColor" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {session.gameTitle}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                      <Shield size={14} className="text-emerald-500/50" />
                      Host: <span className="text-zinc-300">{session.hostName}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                      <Clock size={14} />
                      {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex -space-x-2">
                      {[...Array(session.playerCount)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#111] flex items-center justify-center text-[10px] text-black font-bold">
                          P{i+1}
                        </div>
                      ))}
                      {[...Array(session.maxPlayers - session.playerCount)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#111]" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white">
                      {session.playerCount}/{session.maxPlayers}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${session.status === 'waiting' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {session.status === 'waiting' ? 'Waiting for players' : 'In Session'}
                  </span>
                </div>

                <button
                  disabled={session.status !== 'waiting'}
                  onClick={() => onJoin(session.id)}
                  className={`px-8 py-3 rounded-full font-bold transition-all ${
                    session.status === 'waiting'
                      ? 'bg-white/10 text-white hover:bg-emerald-500 hover:text-black'
                      : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {session.status === 'waiting' ? 'Join Game' : 'Full'}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
