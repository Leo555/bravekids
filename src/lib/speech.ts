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
