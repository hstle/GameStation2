import express from 'express';
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import { Readable } from 'stream';

const db = new Database('games.db');

// Initialize database
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

// Auto-seed if empty
const count = db.prepare('SELECT COUNT(*) as count FROM games').get() as { count: number };
if (count.count === 0) {
  console.log('Database empty, seeding from games.ts...');
  import('./src/data/games').then(({ GAMES }) => {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO games (id, title, thumbnail, romUrl, description, year, genre, platform, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((games) => {
      for (const game of games) {
        insert.run(game.id, game.title, game.thumbnail, game.romUrl, game.description, game.year, game.genre, game.platform, game.category);
      }
    });
    transaction(GAMES);
    console.log(`Seeded ${GAMES.length} games.`);
  }).catch(err => console.error('Seeding failed:', err));
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  const PORT = 3000;

  // API Routes
  app.get('/api/games', (req, res) => {
    const games = db.prepare('SELECT * FROM games').all();
    res.json(games);
  });

  app.post('/api/games', (req, res) => {
    const game = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO games (id, title, thumbnail, romUrl, description, year, genre, platform, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(game.id, game.title, game.thumbnail, game.romUrl, game.description, game.year, game.genre, game.platform, game.category);
    res.json({ success: true });
  });

  app.post('/api/games/bulk', (req, res) => {
    const games = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO games (id, title, thumbnail, romUrl, description, year, genre, platform, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((games) => {
      for (const game of games) {
        insert.run(game.id, game.title, game.thumbnail, game.romUrl, game.description, game.year, game.genre, game.platform, game.category);
      }
    });
    
    transaction(games);
    res.json({ success: true, count: games.length });
  });

  app.post('/api/sync/github', async (req, res) => {
    try {
      const repoUrl = 'https://api.github.com/repos/hstle/gamestation/contents/';
      const response = await fetch(repoUrl);
      const files = await response.json();

      if (!Array.isArray(files)) throw new Error('Failed to fetch file list');

      const genesisGames = files.filter((f: any) => f.name.endsWith('.md'));
      const newGames: any[] = [];

      for (const file of genesisGames) {
        const title = file.name.replace('.md', '').replace(/\(USA\)/g, '').replace(/\(Europe\)/g, '').replace(/\(World\)/g, '').trim();
        const id = file.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Check if exists
        const exists = db.prepare('SELECT id FROM games WHERE id = ?').get(id);
        if (exists) continue;

        // Construct boxart URL (Libretro pattern)
        const encodedTitle = encodeURIComponent(file.name.replace('.md', ''));
        const thumbnail = `https://thumbnails.libretro.com/Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Boxarts/${encodedTitle}.png`;
        
        newGames.push({
          id,
          title,
          thumbnail,
          romUrl: `https://raw.githubusercontent.com/hstle/gamestation/main/${encodeURIComponent(file.name)}`,
          description: `Classic Genesis action: ${title}`,
          year: 'N/A',
          genre: 'Action',
          platform: 'Genesis',
          category: 'Action'
        });

        if (newGames.length >= 200) break; // Limit to 200 as requested
      }

      const insert = db.prepare(`
        INSERT OR REPLACE INTO games (id, title, thumbnail, romUrl, description, year, genre, platform, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const transaction = db.transaction((games) => {
        for (const game of games) {
          insert.run(game.id, game.title, game.thumbnail, game.romUrl, game.description, game.year, game.genre, game.platform, game.category);
        }
      });
      
      transaction(newGames);
      res.json({ success: true, count: newGames.length });
    } catch (error) {
      console.error('Sync failed:', error);
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  app.all('/api/v1/stream', async (req, res) => {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }

    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send('URL is required');

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      };

      // Extract item ID for Referer if it's an Archive.org URL
      if (targetUrl.includes('archive.org')) {
        const match = targetUrl.match(/download\/([^\/]+)/);
        if (match && match[1]) {
          headers['Referer'] = `https://archive.org/details/${match[1]}`;
        } else {
          headers['Referer'] = 'https://archive.org/';
        }
      }
      
      if (req.headers.range) {
        headers['Range'] = req.headers.range as string;
      }

      // Ensure the URL is properly encoded if it contains spaces or special chars
      let fetchUrl = targetUrl;
      try {
        const urlObj = new URL(targetUrl);
        fetchUrl = urlObj.toString();
      } catch (e) {
        // Fallback to original if URL parsing fails
      }

      console.log(`Proxying ${req.method} request to: ${fetchUrl} (Range: ${req.headers.range || 'none'})`);

      const response = await fetch(fetchUrl, { 
        method: req.method,
        headers,
        redirect: 'follow'
      });
      
      if (!response.ok && response.status !== 206) {
        console.error(`Proxy fetch failed for ${targetUrl}: ${response.status} ${response.statusText}`);
      }

      // Forward status code
      res.status(response.status);

      // Forward essential headers
      const headersToForward = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'cache-control',
        'last-modified',
        'etag'
      ];

      headersToForward.forEach(h => {
        const val = response.headers.get(h);
        if (val) res.setHeader(h, val);
      });

      // Force content-type if missing for known extensions
      if (!res.getHeader('Content-Type')) {
        if (targetUrl.endsWith('.chd')) res.setHeader('Content-Type', 'application/octet-stream');
        if (targetUrl.endsWith('.bin')) res.setHeader('Content-Type', 'application/octet-stream');
      }

      // Enable CORS and CORP for the response
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      if (response.body) {
        // @ts-ignore - response.body is a web ReadableStream
        Readable.fromWeb(response.body).pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error('Proxy error for URL:', targetUrl, error);
      res.status(500).send('Proxy error');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
