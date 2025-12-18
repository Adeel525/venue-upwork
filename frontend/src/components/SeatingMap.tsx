import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import type { Venue, SelectedSeat, Seat, SeatAssignment } from '@/types/venue';
import { cn } from '@/utils/cn';

interface SeatingMapProps {
  venue: Venue;
  selectedSeats: SelectedSeat[];
  onSeatToggle: (seat: SelectedSeat) => void;
  isSelected: (seatId: string) => boolean;
  canSelectMore: boolean;
  onSeatFocus?: (seatId: string) => void;
  seatAssignments?: Record<string, SeatAssignment>;
}

interface SeatComponentProps {
  seat: Seat;
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: (seat: SelectedSeat) => void;
  onFocus: (seatId: string) => void;
  isFocused: boolean;
}

const SeatComponent = React.memo(({
  seat,
  sectionId,
  sectionLabel,
  rowIndex,
  isSelected,
  canSelect,
  onToggle,
  onFocus,
  isFocused,
}: SeatComponentProps) => {
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent panning when clicking on a seat
    if (seat.status === 'available' && (canSelect || isSelected)) {
      onToggle({
        ...seat,
        sectionId,
        sectionLabel,
        rowIndex,
      });
    }
  }, [seat, sectionId, sectionLabel, rowIndex, isSelected, canSelect, onToggle]);

  const handleSeatTouch = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Direct selection on touch for seats
    if (seat.status === 'available' && (canSelect || isSelected)) {
      onToggle({
        ...seat,
        sectionId,
        sectionLabel,
        rowIndex,
      });
    }
  }, [seat, sectionId, sectionLabel, rowIndex, isSelected, canSelect, onToggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const handleFocus = useCallback(() => {
    onFocus(seat.id);
  }, [seat.id, onFocus]);

  const getStatusColor = () => {
    if (isSelected) return '#3b82f6'; // blue-500
    if (seat.status === 'available') return '#000000'; // black
    if (seat.status === 'reserved') return '#eab308'; // yellow-500
    if (seat.status === 'sold') return '#ef4444'; // red-500
    if (seat.status === 'held') return '#a855f7'; // purple-500
    return '#9ca3af'; // gray-400
  };

  const getHoverColor = () => {
    if (isSelected) return '#2563eb'; // blue-600
    if (seat.status === 'available') return '#333333'; // dark gray on hover
    return getStatusColor();
  };

  const isInteractive = seat.status === 'available';

  return (
    <g>
      <circle
        cx={seat.x}
        cy={seat.y}
        r={8}
        fill={getStatusColor()}
        className={cn(
          isInteractive && 'cursor-pointer transition-all',
          !isInteractive && 'cursor-not-allowed opacity-60',
          isFocused && 'outline outline-2 outline-offset-2 outline-blue-400',
          isSelected && 'outline outline-2 outline-offset-1 outline-blue-600'
        )}
        style={{
          transition: 'fill 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (isInteractive || isSelected) {
            e.currentTarget.setAttribute('fill', getHoverColor());
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.setAttribute('fill', getStatusColor());
        }}
        onClick={handleClick}
        onTouchEnd={handleSeatTouch}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        tabIndex={isInteractive ? 0 : -1}
        aria-label={`Seat ${seat.id} in ${sectionLabel}, Row ${rowIndex}, ${seat.status}, Price Tier ${seat.priceTier}${isSelected ? ', Your Selection' : ''}`}
        role={isInteractive ? 'button' : undefined}
        aria-disabled={!isInteractive || (!canSelect && !isSelected)}
      />
      {/* Add a small indicator for selected seats */}
      {isSelected && (
        <circle
          cx={seat.x}
          cy={seat.y}
          r={3}
          fill="white"
          aria-hidden="true"
        />
      )}
    </g>
  );
});

SeatComponent.displayName = 'SeatComponent';

// Custom comparison function for React.memo to prevent unnecessary re-renders
const areEqual = (prevProps: SeatComponentProps, nextProps: SeatComponentProps) => {
  return (
    prevProps.seat.id === nextProps.seat.id &&
    prevProps.seat.status === nextProps.seat.status &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.canSelect === nextProps.canSelect &&
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.sectionId === nextProps.sectionId &&
    prevProps.sectionLabel === nextProps.sectionLabel &&
    prevProps.rowIndex === nextProps.rowIndex
  );
};

// Re-export with proper memo comparison
const MemoizedSeatComponent = React.memo(SeatComponent, areEqual);
MemoizedSeatComponent.displayName = 'MemoizedSeatComponent';

export function SeatingMap({
  venue,
  selectedSeats,
  onSeatToggle,
  isSelected,
  canSelectMore,
  onSeatFocus,
  seatAssignments = {},
}: SeatingMapProps) {
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a Set for O(1) selected seat lookup
  const selectedSeatIds = useMemo(() => {
    return new Set(selectedSeats.map((s) => s.id));
  }, [selectedSeats]);

  // Flatten all seats with their section/row info and create a map for O(1) lookup
  // Apply seat assignments to override statuses
  const { allSeats, seatInfoMap } = useMemo(() => {
    const seats: Array<{
      seat: Seat;
      sectionId: string;
      sectionLabel: string;
      rowIndex: number;
    }> = [];
    const map = new Map<string, {
      seat: Seat;
      sectionId: string;
      sectionLabel: string;
      rowIndex: number;
    }>();

    venue.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          // Override seat status if there's an assignment
          const assignment = seatAssignments[seat.id];
          const seatWithStatus = assignment
            ? { ...seat, status: assignment.status as Seat['status'] }
            : seat;

          const info = {
            seat: seatWithStatus,
            sectionId: section.id,
            sectionLabel: section.label,
            rowIndex: row.index,
          };
          seats.push(info);
          map.set(seat.id, info);
        });
      });
    });

    return { allSeats: seats, seatInfoMap: map };
  }, [venue, seatAssignments]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedSeatId) return;

      const currentIndex = allSeats.findIndex((s) => s.seat.id === focusedSeatId);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const current = allSeats[currentIndex];
          // Find seat in same column, previous row
          const sameColSeats = allSeats.filter(
            (s) => s.seat.col === current.seat.col && s.sectionId === current.sectionId
          );
          const currentRowIndex = sameColSeats.findIndex((s) => s.seat.id === focusedSeatId);
          if (currentRowIndex > 0) {
            const prevSeat = sameColSeats[currentRowIndex - 1];
            nextIndex = allSeats.findIndex((s) => s.seat.id === prevSeat.seat.id);
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const current = allSeats[currentIndex];
          const sameColSeats = allSeats.filter(
            (s) => s.seat.col === current.seat.col && s.sectionId === current.sectionId
          );
          const currentRowIndex = sameColSeats.findIndex((s) => s.seat.id === focusedSeatId);
          if (currentRowIndex < sameColSeats.length - 1) {
            const nextSeat = sameColSeats[currentRowIndex + 1];
            nextIndex = allSeats.findIndex((s) => s.seat.id === nextSeat.seat.id);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (currentIndex < allSeats.length - 1) {
            nextIndex = currentIndex + 1;
          }
          break;
        }
      }

      if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < allSeats.length) {
        const nextSeat = allSeats[nextIndex];
        setFocusedSeatId(nextSeat.seat.id);
        // Focus will be handled by the browser when tabbing
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedSeatId, allSeats]);

  const handleSeatFocus = useCallback((seatId: string) => {
    setFocusedSeatId(seatId);
    onSeatFocus?.(seatId);
  }, [onSeatFocus]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 5)); // Max zoom 5x
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5)); // Min zoom 0.5x
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => {
        const newZoom = Math.max(0.5, Math.min(5, prev * delta));
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Pan (drag) functionality - drag when holding Shift or middle mouse button
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start dragging if clicking on a seat (let the seat handle the click)
    if ((e.target as HTMLElement).tagName === 'circle') {
      return;
    }
    // Only drag with Shift + click, middle mouse button, or right mouse button
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile (pinch zoom and pan)
  const touchStartRef = useRef<{ 
    distance: number; 
    center: { x: number; y: number };
    initialZoom: number;
    initialPan: { x: number; y: number };
  } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: TouchList, container: HTMLElement): { x: number; y: number } => {
    if (touches.length === 0) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    if (touches.length === 1) {
      return { 
        x: touches[0].clientX - rect.left, 
        y: touches[0].clientY - rect.top 
      };
    }
    return {
      x: ((touches[0].clientX + touches[1].clientX) / 2) - rect.left,
      y: ((touches[0].clientY + touches[1].clientY) / 2) - rect.top,
    };
  };

  const handleContainerTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any pending timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches, container);
      touchStartRef.current = { 
        distance, 
        center,
        initialZoom: zoom,
        initialPan: { ...pan }
      };
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Single touch - could be pan or seat selection
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // If touching a seat, don't start panning
      if (target && (target.tagName === 'circle' || target.closest('circle'))) {
        return;
      }

      // Small delay to distinguish between tap and drag
      touchTimeoutRef.current = setTimeout(() => {
        setIsDragging(true);
        const rect = container.getBoundingClientRect();
        setDragStart({ 
          x: touch.clientX - rect.left - pan.x, 
          y: touch.clientY - rect.top - pan.y 
        });
      }, 100);

      lastTouchRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    }
  }, [pan, zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    if (e.touches.length === 2 && touchStartRef.current) {
      // Pinch zoom
      e.preventDefault();
      e.stopPropagation();
      
      const currentDistance = getTouchDistance(e.touches);
      const currentCenter = getTouchCenter(e.touches, container);
      
      if (touchStartRef.current.distance > 0) {
        const scale = currentDistance / touchStartRef.current.distance;
        const newZoom = Math.max(0.5, Math.min(5, touchStartRef.current.initialZoom * scale));
        
        // Adjust pan to zoom towards the center point
        const zoomChange = newZoom / touchStartRef.current.initialZoom;
        const centerX = currentCenter.x;
        const centerY = currentCenter.y;
        
        setZoom(newZoom);
        setPan({
          x: centerX - (centerX - touchStartRef.current.initialPan.x) * zoomChange,
          y: centerY - (centerY - touchStartRef.current.initialPan.y) * zoomChange,
        });
        
        touchStartRef.current.distance = currentDistance;
      }
    } else if (e.touches.length === 1 && isDragging) {
      // Pan with single finger
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Don't pan if touching a seat
      if (target && (target.tagName === 'circle' || target.closest('circle'))) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      
      const rect = container.getBoundingClientRect();
      setPan({
        x: touch.clientX - rect.left - dragStart.x,
        y: touch.clientY - rect.top - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clear timeout if touch ended before drag started
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    if (e.touches.length === 0) {
      setIsDragging(false);
      touchStartRef.current = null;
      lastTouchRef.current = null;
    } else if (e.touches.length === 1 && touchStartRef.current) {
      // Switched from pinch to single touch
      touchStartRef.current = null;
    }
  }, []);

  // Calculate viewBox based on zoom and pan
  const viewBox = useMemo(() => {
    const width = venue.map.width;
    const height = venue.map.height;
    const scaledWidth = width / zoom;
    const scaledHeight = height / zoom;
    const x = -pan.x / zoom;
    const y = -pan.y / zoom;
    return `${x} ${y} ${scaledWidth} ${scaledHeight}`;
  }, [zoom, pan, venue.map.width, venue.map.height]);

  return (
    <div className="w-full overflow-hidden bg-gradient-to-br from-slate-50/80 via-slate-100/60 to-slate-50/80 dark:from-slate-900/80 dark:via-slate-950/60 dark:to-slate-900/80 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl relative border border-slate-200/60 dark:border-slate-800/60">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-10 flex flex-col gap-1.5 sm:gap-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={handleZoomIn}
          className="px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 rounded-md sm:rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 rounded-md sm:rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 rounded-md sm:rounded-lg transition-all duration-150 touch-manipulation"
          aria-label="Reset zoom"
        >
          Reset
        </button>
        <div className="text-[10px] sm:text-xs text-center font-semibold text-slate-600 dark:text-slate-400 pt-1.5 sm:pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Pan Instruction - Hidden on mobile, shown on desktop when zoomed */}
      {zoom > 1 && (
        <div className="hidden sm:block absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-700/80 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <p className="font-medium">Navigation</p>
          </div>
          <p className="text-[10px] sm:text-xs">Hold <kbd className="px-1 sm:px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono text-[9px] sm:text-[10px]">Shift</kbd> + Drag to pan</p>
          <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">Scroll to zoom</p>
        </div>
      )}
      
      {/* Mobile gesture hint */}
      <div className="sm:hidden absolute bottom-3 left-3 right-3 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md p-2 border border-slate-200/60 dark:border-slate-700/60">
        <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center">
          <span className="font-medium">Pinch to zoom</span> • <span className="font-medium">Drag to pan</span> • <span className="font-medium">Tap to select</span>
        </p>
      </div>

      {/* Seating Map Container */}
      <div
        ref={containerRef}
        className="w-full h-[500px] sm:h-[600px] overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleContainerTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'default',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        <svg
          ref={svgRef}
          width={venue.map.width}
          height={venue.map.height}
          viewBox={viewBox}
          className="w-full h-full"
          aria-label="Seating map"
          role="img"
          style={{ userSelect: 'none' }}
        >
        {allSeats.map((seatInfo) => (
          <MemoizedSeatComponent
            key={seatInfo.seat.id}
            seat={seatInfo.seat}
            sectionId={seatInfo.sectionId}
            sectionLabel={seatInfo.sectionLabel}
            rowIndex={seatInfo.rowIndex}
            isSelected={selectedSeatIds.has(seatInfo.seat.id)}
            canSelect={canSelectMore}
            onToggle={onSeatToggle}
            onFocus={handleSeatFocus}
            isFocused={focusedSeatId === seatInfo.seat.id}
          />
        ))}
        </svg>
      </div>
    </div>
  );
}

