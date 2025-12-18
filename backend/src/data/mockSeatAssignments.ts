import type { User } from '../types/user';

export interface SeatAssignment {
  seatId: string;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'reserved' | 'sold' | 'held';
  reservedAt?: string;
}

// Mock seat assignments - simulating seats held/reserved/sold by different users
export const mockSeatAssignments: Record<string, SeatAssignment> = {
  // User 1 (John Doe) has some reserved seats
  'A-1-02': {
    seatId: 'A-1-02',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'reserved',
    reservedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  'A-1-03': {
    seatId: 'A-1-03',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'reserved',
    reservedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  
  // User 2 (Jane Smith) has some held seats
  'A-1-05': {
    seatId: 'A-1-05',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'held',
    reservedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
  },
  'A-1-06': {
    seatId: 'A-1-06',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'held',
    reservedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  
  // User 3 (Alice Johnson) has some sold seats
  'A-1-08': {
    seatId: 'A-1-08',
    userId: 3,
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    status: 'sold',
    reservedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  'A-1-09': {
    seatId: 'A-1-09',
    userId: 3,
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    status: 'sold',
    reservedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  
  // Add more random assignments for demonstration
  'B-2-10': {
    seatId: 'B-2-10',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'reserved',
    reservedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  'C-3-15': {
    seatId: 'C-3-15',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'held',
    reservedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  'D-4-20': {
    seatId: 'D-4-20',
    userId: 3,
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    status: 'sold',
    reservedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
};

export function getSeatAssignment(seatId: string): SeatAssignment | undefined {
  return mockSeatAssignments[seatId];
}

export function getAllSeatAssignments(): SeatAssignment[] {
  return Object.values(mockSeatAssignments);
}

export function getSeatAssignmentsByUser(userId: number): SeatAssignment[] {
  return Object.values(mockSeatAssignments).filter((assignment) => assignment.userId === userId);
}

