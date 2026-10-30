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

/**
 * Calculates calendar differences between two dates strictly using UTC date components
 * to avoid daylight savings time shifts and ambiguous local timezone offsets.
 */
export function calculateDateDifference(
  startDateStr: string,
  endDateStr: string,
  inclusive = false,
): Result<DateDiffResult, string> {
  if (!startDateStr || !endDateStr) {
    return err('Both start and end dates must be provided.');
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return err('Invalid date format provided.');
  }

  // Use UTC calendar midnight for both dates
  const utc1 = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const utc2 = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  let diffDays = Math.round((utc2 - utc1) / msPerDay);
  const isNegative = diffDays < 0;

  if (diffDays < 0) {
    diffDays = Math.abs(diffDays);
  }

  if (inclusive) {
    diffDays += 1;
  }

  // Count business days (Monday to Friday)
  let businessDays = 0;
  let weekendDays = 0;
  const loopStart = new Date(Math.min(utc1, utc2));
  const loopEndDays = inclusive ? diffDays : diffDays;

  for (let i = 0; i < loopEndDays; i++) {
    const cur = new Date(loopStart.getTime() + i * msPerDay);
    const dayOfWeek = cur.getUTCDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
  }

  const totalWeeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;

  // Approximate years and months
  const years = Math.floor(diffDays / 365.25);
  const months = Math.floor((diffDays % 365.25) / 30.44);

  const explanation = inclusive
    ? `Calculated inclusively: both the start date and end date are counted as full days.`
    : `Calculated exclusively: counts elapsed calendar days between the two dates.`;

  return ok({
    totalDays: diffDays,
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
