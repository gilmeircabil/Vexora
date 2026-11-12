import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import {
  type UnitCategory,
  getUnitsByCategory,
  convertUnits,
  UNITS,
} from '../../lib/calc/units.js';
import { formatNumber } from '../../lib/format.js';
import { ArrowLeftRight } from 'lucide-react';

export const UnitConverterTool: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');

  const availableUnits = getUnitsByCategory(category);

  const [fromUnit, setFromUnit] = useState<string>(availableUnits[0]?.id || 'meter');
  const [toUnit, setToUnit] = useState<string>(availableUnits[1]?.id || 'kilometer');
  const [inputValue, setInputValue] = useState<number>(100);

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const units = getUnitsByCategory(cat);
    if (units.length >= 2) {
      setFromUnit(units[0]!.id);
      setToUnit(units[1]!.id);
    }
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const result = convertUnits(inputValue, fromUnit, toUnit);

  const categories: Array<{ id: UnitCategory; label: string }> = [
    { id: 'length', label: 'Length' },
    { id: 'mass', label: 'Mass & Weight' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'area', label: 'Area' },
    { id: 'volume', label: 'Volume' },
  ];

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleCategoryChange(cat.id)}
            className="shrink-0"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <Card className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* From Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              From
            </label>
            <input
              type="number"
              value={inputValue || ''}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-[var(--theme-dirty-white)]"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
            >
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSwap}
              aria-label="Swap units"
              className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              To
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={result.ok ? formatNumber(result.value) : '—'}
                className="w-full px-3 py-2 text-base font-mono font-bold text-[var(--theme-dirty-white)] bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg"
              />
              {result.ok && <CopyButton value={String(result.value)} label="Copy" size="md" />}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
            >
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula breakdown */}
        {result.ok && (
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-500 text-center">
            {formatNumber(inputValue)} {UNITS[fromUnit]?.symbol} ={' '}
            <strong className="text-neutral-800 dark:text-neutral-200">
              {formatNumber(result.value)} {UNITS[toUnit]?.symbol}
            </strong>
          </div>
        )}
      </Card>
    </div>
  );
};
