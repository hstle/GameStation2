import Database from 'better-sqlite3';
import { GAMES } from './src/data/games';

const db = new Database('games.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail TEXT,
    romUrl TEXT NOT NULL,
    description TEXT,
    year TEXT,
    genre TEXT,
    platform TEXT,
    category TEXT
  )
`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO games (id, title, thumbnail, romUrl, description, year, genre, platform, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const transaction = db.transaction((games) => {
  for (const game of games) {
    insert.run(game.id, game.title, game.thumbnail, game.romUrl, game.description, game.year, game.genre, game.platform, game.category);
  }
});

console.log(`Seeding ${GAMES.length} games...`);
transaction(GAMES);
console.log('Seeding complete!');
