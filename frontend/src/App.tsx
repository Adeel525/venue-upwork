import { useState, useEffect } from 'react';
import type { Venue, SelectedSeat, SeatAssignment } from '@/types/venue';
import { SeatingMap } from '@/components/SeatingMap';
import { SeatDetails } from '@/components/SeatDetails';
import { SeatSummary } from '@/components/SeatSummary';
import { SeatLegend } from '@/components/SeatLegend';
import { useSeatSelection } from '@/hooks/useSeatSelection';
import { calculateSubtotal } from '@/utils/priceTiers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatAssignments, setSeatAssignments] = useState<Record<string, SeatAssignment>>({});

  const {
    selectedSeats,
    toggleSeat,
    clearSelection,
    isSelected,
    canSelectMore,
    maxSeats,
  } = useSeatSelection();

  const [selectedSeatForDetails, setSelectedSeatForDetails] = useState<SelectedSeat | null>(null);
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);

  useEffect(() => {
    // Load venue data
    fetch('/venue.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load venue data');
        }
        return res.json();
      })
      .then((data: Venue) => {
        setVenue(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Load seat assignments from backend
    fetch(`${API_BASE_URL}/seats/assignments`)
      .then((res) => {
        if (!res.ok) {
          console.warn('Failed to load seat assignments, continuing without them');
          return [];
        }
        return res.json();
      })
      .then((assignments: SeatAssignment[]) => {
        const assignmentsMap: Record<string, SeatAssignment> = {};
        assignments.forEach((assignment) => {
          assignmentsMap[assignment.seatId] = assignment;
        });
        setSeatAssignments(assignmentsMap);
      })
      .catch((err) => {
        console.warn('Error loading seat assignments:', err);
        // Continue without assignments - not critical
      });
  }, []);

  // Update selected seat for details when selection changes or seat is focused
  useEffect(() => {
    if (selectedSeats.length > 0) {
      setSelectedSeatForDetails(selectedSeats[selectedSeats.length - 1]);
    } else if (focusedSeatId && venue) {
      // Show details for focused seat even if not selected
      for (const section of venue.sections) {
        for (const row of section.rows) {
          const seat = row.seats.find((s) => s.id === focusedSeatId);
          if (seat) {
            setSelectedSeatForDetails({
              ...seat,
              sectionId: section.id,
              sectionLabel: section.label,
              rowIndex: row.index,
            });
            return;
          }
        }
      }
    } else {
      setSelectedSeatForDetails(null);
    }
  }, [selectedSeats, focusedSeatId, venue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading venue data...</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold">Error loading venue</p>
          <p className="text-muted-foreground mt-2">{error || 'Venue data not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                {venue.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-1.5">
                Select up to {maxSeats} seats{selectedSeats.length > 0 && ` • ${selectedSeats.length} selected`}
              </p>
            </div>
            {selectedSeats.length > 0 && (
              <div className="flex sm:hidden md:flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right sm:text-right">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    ${calculateSubtotal(selectedSeats).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Seating Map - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg sm:shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Seating Map</h2>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-medium">{venue.sections.reduce((sum, s) => sum + s.rows.reduce((rSum, r) => rSum + r.seats.length, 0), 0)} seats</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <SeatingMap
                  venue={venue}
                  selectedSeats={selectedSeats}
                  onSeatToggle={toggleSeat}
                  isSelected={isSelected}
                  canSelectMore={canSelectMore}
                  onSeatFocus={setFocusedSeatId}
                  seatAssignments={seatAssignments}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Details and Summary */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 lg:order-2">
            <SeatLegend />
            <SeatDetails 
              seat={selectedSeatForDetails} 
              isSelectedByYou={selectedSeatForDetails ? isSelected(selectedSeatForDetails.id) : false}
              seatAssignment={selectedSeatForDetails ? seatAssignments[selectedSeatForDetails.id] : undefined}
            />
            <SeatSummary selectedSeats={selectedSeats} maxSeats={maxSeats} />
            {selectedSeats.length > 0 && (
              <button
                onClick={clearSelection}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 via-red-550 to-red-600 hover:from-red-600 hover:via-red-650 hover:to-red-700 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 touch-manipulation"
              >
                Clear All Selections
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

