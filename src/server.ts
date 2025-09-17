import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '../generated/prisma';

import usersRouter from './users';
import pollsRouter from './polls';
import votesRouter from './votes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

export const prisma = new PrismaClient();

// Attach io to app locals for route handlers to emit updates
app.locals.io = io;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api/users', usersRouter);
app.use('/api/polls', pollsRouter);
app.use('/api/votes', votesRouter);

io.on('connection', (socket) => {
  socket.on('join_poll', (pollId: string) => {
    socket.join(`poll:${pollId}`);
  });
  socket.on('leave_poll', (pollId: string) => {
    socket.leave(`poll:${pollId}`);
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});


