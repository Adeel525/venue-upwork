import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { rateLimiter } from './middleware/rateLimiter';
import { usersRouter, cache, dbQueue } from './routes/users';
import { cacheRouter, setCacheInstance, setDBQueueInstance } from './routes/cache';
import { seatsRouter } from './routes/seats';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Initialize cache and queue instances for cache routes
setCacheInstance(cache);
setDBQueueInstance(dbQueue);

// Routes
app.use('/users', usersRouter);
app.use('/cache', cacheRouter);
app.use('/seats', seatsRouter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;

