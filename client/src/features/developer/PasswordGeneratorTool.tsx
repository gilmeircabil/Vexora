import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { generatePassword } from '../../lib/dev/password.js';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export const PasswordGeneratorTool: React.FC = () => {
  const [length, setLength] = useState<number>(18);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [password, setPassword] = useState<string>(() => {
    const res = generatePassword({
      length: 18,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false,
    });
    return res.ok ? res.value.password : '';
  });

  const [entropy, setEntropy] = useState<number>(() => {
    const res = generatePassword({
      length: 18,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false,
    });
    return res.ok ? res.value.entropyBits : 0;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = () => {
    setErrorMsg(null);
    const res = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeAmbiguous,
    });

    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    setPassword(res.value.password);
    setEntropy(res.value.entropyBits);
  };

  const getStrengthLabel = (bits: number) => {
    if (bits < 40)
      return { label: 'Weak', color: 'text-rose-600 dark:text-rose-400', bar: 'w-1/4 bg-rose-500' };
    if (bits < 65)
      return {
        label: 'Moderate',
        color: 'text-amber-600 dark:text-amber-400',
        bar: 'w-2/4 bg-amber-500',
      };
    if (bits < 90)
      return {
        label: 'Strong',
        color: 'text-emerald-600 dark:text-emerald-400',
        bar: 'w-3/4 bg-emerald-500',
      };
    return {
      label: 'Very Strong',
      color: 'text-[var(--theme-dirty-white)]',
      bar: 'w-full bg-[var(--theme-dirty-white)]',
    };
  };

  const strength = getStrengthLabel(entropy);

  return (
    <div className="space-y-6">
      {/* Generated Password Box */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-base sm:text-lg tracking-wider break-all border border-neutral-800">
          <span className="select-all">{password || 'Select options below'}</span>
          <div className="flex items-center gap-2 shrink-0">
            <CopyButton value={password} label="Copy" size="md" variant="primary" />
            <Button
              variant="secondary"
              size="md"
              onClick={handleGenerate}
              aria-label="Regenerate password"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Entropy / Strength Meter */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">
              Entropy:{' '}
              <strong className="text-neutral-700 dark:text-neutral-300">{entropy} bits</strong>
            </span>
            <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 rounded-full ${strength.bar}`} />
          </div>
        </div>
      </Card>

      {/* Options Card */}
      <Card className="space-y-6">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            Password Criteria
          </h3>
          <p className="text-xs text-neutral-500">
            Customize length and character sets. Web Crypto API guarantees cryptographic randomness.
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            <span>Password Length</span>
            <span className="font-mono text-[var(--theme-dirty-white)]">
              {length} characters
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setLength(val);
            }}
            className="w-full accent-[var(--theme-dirty-white)]"
          />
          <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
            <span>6 (Minimum)</span>
            <span>18 (Recommended)</span>
            <span>64 (Maximum)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-[var(--theme-dirty-white)]"
            />
            <span>Uppercase Letters (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="rounded accent-[var(--theme-dirty-white)]"
            />
            <span>Lowercase Letters (a-z)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="rounded accent-[var(--theme-dirty-white)]"
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="rounded accent-[var(--theme-dirty-white)]"
            />
            <span>Symbols (!@#$%^&*...)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="rounded accent-[var(--theme-dirty-white)]"
            />
            <span>Exclude Ambiguous Characters (0, O, o, l, 1, I)</span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Retention Notice</span>
          </div>
          <p>
            Generated passwords are created entirely in browser RAM using Web Crypto. They are never
            saved to localStorage, logged, or sent across the network. Make sure to copy your
            password before closing the page.
          </p>
        </div>
      </Card>
    </div>
  );
};
