export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  romUrl: string;
  description: string;
  year: string;
  genre: string;
  platform: 'Genesis' | 'SNES' | 'N64' | 'GBA' | 'GBC' | 'PSX';
}

export type View = 'library' | 'player' | 'lobby';

export interface Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
}

export interface NetplaySession {
  id: string;
  gameId: string;
  gameTitle: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing';
  createdAt: number;
}
