import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SelectedSeat } from '@/types/venue';
import { calculateSubtotal, getPriceForTier } from '@/utils/priceTiers';

interface SeatSummaryProps {
  selectedSeats: SelectedSeat[];
  maxSeats: number;
}

export function SeatSummary({ selectedSeats, maxSeats }: SeatSummaryProps) {
  const subtotal = calculateSubtotal(selectedSeats);
  const remaining = maxSeats - selectedSeats.length;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Selection Summary</CardTitle>
            <CardDescription className="text-xs mt-1">
              {selectedSeats.length} of {maxSeats} seats selected
            </CardDescription>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-sm">
              {selectedSeats.length}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2 sm:space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {selectedSeats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center mb-2 sm:mb-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">No seats selected</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-0.5 sm:mt-1">Tap seats on the map to select</p>
            </div>
          ) : (
            selectedSeats.map((seat, index) => (
              <div
                key={seat.id}
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/60 hover:shadow-sm sm:hover:shadow-md hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-150"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">{seat.id}</p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                      {seat.sectionLabel} • Row {seat.rowIndex}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right ml-2 sm:ml-3">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    ${getPriceForTier(seat.priceTier)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {selectedSeats.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subtotal</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 px-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{remaining} seat{remaining !== 1 ? 's' : ''} remaining</span>
              </div>
            )}
            {remaining === 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 px-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Maximum seats selected</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

