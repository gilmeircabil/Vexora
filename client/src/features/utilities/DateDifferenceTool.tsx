import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { calculateDateDifference } from '../../lib/calc/dates.js';
import { CalendarDays, Info } from 'lucide-react';

export const DateDifferenceTool: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0]!;
  // 30 days ahead default
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(futureDate);
  const [inclusive, setInclusive] = useState<boolean>(false);

  const result = calculateDateDifference(startDate, endDate, inclusive);

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={inclusive}
              onChange={(e) => setInclusive(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Include end day in count (+1 day)</span>
          </label>

          <span className="text-[11px] text-neutral-500">
            {inclusive ? 'Counting both start and end days' : 'Counting elapsed interval'}
          </span>
        </div>
      </Card>

      {/* Results Display */}
      {result.ok ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <span className="text-xs text-neutral-500">Total Calendar Days</span>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {result.value.totalDays}
              </p>
            </Card>

            <Card className="text-center p-4">
              <span className="text-xs text-neutral-500">Weeks & Days</span>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
                {result.value.totalWeeks} w {result.value.remainingDays} d
              </p>
            </Card>

            <Card className="text-center p-4">
              <span className="text-xs text-neutral-500">Business Days</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {result.value.businessDays} days
              </p>
            </Card>

            <Card className="text-center p-4">
              <span className="text-xs text-neutral-500">Weekend Days</span>
              <p className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mt-2">
                {result.value.weekendDays} days
              </p>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-500 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">
                Calculation Methodology
              </p>
              <p className="mt-0.5">{result.value.explanation}</p>
              <p className="mt-0.5">
                Dates are evaluated at UTC calendar midnight to prevent 23-hour or 25-hour daylight
                saving discrepancies.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
          {result.error}
        </div>
      )}
    </div>
  );
};
