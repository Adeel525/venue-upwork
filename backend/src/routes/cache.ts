import { Router, Request, Response } from 'express';
import { LRUCache } from '../cache/LRUCache';
import { DBQueue } from '../services/dbQueue';
import type { CacheStats } from '../types/user';

const router = Router();

// These will be set by the app
let cacheInstance: LRUCache<any> | null = null;
let dbQueueInstance: DBQueue | null = null;

export function setCacheInstance(cache: LRUCache<any>): void {
  cacheInstance = cache;
}

export function setDBQueueInstance(queue: DBQueue): void {
  dbQueueInstance = queue;
}

// DELETE /cache
router.delete('/', (_req: Request, res: Response) => {
  if (!cacheInstance) {
    res.status(500).json({ error: 'Cache not initialized' });
    return;
  }

  cacheInstance.clear();
  res.status(200).json({ message: 'Cache cleared successfully' });
});

// GET /cache-status
router.get('/', (_req: Request, res: Response) => {
  if (!cacheInstance || !dbQueueInstance) {
    res.status(500).json({ error: 'Cache or queue not initialized' });
    return;
  }

  const stats = cacheInstance.getStats();
  const averageResponseTime = dbQueueInstance.getAverageResponseTime();

  const response: CacheStats = {
    ...stats,
    averageResponseTime,
  };

  res.json(response);
});

export { router as cacheRouter };

