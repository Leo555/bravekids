/**
 * 家庭口令校验
 *
 * 这个接口读写的是全家共用的一份存档，必须有访问控制，否则任何人拿到
 * 域名就能读写孩子的打卡数据。这里用一个共享口令（环境变量 FAMILY_PASSCODE），
 * 足够家庭场景，且不需要引入账号体系。
 *
 * - 口令只存在环境变量里，绝不写进代码或前端产物
 * - 比较前先做 sha256，再用 timingSafeEqual，避免时序侧信道与长度泄露
 * - 失败次数限流，防止暴力猜口令（线上用 Redis 计数，本地用内存计数）
 * - 本地开发没配 FAMILY_PASSCODE 时用默认口令 dev，仅在非 Vercel 环境生效
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';
import { getRedis, isLocalDev, isRedisConfigured } from './store';

const MAX_FAILS = 20;
/** 全局失败上限：防止用代理池换 IP 绕过单 IP 限流 */
const MAX_GLOBAL_FAILS = 60;
const FAIL_WINDOW_SECONDS = 600;
/** 口令错误时的固定延迟，压低在线爆破速率 */
const FAIL_DELAY_MS = 700;
/** 只在本地开发生效的默认口令 */
export const DEV_PASSCODE = 'dev';

export function isPasscodeConfigured(): boolean {
  return typeof process.env.FAMILY_PASSCODE === 'string' && process.env.FAMILY_PASSCODE.length > 0;
}

/** 线上必须来自环境变量；本地没配就用 dev，方便直接 npm run dev 调试 */
function expectedPasscode(): string | null {
  if (isPasscodeConfigured()) return process.env.FAMILY_PASSCODE as string;
  return isLocalDev() ? DEV_PASSCODE : null;
}

function sha256(input: string): Buffer {
  return createHash('sha256').update(input, 'utf8').digest();
}

function extractPasscode(req: VercelRequest): string {
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }
  const header = req.headers['x-family-passcode'];
  if (typeof header === 'string') return header.trim();
  return '';
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  const ip = (raw || '').split(',')[0].trim();
  return ip || 'unknown';
}

/* ---------------- 失败计数：线上走 Redis，本地走内存 ---------------- */

const memoryFails = new Map<string, { count: number; expireAt: number }>();

async function readFails(key: string): Promise<number> {
  if (isRedisConfigured()) {
    return Number((await getRedis().get<number | string>(key)) ?? 0);
  }
  const rec = memoryFails.get(key);
  if (!rec || rec.expireAt < Date.now()) {
    memoryFails.delete(key);
    return 0;
  }
  return rec.count;
}

async function bumpFails(key: string): Promise<void> {
  if (isRedisConfigured()) {
    const redis = getRedis();
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, FAIL_WINDOW_SECONDS);
    return;
  }
  const now = Date.now();
  const rec = memoryFails.get(key);
  if (!rec || rec.expireAt < now) {
    memoryFails.set(key, { count: 1, expireAt: now + FAIL_WINDOW_SECONDS * 1000 });
  } else {
    rec.count += 1;
  }
}

async function clearFails(key: string): Promise<void> {
  if (isRedisConfigured()) {
    await getRedis().del(key);
    return;
  }
  memoryFails.delete(key);
}

export type AuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 429 | 503; message: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function authorize(req: VercelRequest): Promise<AuthResult> {
  const expected = expectedPasscode();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      message: '服务端未配置 FAMILY_PASSCODE',
    };
  }

  // 单 IP 限流之外再加一道全局闸：换代理池也没法把爆破速率拉起来
  const ipKey = `bravekids:v1:fail:${clientIp(req)}`;
  const globalKey = 'bravekids:v1:fail:global';
  const [ipFails, globalFails] = await Promise.all([readFails(ipKey), readFails(globalKey)]);
  if (ipFails >= MAX_FAILS || globalFails >= MAX_GLOBAL_FAILS) {
    return { ok: false, status: 429, message: '尝试次数过多，请稍后再试' };
  }

  const provided = extractPasscode(req);
  const matched = provided.length > 0 && timingSafeEqual(sha256(provided), sha256(expected));

  if (!matched) {
    await Promise.all([bumpFails(ipKey), bumpFails(globalKey)]);
    // 固定延迟，正常人几乎不会输错，但能把在线爆破速率压到很低
    await sleep(FAIL_DELAY_MS);
    return { ok: false, status: 401, message: '口令不正确' };
  }

  await clearFails(ipKey);
  return { ok: true };
}
