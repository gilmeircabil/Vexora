import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import {
  calculatePercentageOf,
  calculateWhatPercent,
  calculatePercentageChange,
} from '../../lib/calc/percentage.js';
import { formatNumber } from '../../lib/format.js';

export const PercentageCalculatorTool: React.FC = () => {
  // Calculator 1: What is X% of Y?
  const [c1Percent, setC1Percent] = useState<number>(15);
  const [c1Total, setC1Total] = useState<number>(200);
  const c1Result = calculatePercentageOf(c1Percent, c1Total);

  // Calculator 2: X is what % of Y?
  const [c2Part, setC2Part] = useState<number>(30);
  const [c2Total, setC2Total] = useState<number>(120);
  const c2Result = calculateWhatPercent(c2Part, c2Total);

  // Calculator 3: Percentage change from X to Y
  const [c3Initial, setC3Initial] = useState<number>(50);
  const [c3Final, setC3Final] = useState<number>(75);
  const c3Result = calculatePercentageChange(c3Initial, c3Final);

  return (
    <div className="space-y-6">
      {/* Tool 1 */}
      <Card className="space-y-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            1. Find Percentage of a Value
          </h3>
          <p className="text-xs text-neutral-500">
            Calculate what is <span className="font-semibold">X%</span> of{' '}
            <span className="font-semibold">Y</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">What is</span>
          <input
            type="number"
            value={c1Percent || ''}
            onChange={(e) => setC1Percent(parseFloat(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">% of</span>
          <input
            type="number"
            value={c1Total || ''}
            onChange={(e) => setC1Total(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center"
          />
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">=</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono text-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] px-3 py-1 rounded-lg border border-[var(--theme-gray-border)]">
              {formatNumber(c1Result)}
            </span>
            <CopyButton value={String(c1Result)} label="Copy" size="sm" />
          </div>
        </div>
      </Card>

      {/* Tool 2 */}
      <Card className="space-y-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            2. Percentage Ratio
          </h3>
          <p className="text-xs text-neutral-500">
            Find what percentage <span className="font-semibold">X</span> is of{' '}
            <span className="font-semibold">Y</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="number"
            value={c2Part || ''}
            onChange={(e) => setC2Part(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">is what % of</span>
          <input
            type="number"
            value={c2Total || ''}
            onChange={(e) => setC2Total(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center"
          />
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">=</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono text-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] px-3 py-1 rounded-lg border border-[var(--theme-gray-border)]">
              {c2Result.ok ? `${formatNumber(c2Result.value)}%` : 'Error'}
            </span>
            {c2Result.ok && <CopyButton value={`${c2Result.value}%`} label="Copy" size="sm" />}
          </div>
        </div>

        {!c2Result.ok && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{c2Result.error}</p>
        )}
      </Card>

      {/* Tool 3 */}
      <Card className="space-y-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            3. Percentage Increase / Decrease
          </h3>
          <p className="text-xs text-neutral-500">
            Find the percentage change from initial value <span className="font-semibold">X</span>{' '}
            to final value <span className="font-semibold">Y</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">From</span>
          <input
            type="number"
            value={c3Initial || ''}
            onChange={(e) => setC3Initial(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">to</span>
          <input
            type="number"
            value={c3Final || ''}
            onChange={(e) => setC3Final(parseFloat(e.target.value) || 0)}
            className="w-28 px-3 py-1.5 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center"
          />
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">=</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold font-mono px-3 py-1 rounded-lg border ${
                c3Result.ok && c3Result.value.isIncrease
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900'
              }`}
            >
              {c3Result.ok
                ? `${c3Result.value.percentChange > 0 ? '+' : ''}${formatNumber(c3Result.value.percentChange)}%`
                : 'Error'}
            </span>
            {c3Result.ok && (
              <CopyButton value={`${c3Result.value.percentChange}%`} label="Copy" size="sm" />
            )}
          </div>
        </div>

        {c3Result.ok ? (
          <p className="text-xs text-neutral-500">
            {c3Result.value.isIncrease ? 'Increase' : 'Decrease'} of{' '}
            <strong className="text-neutral-800 dark:text-neutral-200">
              {formatNumber(Math.abs(c3Result.value.absoluteDifference))}
            </strong>{' '}
            in absolute value.
          </p>
        ) : (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{c3Result.error}</p>
        )}
      </Card>
    </div>
  );
};
