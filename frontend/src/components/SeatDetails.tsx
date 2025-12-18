import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SelectedSeat, SeatAssignment } from '@/types/venue';

interface SeatDetailsProps {
  seat: SelectedSeat | null;
  isSelectedByYou?: boolean;
  seatAssignment?: SeatAssignment;
}

export function SeatDetails({ seat, isSelectedByYou = false, seatAssignment }: SeatDetailsProps) {
  if (!seat) {
    return (
      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-md sm:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Seat Details</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">Tap a seat to view information</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100/60 dark:bg-slate-800/60 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">No seat selected</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-0.5 sm:mt-1">Select a seat from the map</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSelectionStatus = () => {
    if (isSelectedByYou) {
      return { text: 'Your Selection', color: 'text-blue-600 dark:text-blue-400' };
    }
    if (seatAssignment) {
      if (seatAssignment.status === 'reserved') {
        return { 
          text: `Reserved by ${seatAssignment.userName}`, 
          color: 'text-yellow-600 dark:text-yellow-400' 
        };
      }
      if (seatAssignment.status === 'held') {
        return { 
          text: `Held by ${seatAssignment.userName}`, 
          color: 'text-purple-600 dark:text-purple-400' 
        };
      }
      if (seatAssignment.status === 'sold') {
        return { 
          text: `Sold to ${seatAssignment.userName}`, 
          color: 'text-red-600 dark:text-red-400' 
        };
      }
    }
    if (seat.status === 'reserved') {
      return { text: 'Reserved by Others', color: 'text-yellow-600 dark:text-yellow-400' };
    }
    if (seat.status === 'held') {
      return { text: 'Held by Others', color: 'text-purple-600 dark:text-purple-400' };
    }
    if (seat.status === 'sold') {
      return { text: 'Sold', color: 'text-red-600 dark:text-red-400' };
    }
    return { text: 'Available', color: 'text-green-600 dark:text-green-400' };
  };

  const selectionStatus = getSelectionStatus();

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-md sm:shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 px-4 sm:px-6 py-3 sm:py-4 pb-2.5 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Seat Details</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">Information about the selected seat</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
          isSelectedByYou 
            ? 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/60' 
            : seatAssignment
            ? seatAssignment.status === 'reserved'
              ? 'bg-yellow-50/80 dark:bg-yellow-950/20 border-yellow-200/60 dark:border-yellow-800/60'
              : seatAssignment.status === 'held'
              ? 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-800/60'
              : 'bg-red-50/80 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/60'
            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</span>
            <span className={`text-xs sm:text-sm font-bold ${selectionStatus.color}`}>
              {selectionStatus.text}
            </span>
          </div>
        </div>
        <div className="space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">Section</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">{seat.sectionLabel}</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">Row</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">{seat.rowIndex}</p>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">Seat ID</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">{seat.id}</p>
          </div>
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/40 dark:border-amber-800/40">
            <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">Price Tier</span>
            <span className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">Tier {seat.priceTier}</span>
          </div>
        </div>
        {seatAssignment && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 uppercase tracking-wide">Assigned To</p>
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Name</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 text-right">{seatAssignment.userName}</span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Email</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 break-all text-right max-w-[60%]">{seatAssignment.userEmail}</span>
              </div>
              {seatAssignment.reservedAt && (
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40">
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Reserved</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 text-right">
                    {new Date(seatAssignment.reservedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

