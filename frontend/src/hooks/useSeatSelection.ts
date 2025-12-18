import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SelectedSeat } from '@/types/venue';
import { saveSelectedSeats, loadSelectedSeats } from '@/utils/storage';

const MAX_SELECTED_SEATS = 8;

export function useSeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadSelectedSeats();
    if (saved.length > 0) {
      setSelectedSeats(saved);
    }
  }, []);

  // Debounced save to localStorage to avoid blocking UI
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save by 300ms
    saveTimeoutRef.current = setTimeout(() => {
      if (selectedSeats.length > 0) {
        saveSelectedSeats(selectedSeats);
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedSeats]);

  const toggleSeat = useCallback((seat: SelectedSeat) => {
    setSelectedSeats((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === seat.id);
      
      if (existingIndex >= 0) {
        // Deselect seat
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Select seat (if under limit)
        if (prev.length >= MAX_SELECTED_SEATS) {
          return prev; // Don't add if at max
        }
        return [...prev, seat];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
    saveSelectedSeats([]);
  }, []);

  // Use Set for O(1) lookup instead of O(n) array search
  const selectedSeatIdsSet = useMemo(() => {
    return new Set(selectedSeats.map((s) => s.id));
  }, [selectedSeats]);

  const isSelected = useCallback((seatId: string) => {
    return selectedSeatIdsSet.has(seatId);
  }, [selectedSeatIdsSet]);

  const canSelectMore = selectedSeats.length < MAX_SELECTED_SEATS;

  return {
    selectedSeats,
    toggleSeat,
    clearSelection,
    isSelected,
    canSelectMore,
    maxSeats: MAX_SELECTED_SEATS,
  };
}

