import { Router, Request, Response } from 'express';
import { LRUCache } from '../cache/LRUCache';
import { DBQueue } from '../services/dbQueue';
import { addUser, getUserById } from '../data/mockUsers';
import type { User, CreateUserRequest } from '../types/user';

const router = Router();
const cache = new LRUCache<User>(60); // 60 second TTL
const dbQueue = new DBQueue();

// GET /users/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Check cache first
    const cachedUser = cache.get(`user:${userId}`);
    if (cachedUser) {
      res.json(cachedUser);
      return;
    }

    // Fetch from database (with queue and deduplication)
    const user = await dbQueue.fetchUser(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Cache the result
    cache.set(`user:${userId}`, user);

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email }: CreateUserRequest = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    // Create user
    const user = addUser(name, email);

    // Cache the new user
    cache.set(`user:${user.id}`, user);

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as usersRouter, cache, dbQueue };

