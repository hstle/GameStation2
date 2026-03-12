export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  romUrl: string;
  description: string;
  year: string;
  genre: string;
  platform: 'Genesis' | 'SNES' | 'N64' | 'GBA' | 'GBC';
  category: string;
}

export type View = 'library' | 'player';
