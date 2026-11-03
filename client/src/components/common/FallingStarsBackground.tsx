import React, { useEffect, useRef } from 'react';

export type BackgroundShapeType =
  | 'star'
  | 'wrench'
  | 'gear'
  | 'code'
  | 'cursor'
  | 'document'
  | 'triangle'
  | 'square'
  | 'donut'
  | 'plus'
  | 'diamond'
  | 'pencil'
  | 'scissors';

interface FloatingItem {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  type: BackgroundShapeType;
}

interface ShootingStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  color: string;
  active: boolean;
  delay: number;
  type: BackgroundShapeType;
}

const SHAPE_COLORS = [
  '#FACC15', // Neo-Brutalist Sunshine Yellow
  '#F472B6', // Coral Pink
  '#4ADE80', // Vibrant Lime
  '#A78BFA', // Electric Violet
  '#38BDF8', // Sky Blue
  '#FB923C', // Tangerine Orange
  '#FFFFFF', // Clean White
];

const SHAPE_TYPES: BackgroundShapeType[] = [
  'star',
  'wrench',
  'gear',
  'code',
  'cursor',
  'document',
  'triangle',
  'square',
  'donut',
  'plus',
  'diamond',
  'pencil',
  'scissors',
];

export const FallingStarsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const getRandomType = (): BackgroundShapeType =>
      SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)]!;

    const getRandomColor = (): string =>
      SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)]!;

    // Initialize floating tools and shapes
    const itemCount = Math.min(32, Math.floor(width / 44));
    const floatingItems: FloatingItem[] = Array.from({ length: itemCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 7 + Math.random() * 8, // 7px to 15px
      speedY: 0.25 + Math.random() * 0.55, // gentle drift downwards
      speedX: -0.15 + Math.random() * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.016,
      color: getRandomColor(),
      opacity: 0.35 + Math.random() * 0.35,
      twinkleSpeed: 0.015 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
      type: getRandomType(),
    }));

    // Initialize shooting streaks with tool/shape heads
    const shootingStreaks: ShootingStreak[] = Array.from({ length: 2 }, () => ({
      x: Math.random() * width,
      y: -50,
      length: 50 + Math.random() * 45,
      speed: 5.0 + Math.random() * 3.0,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      opacity: 0,
      color: getRandomColor(),
      active: false,
      delay: Math.floor(Math.random() * 240),
      type: getRandomType(),
    }));

    // Draw individual tool or geometric shape with neo-brutalist styling
    const drawShape = (
      type: BackgroundShapeType,
      cx: number,
      cy: number,
      size: number,
      fillColor: string,
      rotation = 0,
      alpha = 1,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.35;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      switch (type) {
        case 'star': {
          // Neo-Brutalist 4-point pinched star
          const pinch = size * 0.22;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.quadraticCurveTo(0, -pinch, size, 0);
          ctx.quadraticCurveTo(pinch, 0, 0, size);
          ctx.quadraticCurveTo(0, pinch, -size, 0);
          ctx.quadraticCurveTo(-pinch, 0, 0, -size);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'wrench': {
          // Tool: Mechanic / Settings Spanner Wrench
          // Handle
          const hw = size * 0.16;
          ctx.beginPath();
          ctx.rect(-hw, -size * 0.15, hw * 2, size * 0.95);
          ctx.fill();
          ctx.stroke();
          // Head with open jaw
          ctx.beginPath();
          ctx.arc(0, -size * 0.45, size * 0.48, 0.25 * Math.PI, 0.75 * Math.PI, true);
          ctx.lineTo(0, -size * 0.32);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'gear': {
          // Tool: Cogwheel / Settings Gear
          const teeth = 6;
          const rOuter = size * 0.85;
          const rInner = size * 0.62;
          const rHole = size * 0.25;
          ctx.beginPath();
          for (let i = 0; i < teeth * 2; i++) {
            const r = i % 2 === 0 ? rOuter : rInner;
            const a = (i * Math.PI) / teeth;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          // Inner hole
          ctx.moveTo(rHole, 0);
          ctx.arc(0, 0, rHole, 0, Math.PI * 2, true);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'code': {
          // Tool: Code Chevrons < >
          const w = size * 0.7;
          const h = size * 0.6;
          ctx.lineWidth = Math.max(1.8, size * 0.22);
          // Left bracket <
          ctx.beginPath();
          ctx.moveTo(-w * 0.15, -h);
          ctx.lineTo(-w, 0);
          ctx.lineTo(-w * 0.15, h);
          ctx.stroke();
          // Right bracket >
          ctx.beginPath();
          ctx.moveTo(w * 0.15, -h);
          ctx.lineTo(w, 0);
          ctx.lineTo(w * 0.15, h);
          ctx.stroke();
          break;
        }

        case 'cursor': {
          // Tool: Vector Arrow Cursor
          ctx.beginPath();
          ctx.moveTo(0, -size * 0.85);
          ctx.lineTo(size * 0.65, size * 0.45);
          ctx.lineTo(size * 0.15, size * 0.3);
          ctx.lineTo(size * 0.35, size * 0.85);
          ctx.lineTo(size * 0.08, size * 0.9);
          ctx.lineTo(-size * 0.12, size * 0.4);
          ctx.lineTo(-size * 0.5, size * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'document': {
          // Tool: Document Sheet with Folded Corner
          const dw = size * 0.6;
          const dh = size * 0.8;
          const fold = size * 0.32;
          ctx.beginPath();
          ctx.moveTo(-dw, -dh);
          ctx.lineTo(dw - fold, -dh);
          ctx.lineTo(dw, -dh + fold);
          ctx.lineTo(dw, dh);
          ctx.lineTo(-dw, dh);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Fold triangle
          ctx.beginPath();
          ctx.moveTo(dw - fold, -dh);
          ctx.lineTo(dw - fold, -dh + fold);
          ctx.lineTo(dw, -dh + fold);
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'pencil': {
          // Tool: Drafting Pencil
          const pw = size * 0.24;
          const ph = size * 0.8;
          ctx.beginPath();
          ctx.moveTo(-pw, -ph * 0.6);
          ctx.lineTo(pw, -ph * 0.6);
          ctx.lineTo(pw, ph * 0.35);
          ctx.lineTo(0, ph * 0.85); // Tip
          ctx.lineTo(-pw, ph * 0.35);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'scissors': {
          // Tool: Crossed Scissors
          ctx.lineWidth = Math.max(1.8, size * 0.18);
          ctx.beginPath();
          ctx.moveTo(-size * 0.45, size * 0.65);
          ctx.lineTo(size * 0.4, -size * 0.65);
          ctx.moveTo(size * 0.45, size * 0.65);
          ctx.lineTo(-size * 0.4, -size * 0.65);
          ctx.stroke();
          // Finger rings
          ctx.beginPath();
          ctx.arc(-size * 0.42, size * 0.65, size * 0.22, 0, Math.PI * 2);
          ctx.arc(size * 0.42, size * 0.65, size * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'triangle': {
          // Shape: Delta / Equilateral Triangle
          const th = size * 0.85;
          const tw = size * 0.75;
          ctx.beginPath();
          ctx.moveTo(0, -th);
          ctx.lineTo(tw, th * 0.7);
          ctx.lineTo(-tw, th * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'square': {
          // Shape: Square with Neo-Brutalist Offset Drop Shadow
          const sq = size * 0.65;
          ctx.fillStyle = '#000000';
          ctx.fillRect(-sq + 2.2, -sq + 2.2, sq * 2, sq * 2);
          ctx.fillStyle = fillColor;
          ctx.fillRect(-sq, -sq, sq * 2, sq * 2);
          ctx.strokeRect(-sq, -sq, sq * 2, sq * 2);
          break;
        }

        case 'donut': {
          // Shape: Bold Donut / Circle Ring
          const rOut = size * 0.75;
          const rIn = size * 0.35;
          ctx.beginPath();
          ctx.arc(0, 0, rOut, 0, Math.PI * 2, false);
          ctx.arc(0, 0, rIn, 0, Math.PI * 2, true);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'plus': {
          // Shape: Cross / Plus Sign +
          const arm = size * 0.8;
          const thk = size * 0.26;
          ctx.beginPath();
          ctx.moveTo(-thk, -arm);
          ctx.lineTo(thk, -arm);
          ctx.lineTo(thk, -thk);
          ctx.lineTo(arm, -thk);
          ctx.lineTo(arm, thk);
          ctx.lineTo(thk, thk);
          ctx.lineTo(thk, arm);
          ctx.lineTo(-thk, arm);
          ctx.lineTo(-thk, thk);
          ctx.lineTo(-arm, thk);
          ctx.lineTo(-arm, -thk);
          ctx.lineTo(-thk, -thk);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'diamond': {
          // Shape: Rhombus / Diamond
          const dw = size * 0.7;
          const dh = size * 0.9;
          ctx.beginPath();
          ctx.moveTo(0, -dh);
          ctx.lineTo(dw, 0);
          ctx.lineTo(0, dh);
          ctx.lineTo(-dw, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        default:
          break;
      }

      ctx.restore();
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Floating Tools and Shapes
      for (const item of floatingItems) {
        if (!prefersReducedMotion) {
          item.y += item.speedY;
          item.x += item.speedX;
          item.rotation += item.rotSpeed;
          item.twinklePhase += item.twinkleSpeed;

          // Wrap around screen boundaries and refresh type/color
          if (item.y > height + 25) {
            item.y = -25;
            item.x = Math.random() * width;
            item.type = getRandomType();
            item.color = getRandomColor();
          }
          if (item.x < -25) item.x = width + 25;
          if (item.x > width + 25) item.x = -25;
        }

        const currentOpacity = item.opacity * (0.8 + Math.sin(item.twinklePhase) * 0.2);
        drawShape(item.type, item.x, item.y, item.size, item.color, item.rotation, currentOpacity);
      }

      // 2. Render Falling Streak Shooters
      if (!prefersReducedMotion) {
        for (const ss of shootingStreaks) {
          if (!ss.active) {
            ss.delay--;
            if (ss.delay <= 0) {
              ss.active = true;
              ss.x = Math.random() * (width * 0.9);
              ss.y = -40;
              ss.opacity = 0.65;
              ss.color = getRandomColor();
              ss.type = getRandomType();
              ss.speed = 5.0 + Math.random() * 3.0;
              ss.length = 50 + Math.random() * 45;
            }
            continue;
          }

          // Move along diagonal angle
          const vx = Math.cos(ss.angle) * ss.speed;
          const vy = Math.sin(ss.angle) * ss.speed;
          ss.x += vx;
          ss.y += vy;

          // Draw streak trail
          ctx.save();
          ctx.translate(ss.x, ss.y);
          ctx.rotate(ss.angle);
          ctx.globalAlpha = ss.opacity;

          const grad = ctx.createLinearGradient(-ss.length, 0, 0, 0);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(0.7, ss.color);
          grad.addColorStop(1, '#000000');

          ctx.beginPath();
          ctx.moveTo(-ss.length, 0);
          ctx.lineTo(0, 0);
          ctx.lineWidth = 2.4;
          ctx.strokeStyle = grad;
          ctx.stroke();

          ctx.restore();

          // Head shape
          drawShape(ss.type, ss.x, ss.y, 8, ss.color, ss.angle, ss.opacity);

          // Reset when out of view
          if (ss.y > height + 60 || ss.x > width + 60) {
            ss.active = false;
            ss.delay = 180 + Math.floor(Math.random() * 300);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};

export const FloatingToolsBackground = FallingStarsBackground;
