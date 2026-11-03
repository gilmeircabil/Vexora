import React from 'react';

export interface SquirrelMascotProps {
  state?: 'idle' | 'crunch' | 'celebrate';
  size?: number | string;
  className?: string;
  onClick?: () => void;
}

export const SquirrelMascot: React.FC<SquirrelMascotProps> = ({
  state = 'idle',
  size = 120,
  className = '',
  onClick,
}) => {
  const isCrunch = state === 'crunch';
  const isCelebrate = state === 'celebrate';

  return (
    <svg
      role="img"
      aria-label="Vexora Squirrel Mascot"
      data-state={state}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      <style>{`
        @keyframes tailWag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes pawTypeSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes pawTypeFast {
          0% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        @keyframes bounceCelebrate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blinkEye {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.6) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
        @keyframes redPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        .squirrel-tail {
          transform-origin: 50px 150px;
          animation: tailWag 3.5s ease-in-out infinite;
        }
        .paw-left-idle {
          transform-origin: 82px 145px;
          animation: pawTypeSlow 1.4s ease-in-out infinite;
        }
        .paw-right-idle {
          transform-origin: 118px 145px;
          animation: pawTypeSlow 1.4s ease-in-out infinite 0.7s;
        }
        .paw-left-crunch {
          transform-origin: 82px 145px;
          animation: pawTypeFast 0.16s ease-in-out infinite;
        }
        .paw-right-crunch {
          transform-origin: 118px 145px;
          animation: pawTypeFast 0.16s ease-in-out infinite 0.08s;
        }
        .body-celebrate {
          animation: bounceCelebrate 0.8s ease-in-out infinite;
        }
        .eye-blink {
          transform-origin: 50% 50%;
          animation: blinkEye 4s infinite;
        }
        .laptop-glare {
          animation: redPulse 0.4s ease-in-out infinite;
        }
        .sparkle {
          transform-origin: center;
          animation: sparkleTwinkle 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .squirrel-tail, .paw-left-idle, .paw-right-idle, .paw-left-crunch, .paw-right-crunch, .body-celebrate, .eye-blink, .laptop-glare, .sparkle {
            animation: none !important;
          }
        }
      `}</style>

      <defs>
        {/* Glow Filters */}
        <radialGradient id="screenRedGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff2a2a" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#ff5533" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff5533" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="screenBlueGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="acornCapGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#452715" />
          <stop offset="100%" stopColor="#2c160a" />
        </linearGradient>
        <linearGradient id="acornBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d562b" />
          <stop offset="100%" stopColor="#5f3517" />
        </linearGradient>
        <linearGradient id="laptopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <g className={isCelebrate ? 'body-celebrate' : ''}>
        {/* Big Fluffy Tail (Behind Body) */}
        <g className="squirrel-tail">
          {/* Main tail curve */}
          <path
            d="M 65 150 C 15 140 10 70 45 45 C 70 28 85 40 80 60 C 76 75 50 85 50 115 C 50 135 60 145 68 152 Z"
            fill="#f7eedf"
            stroke="#261b17"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Tail inner shading */}
          <path
            d="M 48 55 C 32 75 30 110 52 135"
            stroke="#ebd9be"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Squirrel Back Feet */}
        <ellipse cx="68" cy="172" rx="14" ry="9" fill="#f7eedf" stroke="#261b17" strokeWidth="4" />
        <ellipse cx="132" cy="172" rx="14" ry="9" fill="#f7eedf" stroke="#261b17" strokeWidth="4" />
        {/* Foot pads */}
        <circle cx="68" cy="172" r="4" fill="#f4a896" />
        <circle cx="132" cy="172" r="4" fill="#f4a896" />

        {/* Squirrel Body */}
        <ellipse cx="100" cy="140" rx="36" ry="34" fill="#f7eedf" stroke="#261b17" strokeWidth="5" />
        {/* White chest belly patch */}
        <ellipse cx="100" cy="144" rx="22" ry="22" fill="#fffaf2" />

        {/* Ears with Tuft Tips (Key feature from reference image!) */}
        {/* Left Ear */}
        <path
          d="M 72 65 C 68 40 76 25 80 20 C 82 27 88 45 88 62 Z"
          fill="#f7eedf"
          stroke="#261b17"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Left Ear Tuft hairs */}
        <path
          d="M 80 20 L 76 10 M 80 20 L 80 8 M 80 20 L 85 11"
          stroke="#261b17"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Left inner ear */}
        <path d="M 77 48 C 76 38 78 30 80 27 C 82 31 84 40 83 48 Z" fill="#f4a896" />

        {/* Right Ear */}
        <path
          d="M 128 65 C 132 40 124 25 120 20 C 118 27 112 45 112 62 Z"
          fill="#f7eedf"
          stroke="#261b17"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Right Ear Tuft hairs */}
        <path
          d="M 120 20 L 115 11 M 120 20 L 120 8 M 120 20 L 124 10"
          stroke="#261b17"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Right inner ear */}
        <path d="M 123 48 C 124 38 122 30 120 27 C 118 31 116 40 117 48 Z" fill="#f4a896" />

        {/* Squirrel Head */}
        <ellipse cx="100" cy="78" rx="38" ry="32" fill="#f7eedf" stroke="#261b17" strokeWidth="5" />

        {/* Cute Cheek Blushes */}
        <ellipse cx="73" cy="85" rx="7" ry="4" fill="#ffb4a6" opacity="0.8" />
        <ellipse cx="127" cy="85" rx="7" ry="4" fill="#ffb4a6" opacity="0.8" />

        {/* Eyes & Expressions */}
        {isCrunch ? (
          // Intense "fast coding" eyebrows and eyes
          <g>
            {/* Angry / Determined slanted eyebrows */}
            <line x1="70" y1="65" x2="88" y2="72" stroke="#261b17" strokeWidth="4" strokeLinecap="round" />
            <line x1="130" y1="65" x2="112" y2="72" stroke="#261b17" strokeWidth="4" strokeLinecap="round" />
            {/* Focused sharp eyes */}
            <circle cx="80" cy="78" r="6" fill="#261b17" />
            <circle cx="120" cy="78" r="6" fill="#261b17" />
            <circle cx="78" cy="76" r="2" fill="#ffffff" />
            <circle cx="118" cy="76" r="2" fill="#ffffff" />
          </g>
        ) : isCelebrate ? (
          // Joyful smiling eyes (^ ^)
          <g>
            <path d="M 74 79 Q 80 72 86 79" stroke="#261b17" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 114 79 Q 120 72 126 79" stroke="#261b17" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          // Idle big cute eyes with blink animation
          <g className="eye-blink">
            <circle cx="80" cy="77" r="7" fill="#261b17" />
            <circle cx="120" cy="77" r="7" fill="#261b17" />
            {/* Eye glint */}
            <circle cx="78" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="118" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="82" cy="79" r="1.2" fill="#ffffff" />
            <circle cx="122" cy="79" r="1.2" fill="#ffffff" />
          </g>
        )}

        {/* Snout & Mouth */}
        <ellipse cx="100" cy="85" rx="4" ry="2.5" fill="#261b17" />
        {isCelebrate ? (
          // Open happy mouth
          <path d="M 95 89 Q 100 97 105 89 Z" fill="#e11d48" stroke="#261b17" strokeWidth="2.5" />
        ) : (
          // Cute cat-like mouth line
          <path d="M 96 88 Q 100 91 104 88" stroke="#261b17" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Acorn (Resting beside the laptop) */}
        <g id="acorn-prop" transform="translate(142, 126) rotate(12)">
          {/* Acorn stem */}
          <path d="M 13 4 Q 15 -2 20 -4" stroke="#2c160a" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Acorn nut body */}
          <path
            d="M 5 12 Q 13 28 21 12 Q 13 2 5 12 Z"
            fill="url(#acornBodyGrad)"
            stroke="#261b17"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Acorn nut cap */}
          <path
            d="M 3 10 C 3 4 23 4 23 10 C 23 13 3 13 3 10 Z"
            fill="url(#acornCapGrad)"
            stroke="#261b17"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Cap crosshatch texture */}
          <path d="M 7 7 L 11 11 M 15 7 L 19 11 M 11 7 L 7 11 M 19 7 L 15 11" stroke="#5a371c" strokeWidth="1" />
          {/* Nut shine */}
          <path d="M 8 14 Q 10 20 12 22" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>

        {/* Laptop & Typing Area */}
        <g id="laptop-station">
          {/* Screen Glare (when crunching) */}
          {isCrunch && (
            <ellipse
              className="laptop-glare"
              cx="100"
              cy="125"
              rx="40"
              ry="25"
              fill="url(#screenRedGlow)"
            />
          )}

          {/* Normal Screen Ambient Glare (when idle/celebrate) */}
          {!isCrunch && (
            <ellipse
              cx="100"
              cy="132"
              rx="30"
              ry="18"
              fill="url(#screenBlueGlow)"
            />
          )}

          {/* Laptop Base (Keyboard area facing squirrel) */}
          <polygon
            points="62,154 138,154 146,166 54,166"
            fill="url(#laptopGrad)"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Keyboard Grid */}
          <polygon
            points="68,156 132,156 138,164 62,164"
            fill={isCrunch ? '#7f1d1d' : '#0f172a'}
            stroke={isCrunch ? '#ef4444' : '#38bdf8'}
            strokeWidth="1"
            opacity="0.9"
          />
          {/* Key row indicator lines */}
          <line x1="66" y1="159" x2="134" y2="159" stroke={isCrunch ? '#f87171' : '#64748b'} strokeWidth="1" />
          <line x1="64" y1="162" x2="136" y2="162" stroke={isCrunch ? '#f87171' : '#64748b'} strokeWidth="1" />

          {/* Laptop Lid/Screen (Angled upward towards squirrel) */}
          <polygon
            points="70,126 130,126 138,154 62,154"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Glowing screen display */}
          <polygon
            points="73,129 127,129 134,152 66,152"
            fill={isCrunch ? '#991b1b' : '#0284c7'}
            opacity="0.85"
          />
          {/* Screen code lines */}
          <line x1="77" y1="135" x2="105" y2="135" stroke={isCrunch ? '#fca5a5' : '#e0f2fe'} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="82" y1="140" x2="118" y2="140" stroke={isCrunch ? '#fca5a5' : '#bae6fd'} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="77" y1="145" x2="110" y2="145" stroke={isCrunch ? '#fca5a5' : '#7dd3fc'} strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Typing Paws (In front of laptop!) */}
        {isCelebrate ? (
          // Paws raised high in celebration
          <g>
            <ellipse cx="68" cy="118" rx="8" ry="7" fill="#f7eedf" stroke="#261b17" strokeWidth="3.5" />
            <ellipse cx="132" cy="118" rx="8" ry="7" fill="#f7eedf" stroke="#261b17" strokeWidth="3.5" />
            <circle cx="68" cy="118" r="3" fill="#f4a896" />
            <circle cx="132" cy="118" r="3" fill="#f4a896" />
          </g>
        ) : isCrunch ? (
          // Rapid typing paws
          <g>
            <ellipse
              className="paw-left-crunch"
              cx="82"
              cy="150"
              rx="8"
              ry="7"
              fill="#f7eedf"
              stroke="#261b17"
              strokeWidth="3.5"
            />
            <ellipse
              className="paw-right-crunch"
              cx="118"
              cy="150"
              rx="8"
              ry="7"
              fill="#f7eedf"
              stroke="#261b17"
              strokeWidth="3.5"
            />
          </g>
        ) : (
          // Relaxed typing paws
          <g>
            <ellipse
              className="paw-left-idle"
              cx="84"
              cy="151"
              rx="8"
              ry="7"
              fill="#f7eedf"
              stroke="#261b17"
              strokeWidth="3.5"
            />
            <ellipse
              className="paw-right-idle"
              cx="116"
              cy="151"
              rx="8"
              ry="7"
              fill="#f7eedf"
              stroke="#261b17"
              strokeWidth="3.5"
            />
          </g>
        )}

        {/* Celebration Sparkles (Only visible during celebrate state) */}
        {isCelebrate && (
          <g>
            {/* Sparkle 1 (Top Left) */}
            <path
              className="sparkle"
              style={{ animationDelay: '0s' }}
              d="M 40 45 L 43 55 L 53 58 L 43 61 L 40 71 L 37 61 L 27 58 L 37 55 Z"
              fill="#facc15"
            />
            {/* Sparkle 2 (Top Right) */}
            <path
              className="sparkle"
              style={{ animationDelay: '0.4s' }}
              d="M 160 40 L 163 48 L 171 51 L 163 54 L 160 62 L 157 54 L 149 51 L 157 48 Z"
              fill="#facc15"
            />
            {/* Sparkle 3 (Near Acorn) */}
            <path
              className="sparkle"
              style={{ animationDelay: '0.8s' }}
              d="M 172 110 L 174 116 L 180 118 L 174 120 L 172 126 L 170 120 L 164 118 L 170 116 Z"
              fill="#38bdf8"
            />
          </g>
        )}
      </g>
    </svg>
  );
};
