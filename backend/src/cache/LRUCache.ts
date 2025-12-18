import type { CacheStats } from '../types/user';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessOrder: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly ttl: number; // TTL in milliseconds
  private hits: number;
  private misses: number;
  private accessCounter: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(ttlSeconds: number = 60) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
    this.hits = 0;
    this.misses = 0;
    this.accessCounter = 0;
    this.cleanupInterval = null;
    this.startCleanup();
  }

  private startCleanup(): void {
    // Run cleanup every 10 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10000);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if entry is stale
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Update access order (LRU)
    this.accessCounter++;
    entry.accessOrder = this.accessCounter;
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T): void {
    this.accessCounter++;
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessOrder: this.accessCounter,
    });
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.accessCounter = 0;
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      averageResponseTime: 0, // Will be calculated by the service using this cache
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

