import React, { useEffect, useRef } from 'react';

interface FloatingStar {
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
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  color: string;
  active: boolean;
  delay: number;
}

const STAR_COLORS = [
  '#FACC15', // Neo-Brutalist Sunshine Yellow
  '#F472B6', // Coral Pink
  '#4ADE80', // Vibrant Lime
  '#A78BFA', // Electric Violet
  '#38BDF8', // Sky Blue
  '#FFFFFF', // White
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Initialize floating falling stars
    const starCount = Math.min(35, Math.floor(width / 38));
    const floatingStars: FloatingStar[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 5 + Math.random() * 8, // 5px to 13px
      speedY: 0.35 + Math.random() * 0.75, // gentle drift downwards
      speedX: -0.15 + Math.random() * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
      opacity: 0.45 + Math.random() * 0.45,
      twinkleSpeed: 0.015 + Math.random() * 0.025,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Initialize shooting / falling streak stars
    const shootingStars: ShootingStar[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: -50,
      length: 60 + Math.random() * 60,
      speed: 6 + Math.random() * 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 degree angle
      opacity: 0,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
      active: false,
      delay: Math.floor(Math.random() * 240), // Staggered entry
    }));

    // Helper: Draw Neo-Brutalist 4-point star
    const drawFourPointStar = (
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
      ctx.globalAlpha = alpha;

      const pinch = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, -pinch, size, 0);
      ctx.quadraticCurveTo(pinch, 0, 0, size);
      ctx.quadraticCurveTo(0, pinch, -size, 0);
      ctx.quadraticCurveTo(-pinch, 0, 0, -size);
      ctx.closePath();

      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.restore();
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Floating Falling Stars
      for (const s of floatingStars) {
        if (!prefersReducedMotion) {
          s.y += s.speedY;
          s.x += s.speedX;
          s.rotation += s.rotSpeed;
          s.twinklePhase += s.twinkleSpeed;

          // Wrap around screen boundaries
          if (s.y > height + 20) {
            s.y = -20;
            s.x = Math.random() * width;
          }
          if (s.x < -20) s.x = width + 20;
          if (s.x > width + 20) s.x = -20;
        }

        const currentOpacity = s.opacity * (0.75 + Math.sin(s.twinklePhase) * 0.25);
        drawFourPointStar(s.x, s.y, s.size, s.color, s.rotation, currentOpacity);
      }

      // 2. Render Falling Streak Shooting Stars
      if (!prefersReducedMotion) {
        for (const ss of shootingStars) {
          if (!ss.active) {
            ss.delay--;
            if (ss.delay <= 0) {
              ss.active = true;
              ss.x = Math.random() * (width * 0.9);
              ss.y = -40;
              ss.opacity = 0.85;
              ss.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!;
              ss.speed = 6 + Math.random() * 4;
              ss.length = 60 + Math.random() * 60;
            }
            continue;
          }

          // Move along diagonal angle
          const vx = Math.cos(ss.angle) * ss.speed;
          const vy = Math.sin(ss.angle) * ss.speed;
          ss.x += vx;
          ss.y += vy;

          // Draw trail
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

          // Star head
          drawFourPointStar(ss.x, ss.y, 8, ss.color, ss.angle, ss.opacity);

          // Reset when out of view
          if (ss.y > height + 60 || ss.x > width + 60) {
            ss.active = false;
            ss.delay = 180 + Math.floor(Math.random() * 300); // 3-8 seconds delay
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
