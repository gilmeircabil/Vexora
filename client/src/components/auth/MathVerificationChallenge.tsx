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
  const mul2 = Math.floor(Math.random() * 5) + 2;   // 2 to 6

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
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF7] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Brain className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-black text-black text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Human Brain Check</span>
              <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-yellow-200 border border-black">
                Fun Captcha
              </span>
            </h4>
            <p className="text-[11px] font-bold text-neutral-600">
              Solve these 3 quick 2-digit math problems to verify you are human! 🎯
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          title="Get new math problems"
          className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 cursor-pointer flex items-center gap-1 text-[11px] font-black shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
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
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border-2 transition-all ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-600 shadow-[2px_2px_0px_#059669]'
                  : hasInput
                    ? 'bg-amber-50 border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white border-black shadow-[2px_2px_0px_#000]'
              }`}
            >
              {/* Question label */}
              <div className="flex items-center gap-2 font-mono font-black text-xs sm:text-sm text-black">
                <span className="w-5 h-5 rounded-md bg-neutral-100 border border-black/40 flex items-center justify-center text-[10px] text-neutral-600">
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
                  className={`w-16 px-2 py-1.5 text-center font-mono font-black text-xs sm:text-sm rounded-lg border-2 text-black focus:outline-none transition-all ${
                    isCorrect
                      ? 'bg-emerald-100 border-emerald-700 text-emerald-900'
                      : 'bg-white border-black focus:shadow-[2px_2px_0px_#000]'
                  }`}
                />

                <div className="w-6 flex items-center justify-center">
                  {isCorrect ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-neutral-400 font-mono">--</span>
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
          <div className="p-2.5 rounded-xl bg-[#4ADE80] border-2 border-black text-black font-black text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] animate-in zoom-in-95 duration-150">
            <Award className="w-4 h-4 stroke-[2.5]" />
            <span>3/3 Solved! Human Brain Verified 🧠🎉</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] font-black text-neutral-600 px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Progress: {solvedCount} of 3 solved</span>
            </span>
            <span className="font-mono text-neutral-500">
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
