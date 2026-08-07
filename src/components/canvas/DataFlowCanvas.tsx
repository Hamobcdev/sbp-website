"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  speed: number;
  color: "teal" | "gold";
  trail: number[];
};

const LANE_COUNT = 5;
const PARTICLES_PER_LANE = 6;
const TRAIL_LENGTH = 5;

const COLORS = {
  teal: "0, 212, 200",
  gold: "245, 166, 35",
};

export default function DataFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationFrame: number;

    const initParticles = () => {
      particles = [];
      for (let lane = 0; lane < LANE_COUNT; lane++) {
        const laneY = ((lane + 0.5) / LANE_COUNT) * height;
        for (let i = 0; i < PARTICLES_PER_LANE; i++) {
          particles.push({
            x: Math.random() * width,
            y: laneY + (Math.random() - 0.5) * 20,
            speed: 1 + Math.random() * 2,
            color: (lane + i) % 2 === 0 ? "teal" : "gold",
            trail: [],
          });
        }
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const step = () => {
      if (document.hidden) {
        animationFrame = requestAnimationFrame(step);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.trail.unshift(p.x);
        if (p.trail.length > TRAIL_LENGTH) p.trail.pop();

        p.x += p.speed;
        if (p.x > width) {
          p.x = 0;
          const lane = Math.floor(Math.random() * LANE_COUNT);
          p.y = ((lane + 0.5) / LANE_COUNT) * height + (Math.random() - 0.5) * 20;
          p.trail = [];
        }

        const rgb = COLORS[p.color];

        p.trail.forEach((tx, i) => {
          const opacity = (1 - i / TRAIL_LENGTH) * 0.3;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
          ctx.arc(tx, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${rgb}, 0.9)`;
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrame = requestAnimationFrame(step);
    };

    resize();
    animationFrame = requestAnimationFrame(step);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] h-full w-full"
      aria-hidden="true"
    />
  );
}
