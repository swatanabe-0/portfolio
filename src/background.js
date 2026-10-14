// 背景：カーソルに反応する粒子（Canvas 2D）
import { $, reduceMotion } from './dom.js';

export function initBackground() {
  if (reduceMotion) return;

  const canvas = $('#bg');
  const ctx = canvas.getContext('2d');
  const count = innerWidth < 720 ? 50 : 110;
  const points = [];
  const mouse = { x: -9999, y: -9999 };
  let w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX * dpr;
    mouse.y = e.clientY * dpr;
  });

  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const p of points) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 160 * dpr) { p.vx += (dx / d) * 0.12; p.vy += (dy / d) * 0.12; }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx + (Math.random() - 0.5) * 0.05;
      p.y += p.vy + (Math.random() - 0.5) * 0.05;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }

    ctx.lineWidth = dpr;
    for (let i = 0; i < count; i++) {
      const a = points[i];
      ctx.fillStyle = 'rgba(124,245,196,.55)';
      ctx.fillRect(a.x, a.y, 2 * dpr, 2 * dpr);
      for (let j = i + 1; j < count; j++) {
        const b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120 * dpr) {
          ctx.strokeStyle = `rgba(124,245,196,${0.12 * (1 - d / (120 * dpr))})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}
