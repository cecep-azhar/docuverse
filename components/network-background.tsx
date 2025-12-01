"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  layer: number;
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

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Set canvas size with device pixel ratio for crisp rendering
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles (multi-layer for subtle parallax)
    const computeCount = () => {
      const area = window.innerWidth * window.innerHeight;
      // Fewer particles overall to look more spaced
      const base = Math.round((area / (1440 * 900)) * 60);
      return Math.max(36, Math.min(base, 100));
    };

    const layers = [
      { speed: 0.15, size: [1.2, 2.0], link: 90 },
      { speed: 0.25, size: [1.5, 2.6], link: 115 },
      { speed: 0.4, size: [1.8, 3.2], link: 135 },
    ];

    const seedParticles = () => {
      const count = computeCount();
      const seeded: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const layer = i % layers.length;
        const [minR, maxR] = layers[layer].size;
        seeded.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * layers[layer].speed,
          vy: (Math.random() - 0.5) * layers[layer].speed,
          r: minR + Math.random() * (maxR - minR),
          layer,
        });
      }
      particlesRef.current = seeded;
    };
    seedParticles();

    // Mouse interactions disabled as requested (no follow / no lines)
    const handleMouseMove = (_e: MouseEvent) => {
      // Intentionally left blank
    };
    // Do not attach the listener to avoid any overhead

    // Theme detection helper
    const getThemeColors = () => {
      // Light blue (Tailwind sky-400: rgb(56, 189, 248))
      // Use ALPHA placeholder to inject dynamic opacity where needed
      return {
        particle: "rgba(56, 189, 248, 0.9)",
        lineBase: "rgba(56, 189, 248, ALPHA)",
        accent: "rgba(56, 189, 248, ALPHA)",
      } as const;
    };

    // Animation loop
    let animationId: number;
    const animate = () => {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      const colors = getThemeColors();
      const particles = particlesRef.current;

      // Global styles
      ctx.lineWidth = 1.2;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // No mouse pull — keep motion independent from cursor

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Mild friction to prevent runaway
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Wrap around edges for continuous flow
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Draw particle with brighter soft glow
        ctx.beginPath();
        ctx.fillStyle = colors.particle;
        ctx.shadowBlur = 12 - p.layer * 2; // stronger glow
        ctx.shadowColor = colors.particle;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections efficiently (avoid double work)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const linkDistance = layers[p1.layer].link;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          // Only connect to particles within ~layer-based range
          const maxDist = Math.min(linkDistance, layers[p2.layer].link);
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const d = Math.hypot(dx, dy);
          if (d > maxDist) continue;

          const t = 1 - d / maxDist; // 0..1
          const alpha = 0.25 * t; // brighter lines
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = colors.lineBase.replace("ALPHA", alpha.toFixed(3));
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }

      // No accent lines to mouse

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      // No mouse listener attached
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
