import { Request, Response, NextFunction } from 'express';

interface RequestRecord {
  timestamps: number[];
  burstTimestamps: number[];
}

const requestRecords: Map<string, RequestRecord> = new Map();

const RATE_LIMIT_PER_MINUTE = 10;
const BURST_LIMIT = 5;
const BURST_WINDOW = 10000; // 10 seconds in milliseconds
const MINUTE_WINDOW = 60000; // 60 seconds in milliseconds

function getClientId(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function cleanupOldRecords(): void {
  const now = Date.now();
  for (const [clientId, record] of requestRecords.entries()) {
    // Remove timestamps older than 1 minute
    record.timestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < MINUTE_WINDOW
    );
    // Remove burst timestamps older than 10 seconds
    record.burstTimestamps = record.burstTimestamps.filter(
      (timestamp) => now - timestamp < BURST_WINDOW
    );

    // Remove empty records
    if (record.timestamps.length === 0 && record.burstTimestamps.length === 0) {
      requestRecords.delete(clientId);
    }
  }
}

// Cleanup old records every minute
setInterval(cleanupOldRecords, 60000);

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();

  if (!requestRecords.has(clientId)) {
    requestRecords.set(clientId, {
      timestamps: [],
      burstTimestamps: [],
    });
  }

  const record = requestRecords.get(clientId)!;

  // Check burst limit (5 requests in 10 seconds)
  const recentBurstRequests = record.burstTimestamps.filter(
    (timestamp) => now - timestamp < BURST_WINDOW
  );

  if (recentBurstRequests.length >= BURST_LIMIT) {
    res.status(429).json({
      error: 'Too many requests',
      message: `Burst limit exceeded: ${BURST_LIMIT} requests per ${BURST_WINDOW / 1000} seconds`,
    });
    return;
  }

  // Check rate limit (10 requests per minute)
  const recentRequests = record.timestamps.filter(
    (timestamp) => now - timestamp < MINUTE_WINDOW
  );

  if (recentRequests.length >= RATE_LIMIT_PER_MINUTE) {
    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded: ${RATE_LIMIT_PER_MINUTE} requests per minute`,
    });
    return;
  }

  // Record this request
  record.timestamps.push(now);
  record.burstTimestamps.push(now);

  next();
}

