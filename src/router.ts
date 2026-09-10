/**
 * hash 路由
 *
 * 只做三件事：解析 URL、校验合法性、通知订阅者。
 * 「当前选中哪个孩子」也放进 URL（#/cun/home），这样：
 * - 刷新页面不会丢上下文，家长可以直接把某一页存成书签
 * - 两个孩子各自的页面有独立地址，不会互相串
 * - 路由和界面状态只有一个来源，不会出现「URL 是 A、页面是 B」
 */
import { useSyncExternalStore } from 'react';
import type { KidId, Route } from './types';

/** 需要先选孩子才能进的页面 */
const KID_ROUTES: Route[] = ['home', 'poems', 'hanzi', 'words', 'math', 'pinyin', 'badges'];
const KID_IDS: KidId[] = ['cun', 'heng'];

export interface RouteState {
  /** null 表示还没选孩子（选人页） */
  kid: KidId | null;
  route: Route;
  /** 页面内的可选参数，比如具体某首诗 */
  param?: string;
}

const KIDS_ROUTE: RouteState = { kid: null, route: 'kids' };

function isKidId(x: string): x is KidId {
  return (KID_IDS as string[]).includes(x);
}

function isKidRoute(x: string): x is Route {
  return (KID_ROUTES as string[]).includes(x);
}

/** 把 RouteState 还原成 hash 字符串，用于比对和跳转 */
export function toHash(s: RouteState): string {
  if (!s.kid) return '#/kids';
  return `#/${s.kid}/${s.route}${s.param ? `/${encodeURIComponent(s.param)}` : ''}`;
}

/**
 * 解析 hash。任何不合法的输入都退回选人页，
 * 不做「猜测用户想去哪」这种事，避免出现半个合法状态。
 */
export function parseHash(hash: string): RouteState {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return KIDS_ROUTE;

  const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second, third] = parts;

  if (!first || first === 'kids') return KIDS_ROUTE;
  if (!isKidId(first)) return KIDS_ROUTE;
  // 只有孩子 id，默认进他的今日打卡页
  if (!second) return { kid: first, route: 'home' };
  if (!isKidRoute(second)) return KIDS_ROUTE;

  return { kid: first, route: second, param: third || undefined };
}

let current: RouteState =
  typeof window === 'undefined' ? KIDS_ROUTE : parseHash(window.location.hash);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/**
 * 同步 URL 与内部状态。
 * 解析结果和原始 hash 不一致时（非法地址、大小写、多余斜杠等），
 * 用 replaceState 把 URL 纠正过来，免得地址栏和页面对不上，
 * 也不会在历史里留下一条走不通的记录。
 */
function sync(replaceIfDiff = true) {
  const next = parseHash(window.location.hash);
  const canonical = toHash(next);

  if (replaceIfDiff && window.location.hash !== canonical) {
    window.history.replaceState(null, '', canonical);
  }

  const changed =
    next.kid !== current.kid || next.route !== current.route || next.param !== current.param;
  current = next;
  if (changed) emit();
}

if (typeof window !== 'undefined') {
  // 首次也校正一次，处理直接粘贴进来的非法地址
  sync();
  window.addEventListener('hashchange', () => sync());
}

export function useRoute(): RouteState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => current,
  );
}

export function getRoute(): RouteState {
  return current;
}

/** 在当前孩子下切换页面 */
export function go(route: Route, param?: string) {
  const kid = route === 'kids' ? null : current.kid;
  navigate({ kid, route, param });
}

/** 选中某个孩子并进入他的页面 */
export function goKid(kid: KidId, route: Route = 'home') {
  navigate({ kid, route });
}

/** 回到选人页 */
export function goKids() {
  navigate(KIDS_ROUTE);
}

function navigate(next: RouteState) {
  const target = toHash(next);
  if (window.location.hash === target) return;
  window.location.hash = target;
  window.scrollTo({ top: 0 });
}

/**
 * 返回上一层。
 *
 * 不用 history.back()：孩子在学习页里点了几次跳转后，
 * back 的落点是不可预测的，可能退回到已经不合法的地址，
 * 甚至退出应用。这里按固定层级走：
 *   学习页 / 勋章页 → 今日打卡 → 选人页
 */
export function back() {
  if (!current.kid) return;
  if (current.route === 'home') {
    goKids();
    return;
  }
  go('home');
}
