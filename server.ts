import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { NetplaySession } from './src/types';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // In-memory store for netplay sessions
  let sessions: NetplaySession[] = [];

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial sessions list
    socket.emit('lobby:update', sessions);

    socket.on('session:create', (data: { gameId: string, gameTitle: string, hostName: string }) => {
      const newSession: NetplaySession = {
        id: Math.random().toString(36).substring(7),
        gameId: data.gameId,
        gameTitle: data.gameTitle,
        hostName: data.hostName,
        playerCount: 1,
        maxPlayers: 2,
        status: 'waiting',
        createdAt: Date.now()
      };
      sessions.push(newSession);
      io.emit('lobby:update', sessions);
      socket.join(newSession.id);
      socket.emit('session:created', newSession);
    });

    socket.on('session:join', (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.playerCount < session.maxPlayers) {
        session.playerCount++;
        session.status = 'playing';
        socket.join(sessionId);
        io.emit('lobby:update', sessions);
        io.to(sessionId).emit('session:ready', session);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Simple cleanup: remove sessions hosted by this user or update player count
      // In a real app, we'd track which user is in which session
      sessions = sessions.filter(s => s.status === 'waiting' || s.playerCount > 1);
      io.emit('lobby:update', sessions);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
