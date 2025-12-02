"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  layer: number;
  z: number; // depth for starfield (closer = brighter & faster)
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // DPR-aware sizing
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Colors - light blue palette
    const BLUE = "56, 189, 248"; // Tailwind sky-400
    const colors = {
      particle: `rgba(${BLUE}, 1.0)`,
      line: (a: number) => `rgba(${BLUE}, ${a})`,
      accent: (a: number) => `rgba(${BLUE}, ${a})`,
      trail: (a: number) => `rgba(${BLUE}, ${a})`,
    } as const;

    // Layout & dynamics
    const layers = [
      { speed: 0.15, size: [1.0, 1.8], link: 70 },
      { speed: 0.25, size: [1.3, 2.2], link: 85 },
      { speed: 0.4, size: [1.6, 2.8], link: 100 },
    ] as const;

    const computeCount = () => {
      const area = window.innerWidth * window.innerHeight;
      const base = Math.round((area / (1440 * 900)) * 60);
      return Math.max(36, Math.min(base, 100));
    };

    const seedParticles = () => {
      const count = computeCount();
      const seeded: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const layer = i % layers.length;
        const [minR, maxR] = layers[layer].size;
        const z = 0.2 + Math.random() * 0.8; // 0.2..1.0 depth (1.0 = near)
        seeded.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * layers[layer].speed,
          vy: (Math.random() - 0.5) * layers[layer].speed,
          r: minR + Math.random() * (maxR - minR),
          layer,
          z,
        });
      }
      particlesRef.current = seeded;
    };
    seedParticles();

    // Track mouse (for lines only; no motion influence)
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animate
    let animationId = 0;
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      ctx.lineWidth = 1.2;

      // Update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Starfield: stars move slightly outward towards center perspective
        const cx = w * 0.5;
        const cy = h * 0.5;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const speedScale = 0.6 + p.z * 1.2; // closer stars move faster
        p.x += (dx * 0.002 * speedScale) + p.vx;
        p.y += (dy * 0.002 * speedScale) + p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.z += 0.004; // approach viewer
        if (p.z > 1.2) p.z = 0.2; // recycle depth to keep new stars coming

        // Wrap edges
        if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
          // Respawn near center with random outward direction to emulate new stars
          p.x = cx + (Math.random() - 0.5) * 60;
          p.y = cy + (Math.random() - 0.5) * 60;
          p.vx = (Math.random() - 0.5) * layers[p.layer].speed;
          p.vy = (Math.random() - 0.5) * layers[p.layer].speed;
          p.z = 0.2 + Math.random() * 0.4;
        }

        // Particle with glow
        ctx.beginPath();
        const bright = Math.min(1, 0.6 + p.z * 0.6);
        ctx.fillStyle = `rgba(${BLUE}, ${bright})`;
        ctx.shadowBlur = 14 - p.layer * 2 + p.z * 4;
        ctx.shadowColor = `rgba(${BLUE}, ${bright})`;
        const radius = p.r * (0.8 + p.z * 0.8);
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Motion trail to enhance “approach” feel
        const trailLen = 6 + Math.floor(p.z * 10);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - dx * 0.01 * trailLen, p.y - dy * 0.01 * trailLen);
        ctx.strokeStyle = colors.trail(0.35);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Remove inter-particle links to emphasize starfield aesthetic

      // Lines to mouse for nearby particles
      if (!prefersReducedMotion) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const d = Math.hypot(dx, dy);
          const max = 180 + p.layer * 30;
          if (d < max) {
            const alpha = 0.85 * (1 - d / max);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = colors.accent(alpha);
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
        ctx.lineWidth = 1.2;
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none opacity-60"
    />
  );
}
