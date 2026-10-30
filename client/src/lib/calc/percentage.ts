import { Result, ok, err } from '../result.js';

/**
 * Calculates what is X% of Y.
 * Formula: (percent / 100) * total
 */
export function calculatePercentageOf(percent: number, total: number): number {
  if (!Number.isFinite(percent) || !Number.isFinite(total)) return 0;
  return (percent / 100) * total;
}

/**
 * Calculates what percentage X is of Y.
 * Formula: (part / total) * 100
 */
export function calculateWhatPercent(part: number, total: number): Result<number, string> {
  if (!Number.isFinite(part) || !Number.isFinite(total)) {
    return err('Values must be finite numbers.');
  }
  if (total === 0) {
    return err('Cannot divide by zero. Total value must be non-zero.');
  }
  return ok((part / total) * 100);
}

/**
 * Calculates percentage increase or decrease from initial to final value.
 * Formula: ((final - initial) / initial) * 100
 */
export function calculatePercentageChange(
  initialValue: number,
  finalValue: number,
): Result<{ percentChange: number; isIncrease: boolean; absoluteDifference: number }, string> {
  if (!Number.isFinite(initialValue) || !Number.isFinite(finalValue)) {
    return err('Values must be finite numbers.');
  }
  if (initialValue === 0) {
    return err('Cannot compute percentage change from an initial value of zero.');
  }

  const absoluteDifference = finalValue - initialValue;
  const percentChange = (absoluteDifference / Math.abs(initialValue)) * 100;

  return ok({
    percentChange,
    isIncrease: percentChange >= 0,
    absoluteDifference,
  });
}
