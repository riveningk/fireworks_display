import React, { useEffect, useRef, useState } from "react";

type Firework = {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
  exploded: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  r: number;
  g: number;
  b: number;
};

const colors = ["#ff0844", "#ffb700", "#00ff88", "#00b8ff", "#ff00ff", "#fff700"];

const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

const FireworksWebsite: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  const createExplosion = (x: number, y: number, color: string) => {
    const particleCount = 80 + Math.floor(Math.random() * 40);
    const newParticles: Particle[] = [];

    const hex = color.replace("#", "");
    const r0 = parseInt(hex.substring(0, 2), 16);
    const g0 = parseInt(hex.substring(2, 4), 16);
    const b0 = parseInt(hex.substring(4, 6), 16);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 6;

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        alpha: 1,
        size: 2 + Math.random() * 2,
        r: clamp255(r0 + (Math.random() - 0.5) * 50),
        g: clamp255(g0 + (Math.random() - 0.5) * 50),
        b: clamp255(b0 + (Math.random() - 0.5) * 50),
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let cancelled = false;

    const scheduleNextFirework = () => {
      const delay = 300 + Math.random() * 500;
      window.setTimeout(() => {
        if (cancelled) return;

        const count = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
          window.setTimeout(() => {
            if (cancelled) return;
            const x = Math.random() * window.innerWidth;
            const y = 150 + Math.random() * 300;
            const color = colors[Math.floor(Math.random() * colors.length)];
            createExplosion(x, y, color);
          }, Math.random() * 200);
        }

        scheduleNextFirework();
      }, delay);
    };

    scheduleNextFirework();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            alpha: p.alpha - 0.01,
            size: p.size * 0.97,
          }))
          .filter((p) => p.alpha > 0)
      );

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [particles]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = colors[Math.floor(Math.random() * colors.length)];
    createExplosion(x, y, color);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      

      <div className="absolute top-0 left-0 w-full p-8 text-center pointer-events-none">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">🎆 HAPPY NEW YEAR ♥ 🎆</h1>


      </div>

      <canvas ref={canvasRef} className="absolute top-0 left-0" onClick={handleClick} />
    </div>
  );
};

export default FireworksWebsite;
