/** 撒花 / 飞星星：直接操作 DOM，任何地方都能调用 */

const COLORS = ['#ff8c42', '#ffd166', '#06d6a0', '#4cc9f0', '#f72585', '#b5179e'];

export function confettiBurst(count = 36) {
  if (typeof document === 'undefined') return;
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = COLORS[i % COLORS.length];
    p.style.animationDelay = `${Math.random() * 0.35}s`;
    p.style.animationDuration = `${1.1 + Math.random() * 0.9}s`;
    p.style.transform = `rotate(${Math.random() * 180}deg)`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  window.setTimeout(() => box.remove(), 2600);
}

export function flyStar(x: number, y: number, emoji = '⭐') {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.className = 'pop-star';
  el.textContent = emoji;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 1000);
}

export function flyStarFromEvent(e: { clientX: number; clientY: number }, emoji = '⭐') {
  flyStar(e.clientX, e.clientY - 10, emoji);
}
