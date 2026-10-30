const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** Formats a byte count using binary multiples (1 KB = 1024 B). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(decimals)} ${UNITS[unit]}`;
}

/**
 * Percentage change from `before` to `after`, where a negative value means
 * the output is smaller. Returns null when `before` is zero.
 */
export function sizeChangePercent(before: number, after: number): number | null {
  if (before <= 0) return null;
  return ((after - before) / before) * 100;
}

/** Formats a number without trailing zero noise. */
export function formatNumber(value: number, maxFractionDigits = 6): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false,
  }).format(value);
}
