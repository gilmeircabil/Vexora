import { Result, ok, err } from '../result.js';

export interface DateDiffResult {
  totalDays: number;
  totalWeeks: number;
  remainingDays: number;
  businessDays: number;
  weekendDays: number;
  months: number;
  years: number;
  isNegative: boolean;
  explanation: string;
}

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates calendar differences between two dates using UTC date components
 * to avoid daylight saving time shifts and local timezone offsets.
 */
export function calculateDateDifference(
  startDateStr: string,
  endDateStr: string,
  inclusive = false,
): Result<DateDiffResult, string> {
  if (!startDateStr || !endDateStr) {
    return err('Both start and end dates must be provided.');
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return err('Invalid date format provided.');
  }

  // Convert both dates to UTC midnight milliseconds
  const utcStart = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const utcEnd = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  );

  const rawDiffDays = Math.round((utcEnd - utcStart) / MILLISECONDS_IN_A_DAY);
  const isNegative = rawDiffDays < 0;
  let totalDays = Math.abs(rawDiffDays);

  if (inclusive) {
    totalDays += 1;
  }

  // Count weekdays (Monday through Friday) vs weekends (Saturday and Sunday)
  let businessDays = 0;
  let weekendDays = 0;
  const earlierUtc = Math.min(utcStart, utcEnd);

  for (let i = 0; i < totalDays; i++) {
    const currentDay = new Date(earlierUtc + i * MILLISECONDS_IN_A_DAY);
    const dayOfWeek = currentDay.getUTCDay(); // 0 is Sunday, 6 is Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
  }

  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Approximate years and months
  const years = Math.floor(totalDays / 365.25);
  const months = Math.floor((totalDays % 365.25) / 30.44);

  let explanation = '';
  if (inclusive) {
    explanation = 'Calculated inclusively: both the start date and end date are counted as full days.';
  } else {
    explanation = 'Calculated exclusively: counts elapsed calendar days between the two dates.';
  }

  return ok({
    totalDays,
    totalWeeks,
    remainingDays,
    businessDays,
    weekendDays,
    months,
    years,
    isNegative,
    explanation,
  });
}
