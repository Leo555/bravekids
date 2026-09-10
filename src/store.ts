/**
 * 极简全局 store：useSyncExternalStore + 纯云端存档
 *
 * 打卡数据只存在云端（Vercel Serverless + Redis），本地不做持久化：
 * 打开 App 时从云端拉一份放内存，任何改动立刻回写云端。
 */
import { useSyncExternalStore } from 'react';
import type { AppState, KidId, KidState, Route } from './types';
import { today, weekKey } from './lib/date';
import { loadKids, saveKid, watchLifecycle } from './lib/cloud';

function emptyKid(): KidState {
  return {
    daily: {},
    weekly: {},
    learnedWords: [],
    learnedHanzi: [],
    learnedPoems: [],
    mathMastered: [],
    learnedPinyin: [],
    bestJumpMinute: 0,
    quizBest: {},
  };
}

function initial(): AppState {
  return {
    version: 1,
    current: null,
    kids: { cun: emptyKid(), heng: emptyKid() },
  };
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function numMap(v: unknown): Record<string, number> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, number> = {};
  Object.entries(v as Record<string, unknown>).forEach(([k, n]) => {
    out[k] = num(n);
  });
  return out;
}

function normalizeKid(raw: unknown): KidState {
  const k = (raw && typeof raw === 'object' ? raw : {}) as Partial<KidState>;

  const daily: KidState['daily'] = {};
  Object.entries(k.daily || {}).forEach(([date, tasks]) => {
    if (!tasks || typeof tasks !== 'object') return;
    const day: Record<string, { done: boolean; value: number }> = {};
    Object.entries(tasks).forEach(([tid, rec]) => {
      const r = (rec && typeof rec === 'object' ? rec : {}) as Record<string, unknown>;
      day[tid] = { done: Boolean(r.done), value: num(r.value) };
    });
    daily[date] = day;
  });

  const weekly: KidState['weekly'] = {};
  Object.entries(k.weekly || {}).forEach(([wk, tasks]) => {
    weekly[wk] = numMap(tasks);
  });

  return {
    daily,
    weekly,
    learnedWords: strList(k.learnedWords),
    learnedHanzi: strList(k.learnedHanzi),
    learnedPoems: strList(k.learnedPoems),
    mathMastered: strList(k.mathMastered),
    learnedPinyin: strList(k.learnedPinyin),
    bestJumpMinute: num(k.bestJumpMinute),
    quizBest: numMap(k.quizBest),
  };
}

/**
 * 把任意来源（localStorage / 云端）的数据整理成合法的 AppState。
 * 存档一旦损坏或结构变化，也不会让页面白屏。
 */
export function normalizeState(raw: unknown): AppState {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Partial<AppState>;
  const kids = (p.kids || {}) as Partial<AppState['kids']>;
  const current = p.current === 'cun' || p.current === 'heng' ? p.current : null;
  return {
    version: num(p.version) || 1,
    current,
    kids: {
      cun: normalizeKid(kids.cun),
      heng: normalizeKid(kids.heng),
    },
  };
}

let state: AppState = initial();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getState(): AppState {
  return state;
}

/* --------------------------- 云端加载 --------------------------- */

/** 云端存档到位前不渲染业务页面，由 components/Boot 显示加载 / 重试 */
let ready = false;
const readyListeners = new Set<() => void>();

export function useReady(): boolean {
  return useSyncExternalStore(
    (cb) => {
      readyListeners.add(cb);
      return () => readyListeners.delete(cb);
    },
    () => ready,
    () => ready,
  );
}

/** 从云端拉取存档。失败时保持未就绪，Boot 页会给出原因和重试按钮 */
export async function reload(): Promise<void> {
  const kids = await loadKids();
  if (!kids) {
    ready = false;
    readyListeners.forEach((l) => l());
    return;
  }
  // current 是「这台设备正在给谁打卡」，属于界面状态，不从云端来
  state = normalizeState({ current: state.current, kids });
  ready = true;
  emit();
  readyListeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  void reload();
  watchLifecycle(() => {
    void reload();
  });
}

/* --------------------------- 操作 --------------------------- */

function patchKid(id: KidId, fn: (k: KidState) => KidState) {
  const nextKid = fn(state.kids[id]);
  state = { ...state, kids: { ...state.kids, [id]: nextKid } };
  emit();
  saveKid(id, nextKid);
}

export function selectKid(id: KidId | null) {
  // 只影响当前界面，不需要写云端
  state = { ...state, current: id };
  emit();
}

/** 每日任务：设置完成状态 / 数值 */
export function setDaily(
  id: KidId,
  taskId: string,
  patch: { done?: boolean; value?: number },
  date = today(),
) {
  patchKid(id, (k) => {
    const day = { ...(k.daily[date] || {}) };
    const prev = day[taskId] || { done: false, value: 0 };
    day[taskId] = { ...prev, ...patch };
    return { ...k, daily: { ...k.daily, [date]: day } };
  });
}

export function toggleDaily(id: KidId, taskId: string, date = today()) {
  const rec = state.kids[id].daily[date]?.[taskId];
  setDaily(id, taskId, { done: !rec?.done }, date);
}

/** 每周任务：增减完成次数 */
export function bumpWeekly(id: KidId, taskId: string, delta: number, wk = weekKey()) {
  patchKid(id, (k) => {
    const week = { ...(k.weekly[wk] || {}) };
    week[taskId] = Math.max(0, (week[taskId] || 0) + delta);
    return { ...k, weekly: { ...k.weekly, [wk]: week } };
  });
}

export type ListField =
  | 'learnedWords'
  | 'learnedHanzi'
  | 'learnedPoems'
  | 'mathMastered'
  | 'learnedPinyin';

export function toggleLearned(id: KidId, field: ListField, key: string) {
  patchKid(id, (k) => {
    const list = k[field];
    const has = list.includes(key);
    return { ...k, [field]: has ? list.filter((x) => x !== key) : [...list, key] };
  });
}

export function addLearned(id: KidId, field: ListField, key: string) {
  patchKid(id, (k) =>
    k[field].includes(key) ? k : { ...k, [field]: [...k[field], key] },
  );
}

export function setBestJumpMinute(id: KidId, n: number) {
  patchKid(id, (k) => (n > k.bestJumpMinute ? { ...k, bestJumpMinute: n } : k));
}

export function setQuizBest(id: KidId, quiz: string, score: number) {
  patchKid(id, (k) =>
    score > (k.quizBest[quiz] || 0)
      ? { ...k, quizBest: { ...k.quizBest, [quiz]: score } }
      : k,
  );
}

export function resetKid(id: KidId) {
  patchKid(id, () => emptyKid());
}

/* --------------------------- 路由 --------------------------- */

export interface RouteState {
  route: Route;
  param?: string;
}

function parseHash(): RouteState {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [route, param] = h.split('/');
  const valid: Route[] = ['kids', 'home', 'poems', 'hanzi', 'words', 'math', 'pinyin', 'badges'];
  return {
    route: (valid.includes(route as Route) ? route : 'kids') as Route,
    param: param || undefined,
  };
}

let routeState: RouteState = typeof window === 'undefined' ? { route: 'kids' } : parseHash();
const routeListeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    routeState = parseHash();
    routeListeners.forEach((l) => l());
  });
}

export function useRoute(): RouteState {
  return useSyncExternalStore(
    (cb) => {
      routeListeners.add(cb);
      return () => routeListeners.delete(cb);
    },
    () => routeState,
    () => routeState,
  );
}

export function go(route: Route, param?: string) {
  window.location.hash = `#/${route}${param ? `/${param}` : ''}`;
  window.scrollTo({ top: 0 });
}

export function back() {
  if (window.history.length > 1) window.history.back();
  else go('home');
}
