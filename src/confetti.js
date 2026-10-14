// 紙吹雪（Canvas 2D）
import { $ } from './dom.js';

export function confetti() {
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const colors = ['#7cf5c4', '#ffb86b', '#ecedf0', '#6ea8ff', '#ff7ab6'];
  const pieces = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.7,
    vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 20 - 6,
    size: Math.random() * 8 + 4, rot: Math.random() * 6, vrot: (Math.random() - 0.5) * 0.4,
    color: colors[(Math.random() * colors.length) | 0]
  }));

  const start = performance.now();
  (function step(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.vy += 0.45;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (now - start < 3500) requestAnimationFrame(step);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })(start);
}
