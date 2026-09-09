/** 极简全局 store：useSyncExternalStore + localStorage 持久化 */
import { useSyncExternalStore } from 'react';
import type { AppState, KidId, KidState, Route } from './types';
import { today, weekKey } from './lib/date';

const KEY = 'kids-center-v1';

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

function load(): AppState {
  if (typeof localStorage === 'undefined') return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as AppState;
    const base = initial();
    return {
      ...base,
      ...parsed,
      kids: {
        cun: { ...emptyKid(), ...parsed.kids?.cun },
        heng: { ...emptyKid(), ...parsed.kids?.heng },
      },
    };
  } catch {
    return initial();
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式下忽略 */
  }
}

function set(next: AppState) {
  state = next;
  save();
  emit();
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

/* --------------------------- 操作 --------------------------- */

function patchKid(id: KidId, fn: (k: KidState) => KidState) {
  set({ ...state, kids: { ...state.kids, [id]: fn(state.kids[id]) } });
}

export function selectKid(id: KidId | null) {
  set({ ...state, current: id });
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
