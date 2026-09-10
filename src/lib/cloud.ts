/**
 * 云端存档（Vercel Serverless Function + Redis）
 *
 * 这个 App 不在本地保存任何打卡数据：打开时从云端读，改动后写回云端。
 * 本地只存一个家庭口令，免得每次打开都要输。
 *
 * 写入按孩子分开（PUT { kid, state }），服务端用 Redis Hash 的字段覆盖，
 * 所以两个孩子在两台设备上同时打卡也不会互相影响，不需要任何合并逻辑。
 */
import type { KidId, KidState } from '../types';

const API = '/api/state';
const PASSCODE_KEY = 'bravekids-passcode';
/** 连点计数器时合并成一次请求 */
const SAVE_DEBOUNCE_MS = 800;
/** 保存失败后的重试间隔 */
const RETRY_MS = 3000;

export type CloudStatus =
  /** 正在拉取云端存档 */
  | 'loading'
  /** 需要输入家庭口令 */
  | 'need-passcode'
  /** 口令不正确 */
  | 'unauthorized'
  /** 服务端没配好（没连 Redis / 没设口令 / 本地 vite dev 没有 api） */
  | 'unavailable'
  /** 已就绪 */
  | 'ready'
  /** 网络或服务器错误 */
  | 'error';

export interface CloudInfo {
  status: CloudStatus;
  /** 有改动正在保存或排队等待重试 */
  saving: boolean;
  /** 保存一直失败，数据只在内存里，刷新会丢 */
  unsaved: boolean;
  lastSavedAt: number | null;
  message?: string;
}

/* ------------------------- 口令 ------------------------- */

export function getPasscode(): string | null {
  try {
    return localStorage.getItem(PASSCODE_KEY);
  } catch {
    return null;
  }
}

export function setPasscode(code: string) {
  try {
    localStorage.setItem(PASSCODE_KEY, code.trim());
  } catch {
    /* 隐私模式忽略 */
  }
}

export function clearPasscode() {
  try {
    localStorage.removeItem(PASSCODE_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------- 状态订阅 ------------------------- */

let info: CloudInfo = {
  status: 'loading',
  saving: false,
  unsaved: false,
  lastSavedAt: null,
};

const listeners = new Set<() => void>();

function update(patch: Partial<CloudInfo>) {
  info = { ...info, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeCloud(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getCloudInfo(): CloudInfo {
  return info;
}

/* ------------------------- 请求 ------------------------- */

async function request(
  method: 'GET' | 'PUT',
  body?: unknown,
  /** 页面正在关闭时用，让请求脱离页面生命周期继续发出（body 上限 64KB） */
  keepalive = false,
): Promise<Response> {
  const passcode = getPasscode();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (passcode) headers.Authorization = `Bearer ${passcode}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(API, {
    method,
    headers,
    keepalive,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** 本地 dev 没有 Serverless Function 时可能返回 HTML，需要兜住 */
async function readJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 把 HTTP 失败状态翻译成云端状态；返回 true 表示已处理 */
function handleFailure(res: Response): boolean {
  if (res.status === 503 || res.status === 404 || res.status === 405) {
    update({
      status: 'unavailable',
      message: '服务端还没配置好云端存档（Redis / 家庭口令）',
    });
    return true;
  }
  if (res.status === 401) {
    update(
      getPasscode()
        ? { status: 'unauthorized', message: '家庭口令不正确' }
        : { status: 'need-passcode', message: undefined },
    );
    return true;
  }
  if (res.status === 429) {
    update({ status: 'error', message: '尝试次数过多，请稍后再试' });
    return true;
  }
  if (!res.ok) {
    update({ status: 'error', message: `云端出错了（${res.status}）` });
    return true;
  }
  return false;
}

/* ------------------------- 读 ------------------------- */

/**
 * 首屏那次 GET 由 index.html 里的内联脚本提前发出（和主 JS 下载并行），
 * 这里优先取它的结果，取不到再自己发一次。只用一次，之后都走正常请求。
 */
function takePrefetched(): Promise<Response> | null {
  const w = window as unknown as { __bkState?: Promise<Response> };
  const p = w.__bkState;
  if (!p) return null;
  delete w.__bkState;
  return p;
}

/**
 * 拉取云端存档。返回 null 表示没拉到（状态里有原因）。
 * 没填口令时也会发一次请求，靠服务端返回的 503 / 401
 * 区分「后端没配好」和「需要输入口令」。
 */
export async function loadKids(): Promise<Partial<Record<KidId, unknown>> | null> {
  update({ status: 'loading', message: undefined });

  let res: Response;
  try {
    // 预取的响应体只能读一次，克隆一份防止 React StrictMode 下重复消费
    const prefetched = takePrefetched();
    res = prefetched ? (await prefetched).clone() : await request('GET');
  } catch {
    update({
      status: getPasscode() ? 'error' : 'need-passcode',
      message: getPasscode() ? '连不上网络，检查一下 Wi-Fi' : undefined,
    });
    return null;
  }

  if (handleFailure(res)) return null;

  const data = await readJson<{ kids: Partial<Record<KidId, unknown>> }>(res);
  if (!data) {
    update({ status: 'unavailable', message: '服务端还没配置好云端存档' });
    return null;
  }

  update({ status: 'ready', message: undefined });
  return data.kids || {};
}

/* ------------------------- 写 ------------------------- */

/** 待保存的孩子存档，值的引用用来判断有没有被更新过 */
const queue = new Map<KidId, KidState>();
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function schedule(ms: number) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flushQueue();
  }, ms);
}

async function flushQueue(keepalive = false): Promise<void> {
  if (flushing || queue.size === 0) return;
  if (!getPasscode()) {
    update({ status: 'need-passcode', unsaved: true });
    return;
  }

  flushing = true;
  try {
    for (const [kid, state] of Array.from(queue.entries())) {
      let res: Response;
      try {
        res = await request('PUT', { kid, state }, keepalive);
      } catch {
        update({ unsaved: true, message: '连不上网络，正在重试…' });
        schedule(RETRY_MS);
        return;
      }

      if (handleFailure(res)) {
        update({ unsaved: true });
        schedule(RETRY_MS);
        return;
      }

      // 期间又改过就留着，交给下一轮
      if (queue.get(kid) === state) queue.delete(kid);
    }

    update({
      status: 'ready',
      saving: queue.size > 0,
      unsaved: false,
      lastSavedAt: Date.now(),
      message: undefined,
    });
    if (queue.size > 0) schedule(SAVE_DEBOUNCE_MS);
  } finally {
    flushing = false;
  }
}

/** 某个孩子的存档变了：排队并防抖上传 */
export function saveKid(kid: KidId, state: KidState) {
  queue.set(kid, state);
  update({ saving: true });
  schedule(SAVE_DEBOUNCE_MS);
}

/** 立刻把排队的改动发出去（切后台 / 关页面时） */
export function flushNow(keepalive = false) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  void flushQueue(keepalive);
}

/** 是否还有没存上的改动 */
export function hasUnsaved(): boolean {
  return queue.size > 0;
}

/** 手动重试 */
export function retrySave() {
  flushNow();
}

/* ------------------------- 生命周期 ------------------------- */

export function watchLifecycle(reload: () => void) {
  window.addEventListener('online', () => {
    if (queue.size > 0) flushNow();
    else if (info.status === 'error') reload();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // 回到前台先把没存上的补传，再重新拉一次（别的设备可能改过）
      if (queue.size > 0) flushNow();
      else if (info.status === 'ready') reload();
    } else {
      flushNow(true);
    }
  });

  window.addEventListener('pagehide', () => flushNow(true));

  // 还有没存上的数据时拦一下，避免家长直接关掉丢进度
  window.addEventListener('beforeunload', (e) => {
    if (queue.size === 0) return;
    e.preventDefault();
    e.returnValue = '';
  });
}
