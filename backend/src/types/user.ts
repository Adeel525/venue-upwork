export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  averageResponseTime: number;
}

