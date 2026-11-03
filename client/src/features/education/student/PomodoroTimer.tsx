import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Coffee,
  Brain,
  Award,
} from 'lucide-react';
import { educationAudio } from '../shared/EducationAudio.js';
import { educationApi } from '../../../services/educationApi.js';

type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

export const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);

  // Configurable durations in minutes
  const [durations, setDurations] = useState({
    pomodoro: 25,
    short_break: 5,
    long_break: 15,
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('tn_pomodoro_completed');
    return saved ? Number(saved) : 0;
  });
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(() => {
    const saved = localStorage.getItem('tn_pomodoro_minutes');
    return saved ? Number(saved) : 0;
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [subject, setSubject] = useState('Deep Work');

  // Sync timer when mode or duration config changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeftSeconds(durations[mode] * 60);
    }
  }, [mode, durations]);

  // Interval timer tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, durations]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    if (soundEnabled) {
      educationAudio.playChime();
    }

    if (mode === 'pomodoro') {
      const newCount = completedSessions + 1;
      const newMinutes = totalFocusMinutes + durations.pomodoro;
      setCompletedSessions(newCount);
      setTotalFocusMinutes(newMinutes);
      localStorage.setItem('tn_pomodoro_completed', String(newCount));
      localStorage.setItem('tn_pomodoro_minutes', String(newMinutes));

      // Record to backend API
      try {
        await educationApi.recordSession({
          durationMinutes: durations.pomodoro,
          sessionType: 'pomodoro',
          subject: subject || 'General',
        });
      } catch (e) {
        // Safe offline fallback
      }

      // Automatically offer break
      if (newCount % 4 === 0) {
        setMode('long_break');
        setTimeLeftSeconds(durations.long_break * 60);
      } else {
        setMode('short_break');
        setTimeLeftSeconds(durations.short_break * 60);
      }
    } else {
      setMode('pomodoro');
      setTimeLeftSeconds(durations.pomodoro * 60);
    }
  };

  const handleStartPause = () => {
    if (!isRunning && soundEnabled) {
      educationAudio.playBeep();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(durations[mode] * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setMode('short_break');
      setTimeLeftSeconds(durations.short_break * 60);
    } else {
      setMode('pomodoro');
      setTimeLeftSeconds(durations.pomodoro * 60);
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const currentTotal = durations[mode] * 60;
  const progressPercent = Math.round(((currentTotal - timeLeftSeconds) / currentTotal) * 100);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000]">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Pomodoro Focus Timer
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Structured intervals for intense focus and healthy cognitive recovery.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border-2 border-black transition-all ${
            soundEnabled ? 'bg-[#FFD21A]' : 'bg-neutral-100 text-neutral-400'
          }`}
          title={soundEnabled ? 'Sound Alerts On' : 'Sound Alerts Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex p-1.5 bg-[#FAF7F2] rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] text-xs font-black">
        <button
          onClick={() => {
            setIsRunning(false);
            setMode('pomodoro');
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'pomodoro'
              ? 'bg-[#FFD21A] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
              : 'text-neutral-600 hover:text-black border-2 border-transparent'
          }`}
        >
          <Brain className="w-4 h-4" />
          Focus ({durations.pomodoro}m)
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setMode('short_break');
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'short_break'
              ? 'bg-[#4ADE80] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
              : 'text-neutral-600 hover:text-black border-2 border-transparent'
          }`}
        >
          <Coffee className="w-4 h-4" />
          Short Break ({durations.short_break}m)
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setMode('long_break');
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'long_break'
              ? 'bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
              : 'text-neutral-600 hover:text-black border-2 border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Long Break ({durations.long_break}m)
        </button>
      </div>

      {/* Big Display Clock Card */}
      <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000000] text-center space-y-6">
        {/* Subject Input */}
        <div className="inline-block">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What are you working on?"
            className="text-center font-bold text-xs px-3 py-1 bg-[#FAF7F2] border border-black rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
          />
        </div>

        {/* Timer Numbers */}
        <div className="font-mono text-7xl sm:text-8xl font-black text-black tracking-tight select-none">
          {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>

        {/* Circular Progress Bar Indicator */}
        <div className="w-full bg-neutral-100 h-3 rounded-full border-2 border-black overflow-hidden max-w-sm mx-auto">
          <div
            className={`h-full transition-all duration-500 ${
              mode === 'pomodoro'
                ? 'bg-[#FFD21A]'
                : mode === 'short_break'
                  ? 'bg-[#4ADE80]'
                  : 'bg-[#38BDF8]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl border-2 border-black bg-white hover:bg-neutral-100 text-neutral-700 transition-all hover:scale-105"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={handleStartPause}
            className={`py-3.5 px-8 rounded-2xl border-3 border-black text-black font-black text-base flex items-center gap-2 shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 transition-all ${
              isRunning ? 'bg-amber-300' : 'bg-[#FFD21A]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-black" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black" />
                Start Focus
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-3 rounded-2xl border-2 border-black bg-white hover:bg-neutral-100 text-neutral-700 transition-all hover:scale-105"
            title="Skip to Next Phase"
          >
            <SkipForward className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Focus Statistics Footer: Minimal Divided Row */}
      <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] grid grid-cols-2 divide-x-2 divide-black/10">
        <div className="pr-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Sessions Completed
            </span>
            <p className="text-xl font-black mt-0.5">{completedSessions}</p>
          </div>
          <Award className="w-5 h-5 text-amber-500" />
        </div>

        <div className="pl-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Total Focus Time
            </span>
            <p className="text-xl font-black mt-0.5">{totalFocusMinutes} min</p>
          </div>
          <Brain className="w-5 h-5 text-indigo-500" />
        </div>
      </div>
    </div>
  );
};
