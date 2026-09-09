/** 用 Web Audio 现场合成音效，零资源依赖 */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.18,
) {
  const c = ac();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
}

/** 点一下 */
export function sfxTap() {
  tone(660, 0, 0.08, 'triangle', 0.12);
}

/** 计数 +1 */
export function sfxCount(n = 0) {
  const scale = [523, 587, 659, 698, 784, 880, 988];
  tone(scale[n % scale.length], 0, 0.07, 'square', 0.07);
}

/** 完成一个任务 */
export function sfxDing() {
  tone(880, 0, 0.12, 'sine', 0.16);
  tone(1320, 0.09, 0.18, 'sine', 0.12);
}

/** 答对 */
export function sfxRight() {
  tone(784, 0, 0.1);
  tone(1046, 0.08, 0.16);
}

/** 答错（温柔版） */
export function sfxWrong() {
  tone(300, 0, 0.16, 'sine', 0.1);
  tone(220, 0.12, 0.2, 'sine', 0.08);
}

/** 通关小旋律 */
export function sfxWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, 'sine', 0.16));
}

/** 倒计时提示 */
export function sfxBeep() {
  tone(1000, 0, 0.06, 'square', 0.1);
}
