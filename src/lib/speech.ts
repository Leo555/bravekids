/** 朗读：优先使用系统 TTS（iPad / Mac 中英文效果都不错） */

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (!canSpeak()) return;
  voices = window.speechSynthesis.getVoices();
}

if (canSpeak()) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pick(lang: string): SpeechSynthesisVoice | undefined {
  if (!voices.length) loadVoices();
  const want = lang.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === want) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(want.slice(0, 2)))
  );
}

export interface SpeakOptions {
  lang?: 'zh-CN' | 'en-US';
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!canSpeak()) return;
  const { lang = 'zh-CN', rate = lang === 'zh-CN' ? 0.85 : 0.8, pitch = 1.05 } = opts;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = pitch;
  const v = pick(lang);
  if (v) u.voice = v;
  if (opts.onEnd) u.onend = opts.onEnd;
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/* ------------------------- 打卡表扬语 ------------------------- */

/** 普通打卡：随机一句，核心都是「你真棒」 */
const PRAISE = [
  '你真棒',
  '哇，你真棒',
  '你真棒，继续加油',
  '太厉害啦，你真棒',
  '你真棒，坚持得真好',
];

/** 今天全部完成 / 大目标达成时的加强版 */
const PRAISE_BIG = [
  '你真棒，今天全部完成啦',
  '你真棒，今天太厉害了',
  '你真棒，给你一百分',
];

let lastPraiseAt = 0;

/**
 * 打卡完成后夸一句「你真棒」。
 * @param name 可选，孩子的小名，会念成「优优，你真棒！」
 * @param big  是否用加强版（全部完成时）
 */
export function praise(name?: string, big = false) {
  if (!canSpeak()) return;
  const now = Date.now();
  // 连续快速打卡时不要叠着念
  if (now - lastPraiseAt < 1500) return;
  lastPraiseAt = now;
  const pool = big ? PRAISE_BIG : PRAISE;
  const text = pool[Math.floor(Math.random() * pool.length)];
  speak(name ? `${name}，${text}！` : `${text}！`, { rate: 0.95, pitch: 1.3 });
}
