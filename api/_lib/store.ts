/**
 * 服务端存档读写
 *
 * 存储结构：一个 Hash，每个孩子一个字段
 *   bravekids:v1:kids  =>  { cun: "<json>", heng: "<json>" }
 *
 * 用 Hash 而不是单个大 key 的好处：两个孩子各写各的字段，
 * 哥哥在 iPad 打卡、弟弟在手机打卡也不会互相覆盖，服务端不需要任何合并逻辑。
 *
 * 线上走 Upstash / Vercel Redis（REST 协议）；
 * 本地开发如果没配 Redis 凭据，自动落到项目根目录的 .dev-store.json，
 * 这样 `npm run dev` 不依赖任何云端资源也能完整调试。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Redis } from '@upstash/redis';

export const HASH_KEY = 'bravekids:v1:kids';

/** 本地开发环境：Vercel 上 VERCEL=1 且 NODE_ENV=production，永远不会命中 */
export function isLocalDev(): boolean {
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production';
}

let client: Redis | null = null;

/**
 * Redis 凭据必须是 REST 协议（Upstash 系）。Vercel 上不同接入方式注入的
 * 变量名不一样，这里按优先级依次尝试，最后再做一次模糊查找兜底：
 * - Vercel Marketplace 原生集成（含由 Vercel KV 迁移而来的项目）：KV_REST_API_*
 * - Upstash 官方集成 / 控制台自己复制：UPSTASH_REDIS_REST_*
 *
 * 注意：如果选的是只提供 redis:// TCP 连接串的服务商（如 Redis Cloud），
 * 这里拿不到凭据 —— 请选支持 REST API 的 Upstash Redis。
 */
const URL_ENV_KEYS = [
  'KV_REST_API_URL',
  'UPSTASH_REDIS_REST_URL',
  'REDIS_REST_API_URL',
] as const;

const TOKEN_ENV_KEYS = [
  'KV_REST_API_TOKEN',
  'UPSTASH_REDIS_REST_TOKEN',
  'REDIS_REST_API_TOKEN',
] as const;

function pickEnv(keys: readonly string[], fuzzy: RegExp): string | undefined {
  for (const k of keys) {
    const v = process.env[k];
    if (v) return v;
  }
  // 兜底：服务商换了命名时，按后缀模糊匹配一次
  const hit = Object.keys(process.env).find((k) => fuzzy.test(k) && process.env[k]);
  return hit ? process.env[hit] : undefined;
}

function readRestCredentials(): { url: string; token: string } | null {
  const url = pickEnv(URL_ENV_KEYS, /REST_(API_)?URL$/);
  const token = pickEnv(TOKEN_ENV_KEYS, /REST_(API_)?TOKEN$/);
  if (!url || !token) return null;
  if (!/^https:\/\//.test(url)) return null; // 只接受 REST(HTTPS) 端点
  return { url, token };
}

export function isRedisConfigured(): boolean {
  return readRestCredentials() !== null;
}

/** 排查用：列出当前环境里疑似 Redis 的变量名（只打日志，不返回给客户端） */
export function describeRedisEnv(): string {
  const names = Object.keys(process.env).filter((k) => /(KV_|UPSTASH|REDIS)/.test(k));
  return names.length ? names.join(', ') : '(没有任何 KV_/UPSTASH_/REDIS_ 开头的变量)';
}

export function getRedis(): Redis {
  if (client) return client;
  const cred = readRestCredentials();
  if (!cred) throw new Error('REDIS_NOT_CONFIGURED');
  client = new Redis({ url: cred.url, token: cred.token });
  return client;
}

/* ------------------------- 本地开发用的文件存储 ------------------------- */

const DEV_FILE = resolve(process.cwd(), '.dev-store.json');

async function readDevFile(): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(DEV_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function writeDevFile(data: Record<string, unknown>): Promise<void> {
  await writeFile(DEV_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/* ------------------------- 对外接口 ------------------------- */

/** 存档能不能用：线上要有 Redis，本地没 Redis 时用文件兜底 */
export function isStoreReady(): boolean {
  return isRedisConfigured() || isLocalDev();
}

/** 当前用的是哪种存储，用于日志和本地提示 */
export function storeKind(): 'redis' | 'local-file' | 'none' {
  if (isRedisConfigured()) return 'redis';
  return isLocalDev() ? 'local-file' : 'none';
}

/** 读出全部孩子的存档，值是不透明 JSON，服务端不理解其结构 */
export async function readAllKids(): Promise<Record<string, unknown>> {
  if (!isRedisConfigured()) {
    if (!isLocalDev()) throw new Error('REDIS_NOT_CONFIGURED');
    return readDevFile();
  }
  const all = await getRedis().hgetall<Record<string, unknown>>(HASH_KEY);
  return all ?? {};
}

/** 覆盖写单个孩子的存档 */
export async function writeKid(kid: string, state: unknown): Promise<void> {
  if (!isRedisConfigured()) {
    if (!isLocalDev()) throw new Error('REDIS_NOT_CONFIGURED');
    const data = await readDevFile();
    data[kid] = state;
    await writeDevFile(data);
    return;
  }
  await getRedis().hset(HASH_KEY, { [kid]: JSON.stringify(state) });
}
