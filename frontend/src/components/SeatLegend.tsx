import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SeatLegend() {
  const legendItems = [
    { color: 'bg-blue-500', label: 'Your Selection', description: 'Seats you\'ve selected' },
    { color: 'bg-black', label: 'Available', description: 'Ready to book' },
    { color: 'bg-yellow-500', label: 'Reserved', description: 'Temporarily held' },
    { color: 'bg-purple-500', label: 'Held', description: 'Being processed' },
    { color: 'bg-red-500', label: 'Sold', description: 'No longer available' },
  ];

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-md sm:shadow-lg">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 pb-2.5 sm:pb-3 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Seat Status</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">Color guide for seat availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6">
        {legendItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group cursor-default"
          >
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${item.color} border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

