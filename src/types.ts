export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  romUrl: string;
  description: string;
  year: string;
  genre: string;
  platform: string;
  category: string;
}

export type View = 'library' | 'player' | 'bulk-add';
