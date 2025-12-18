import type { SelectedSeat } from '@/types/venue';

const STORAGE_KEY = 'venue-selected-seats';

export function saveSelectedSeats(seats: SelectedSeat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
  } catch (error) {
    console.error('Failed to save selected seats to localStorage:', error);
  }
}

export function loadSelectedSeats(): SelectedSeat[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SelectedSeat[];
  } catch (error) {
    console.error('Failed to load selected seats from localStorage:', error);
    return [];
  }
}

export function clearSelectedSeats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear selected seats from localStorage:', error);
  }
}

