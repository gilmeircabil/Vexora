import React, { useState, useEffect } from 'react';
import { Check, RefreshCw, Sparkles, Brain, Award } from 'lucide-react';

export interface MathProblem {
  id: number;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  answer: number;
}

interface MathVerificationChallengeProps {
  onVerified: (verified: boolean) => void;
}

function generateProblems(): MathProblem[] {
  // Problem 1: 2-digit Addition (e.g. 24 + 17)
  const add1 = Math.floor(Math.random() * 38) + 12; // 12 to 49
  const add2 = Math.floor(Math.random() * 38) + 11; // 11 to 48

  // Problem 2: 2-digit Subtraction (e.g. 68 - 25)
  const sub1 = Math.floor(Math.random() * 50) + 40; // 40 to 89
  const sub2 = Math.floor(Math.random() * (sub1 - 20)) + 11; // 11 to sub1-10

  // Problem 3: 2-digit easy Multiplication (e.g. 12 × 4, 15 × 3)
  const mul1 = Math.floor(Math.random() * 12) + 11; // 11 to 22
  const mul2 = Math.floor(Math.random() * 5) + 2; // 2 to 6

  const rawList: MathProblem[] = [
    { id: 1, num1: add1, num2: add2, operator: '+', answer: add1 + add2 },
    { id: 2, num1: sub1, num2: sub2, operator: '-', answer: sub1 - sub2 },
    { id: 3, num1: mul1, num2: mul2, operator: '×', answer: mul1 * mul2 },
  ];

  // Shuffle order of the 3 problems
  return rawList.sort(() => Math.random() - 0.5);
}

export const MathVerificationChallenge: React.FC<MathVerificationChallengeProps> = ({
  onVerified,
}) => {
  const [problems, setProblems] = useState<MathProblem[]>(() => generateProblems());
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
  });

  const checkAnswer = (p: MathProblem): boolean => {
    const val = userAnswers[p.id]?.trim();
    if (!val) return false;
    return parseInt(val, 10) === p.answer;
  };

  const solvedCount = problems.filter(checkAnswer).length;
  const isFullySolved = solvedCount === 3;

  useEffect(() => {
    onVerified(isFullySolved);
  }, [isFullySolved, onVerified]);

  const handleInputChange = (id: number, val: string) => {
    // Only allow digits and minus
    const clean = val.replace(/[^0-9-]/g, '');
    setUserAnswers((prev) => ({ ...prev, [id]: clean }));
  };

  const handleRefresh = () => {
    const newProbs = generateProblems();
    setProblems(newProbs);
    setUserAnswers({ 1: '', 2: '', 3: '' });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] shadow-sm space-y-4 text-[var(--theme-dirty-white)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--theme-gray-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-dirty-white)] shadow-sm">
            <Brain className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h4 className="font-bold text-[var(--theme-dirty-white)] text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Human Verification Check</span>
              <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)]">
                Security
              </span>
            </h4>
            <p className="text-[11px] font-normal text-[var(--theme-gray-muted)]">
              Solve these 3 quick math problems to verify you are human.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          title="Get new math problems"
          className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] active:translate-y-0.5 cursor-pointer flex items-center gap-1 text-[11px] font-medium shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2]" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* 3 Math Problems */}
      <div className="space-y-2.5">
        {problems.map((p, idx) => {
          const isCorrect = checkAnswer(p);
          const hasInput = (userAnswers[p.id]?.trim()?.length ?? 0) > 0;

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-600/60'
                  : hasInput
                    ? 'bg-[var(--theme-surface-raised)] border-[var(--theme-gray-border)]'
                    : 'bg-[var(--theme-surface-raised)]/50 border-[var(--theme-gray-border)]'
              }`}
            >
              {/* Question label */}
              <div className="flex items-center gap-2 font-mono font-semibold text-xs sm:text-sm text-[var(--theme-dirty-white)]">
                <span className="w-5 h-5 rounded-md bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[10px] text-[var(--theme-gray-muted)]">
                  #{idx + 1}
                </span>
                <span className="tracking-wide">
                  {p.num1} {p.operator} {p.num2} =
                </span>
              </div>

              {/* Input field + Indicator */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={userAnswers[p.id] || ''}
                  onChange={(e) => handleInputChange(p.id, e.target.value)}
                  placeholder="?"
                  maxLength={4}
                  className={`w-16 px-2 py-1.5 text-center font-mono font-bold text-xs sm:text-sm rounded-lg border focus:outline-none transition-all ${
                    isCorrect
                      ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                      : 'bg-[var(--theme-canvas)] border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-[var(--theme-dirty-white)]'
                  }`}
                />

                <div className="w-6 flex items-center justify-center">
                  {isCorrect ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border border-emerald-400 flex items-center justify-center text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-[var(--theme-gray-muted)] font-mono">--</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress & Human Verified Celebration */}
      <div className="pt-1">
        {isFullySolved ? (
          <div className="p-2.5 rounded-xl bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-bold text-xs flex items-center justify-center gap-2 shadow-sm animate-in zoom-in-95 duration-150">
            <Award className="w-4 h-4 stroke-[2]" />
            <span>3/3 Solved! Human Verification Confirmed</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--theme-gray-muted)] px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
              <span>Progress: {solvedCount} of 3 solved</span>
            </span>
            <span className="font-mono text-slate-500">
              {solvedCount === 0 && 'Answer all 3 to proceed'}
              {solvedCount === 1 && '2 more to go!'}
              {solvedCount === 2 && 'Almost there! 1 left!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
