import type { DailyTask, Kid, KidState, LongGoal } from '../types';
import { addDays, today, weekKey } from './date';

export interface Stats {
  stars: number;
  /** 连续打卡天数（当天至少完成 1 项即算） */
  streak: number;
  /** 累计打卡天数 */
  checkinDays: number;
  /** 全部每日任务完成的天数 */
  perfectDays: number;
  /** 跳绳累计个数 */
  ropeTotal: number;
  bestJumpMinute: number;
  /** 家务累计次数 */
  choreTotal: number;
  learned: { words: number; hanzi: number; poems: number; math: number; pinyin: number };
}

/**
 * 判定一个每日任务是否「完成」，与 Home 页展示口径保持一致。
 * - counter / timer / simple：看 done 标记
 * - study：看进度值是否达到 dailyGoal
 * - 认汉字(hanzi)任务例外：需要「认了新字(value>=1)」+「挑战全对(done)」两项都满足
 */
export function isDailyDone(
  task: DailyTask,
  rec: { done?: boolean; value?: number } | undefined,
): boolean {
  if (task.kind !== 'study') return !!rec?.done;
  if (task.route === 'hanzi') {
    return (rec?.value ?? 0) >= 1 && !!rec?.done;
  }
  return (rec?.value ?? 0) >= (task.dailyGoal ?? 1);
}

function dayDoneCount(kid: Kid, st: KidState, date: string): number {
  const rec = st.daily[date];
  if (!rec) return 0;
  return kid.daily.filter((t) => isDailyDone(t, rec[t.id])).length;
}

export function starsOf(kid: Kid, st: KidState): number {
  let s = 0;
  const dailyMap = new Map(kid.daily.map((t) => [t.id, t.stars]));
  Object.values(st.daily).forEach((day) => {
    Object.entries(day).forEach(([tid, rec]) => {
      const task = kid.daily.find((t) => t.id === tid);
      if (task && isDailyDone(task, rec)) s += dailyMap.get(tid) ?? 1;
    });
  });
  const weeklyMap = new Map(kid.weekly.map((t) => [t.id, t.stars]));
  Object.values(st.weekly).forEach((week) => {
    Object.entries(week).forEach(([tid, n]) => {
      s += (weeklyMap.get(tid) ?? 1) * n;
    });
  });
  s +=
    st.learnedWords.length +
    st.learnedHanzi.length +
    st.learnedPinyin.length +
    st.mathMastered.length +
    st.learnedPoems.length * 3;
  return s;
}

export function statsOf(kid: Kid, st: KidState): Stats {
  const dates = Object.keys(st.daily).sort();
  let checkinDays = 0;
  let perfectDays = 0;
  let ropeTotal = 0;
  dates.forEach((d) => {
    const n = dayDoneCount(kid, st, d);
    if (n > 0) checkinDays += 1;
    if (n === kid.daily.length) perfectDays += 1;
    const day = st.daily[d];
    Object.entries(day).forEach(([tid, rec]) => {
      if (tid.startsWith('rope')) ropeTotal += rec.value || 0;
    });
  });

  // 连续天数：从今天（或昨天）往前推
  let streak = 0;
  let cursor = today();
  if (dayDoneCount(kid, st, cursor) === 0) cursor = addDays(cursor, -1);
  while (dayDoneCount(kid, st, cursor) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  let choreTotal = 0;
  Object.values(st.weekly).forEach((w) => {
    choreTotal += w.chore || 0;
  });

  return {
    stars: starsOf(kid, st),
    streak,
    checkinDays,
    perfectDays,
    ropeTotal,
    bestJumpMinute: st.bestJumpMinute,
    choreTotal,
    learned: {
      words: st.learnedWords.length,
      hanzi: st.learnedHanzi.length,
      poems: st.learnedPoems.length,
      math: st.mathMastered.length,
      pinyin: st.learnedPinyin.length,
    },
  };
}

export function goalDone(st: KidState, goal: LongGoal): number {
  switch (goal.kind) {
    case 'words':
      return st.learnedWords.length;
    case 'hanzi':
      return st.learnedHanzi.length;
    case 'poems':
      return st.learnedPoems.length;
    case 'math':
      return st.mathMastered.length;
    case 'pinyin':
      return st.learnedPinyin.length;
    default:
      return 0;
  }
}

export interface Level {
  index: number;
  name: string;
  emoji: string;
  min: number;
  max: number;
}

const LEVELS: Omit<Level, 'index'>[] = [
  { name: '小树苗', emoji: '🌱', min: 0, max: 30 },
  { name: '小树', emoji: '🌿', min: 30, max: 90 },
  { name: '大树', emoji: '🌳', min: 90, max: 200 },
  { name: '小森林', emoji: '🏞️', min: 200, max: 400 },
  { name: '大山峰', emoji: '⛰️', min: 400, max: 700 },
  { name: '闪耀星球', emoji: '🌟', min: 700, max: Number.MAX_SAFE_INTEGER },
];

export function levelOf(stars: number): Level {
  const i = LEVELS.findIndex((l) => stars >= l.min && stars < l.max);
  const idx = i < 0 ? LEVELS.length - 1 : i;
  return { index: idx, ...LEVELS[idx] };
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  got: boolean;
  /** 0~1 */
  progress: number;
}

export function badgesOf(kid: Kid, st: KidState): Badge[] {
  const s = statsOf(kid, st);
  const mk = (
    id: string,
    name: string,
    emoji: string,
    desc: string,
    cur: number,
    need: number,
  ): Badge => ({
    id,
    name,
    emoji,
    desc,
    got: cur >= need,
    progress: Math.min(1, need === 0 ? 0 : cur / need),
  });

  const poemTarget = kid.goals.find((g) => g.kind === 'poems')?.target ?? 10;

  const list: Badge[] = [
    mk('start', '出发啦', '🎬', '完成第一次打卡', s.checkinDays, 1),
    mk('fire3', '三天不断', '🔥', '连续打卡 3 天', s.streak, 3),
    mk('week7', '一周全勤', '🏅', '连续打卡 7 天', s.streak, 7),
    mk('day21', '21 天习惯', '🎖️', '连续打卡 21 天', s.streak, 21),
    mk('perfect5', '完美 5 天', '⭐', '5 天全部任务完成', s.perfectDays, 5),
    mk('rope1w', '跳绳一万', '🪢', '累计跳绳 10000 个', s.ropeTotal, 10000),
    mk('rope5w', '跳绳五万', '🚀', '累计跳绳 50000 个', s.ropeTotal, 50000),
    mk(
      'minute',
      '一分钟飞人',
      '⚡',
      kid.id === 'cun' ? '一分钟跳绳 120 个' : '一分钟跳绳 60 个',
      s.bestJumpMinute,
      kid.id === 'cun' ? 120 : 60,
    ),
    mk('chore5', '家务小帮手', '🍽️', '刷碗做饭 5 次', s.choreTotal, 5),
    mk('poemHalf', '小诗人', '📜', `背会 ${Math.ceil(poemTarget / 2)} 首古诗`, s.learned.poems, Math.ceil(poemTarget / 2)),
    mk('poemAll', '古诗达人', '🎓', `背会 ${poemTarget} 首古诗`, s.learned.poems, poemTarget),
  ];

  if (kid.wordCount > 0) {
    list.push(
      mk('w100', '百词小将', '💯', '认识 100 个单词', s.learned.words, 100),
      mk('w300', '三百词王', '👑', '认识 300 个单词', s.learned.words, 300),
      mk('math', '口诀全会', '✖️', '九九乘法口诀全部掌握', s.learned.math, 45),
    );
  }
  if (kid.hanziCount > 0) {
    list.push(
      mk('h50', '识字小达人', '🀄', '认识 50 个汉字', s.learned.hanzi, 50),
      mk('h100', '百字小学霸', '👑', '认识 100 个汉字', s.learned.hanzi, 100),
      mk('pinyin', '拼音全会', '🔠', '拼音字母全部会读', s.learned.pinyin, 63),
    );
  }
  return list;
}

/** 本周某个每周任务完成次数 */
export function weeklyCount(st: KidState, taskId: string, wk = weekKey()): number {
  return st.weekly[wk]?.[taskId] || 0;
}
