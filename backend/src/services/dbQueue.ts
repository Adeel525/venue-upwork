import type { User } from '../types/user';
import { getUserById } from '../data/mockUsers';

interface QueuedRequest {
  userId: number;
  resolve: (value: User | null) => void;
  reject: (error: Error) => void;
  startTime: number;
}

export class DBQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private pendingRequests: Map<number, Promise<User | null>> = new Map();
  private responseTimes: number[] = [];
  private readonly delay = 200; // 200ms delay

  async fetchUser(userId: number): Promise<User | null> {
    // Promise deduplication: if a request for this user is already pending, return that promise
    const existingPromise = this.pendingRequests.get(userId);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new promise for this request
    const promise = new Promise<User | null>((resolve, reject) => {
      const startTime = Date.now();
      this.queue.push({
        userId,
        resolve: (user) => {
          const responseTime = Date.now() - startTime;
          this.responseTimes.push(responseTime);
          // Keep only last 1000 response times for average calculation
          if (this.responseTimes.length > 1000) {
            this.responseTimes.shift();
          }
          this.pendingRequests.delete(userId);
          resolve(user);
        },
        reject: (error) => {
          this.pendingRequests.delete(userId);
          reject(error);
        },
        startTime,
      });
    });

    this.pendingRequests.set(userId, promise);
    this.processQueue();
    return promise;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (!request) break;

      // Simulate 200ms database delay
      await new Promise((resolve) => setTimeout(resolve, this.delay));

      // Fetch user from mock data
      const user = getUserById(request.userId);
      request.resolve(user || null);
    }

    this.processing = false;
  }

  getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) {
      return 0;
    }
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimes.length;
  }

  clearStats(): void {
    this.responseTimes = [];
  }
}

