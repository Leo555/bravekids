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
import type { Redis } from '@upstash/redis';

export const HASH_KEY = 'bravekids:v1:kids';

/** 本地开发环境：Vercel 上 VERCEL=1 且 NODE_ENV=production，永远不会命中 */
export function isLocalDev(): boolean {
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production';
}

let client: Redis | null = null;

/**
 * Redis 凭据必须是 REST 协议（Upstash 系）。Vercel 上注入的变量名有好几种情况：
 * - Marketplace 原生集成：KV_REST_API_URL / KV_REST_API_TOKEN
 * - Upstash 官方集成：UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * - 同一个库连了多个项目时，Vercel 会加项目前缀，
 *   例如 bravekids_KV_REST_API_URL / bravekids_KV_REST_API_TOKEN
 *
 * 所以这里先按标准名精确取，取不到再按「后缀 + 同前缀配对」找，
 * 保证 URL 和 TOKEN 来自同一个数据库，也不会误选 *_READ_ONLY_TOKEN。
 *
 * 注意：只提供 redis:// TCP 连接串的服务商（如 Redis Cloud）不适用，
 * Serverless 环境请选支持 REST API 的 Upstash Redis。
 */
const CREDENTIAL_SUFFIXES = [
  { url: 'KV_REST_API_URL', token: 'KV_REST_API_TOKEN' },
  { url: 'UPSTASH_REDIS_REST_URL', token: 'UPSTASH_REDIS_REST_TOKEN' },
  { url: 'REDIS_REST_API_URL', token: 'REDIS_REST_API_TOKEN' },
] as const;

/** 环境变量在函数生命周期内不会变，解析一次就缓存，避免每个请求都遍历 process.env */
let credCache: { url: string; token: string } | null | undefined;

function readRestCredentials(): { url: string; token: string } | null {
  if (credCache !== undefined) return credCache;
  credCache = resolveRestCredentials();
  return credCache;
}

function resolveRestCredentials(): { url: string; token: string } | null {
  const keys = Object.keys(process.env);

  for (const pair of CREDENTIAL_SUFFIXES) {
    // 先试没有前缀的标准命名，再试带前缀的（bravekids_KV_REST_API_URL 之类）
    const candidates = [pair.url, ...keys.filter((k) => k !== pair.url && k.endsWith(pair.url))];

    for (const urlKey of candidates) {
      const url = process.env[urlKey];
      if (!url) continue;

      // 用同样的前缀去取 token，避免把 A 库的 url 和 B 库的 token 配到一起
      const prefix = urlKey.slice(0, urlKey.length - pair.url.length);
      const token = process.env[`${prefix}${pair.token}`];
      if (!token) continue;

      // 只接受 REST(HTTPS) 端点，redis:// 连接串在 Serverless 里用不了
      if (!/^https:\/\//.test(url)) continue;

      return { url, token };
    }
  }

  return null;
}

export function isRedisConfigured(): boolean {
  return readRestCredentials() !== null;
}

/** 排查用：列出当前环境里疑似 Redis 的变量名（只打日志，不返回给客户端） */
export function describeRedisEnv(): string {
  const names = Object.keys(process.env).filter((k) => /(KV_|UPSTASH|REDIS)/.test(k));
  return names.length ? names.join(', ') : '(没有任何 KV_/UPSTASH_/REDIS_ 开头的变量)';
}

/**
 * 动态 import @upstash/redis：
 * 放在模块顶层 import 的话，一旦这个包在运行时加载失败，
 * 函数会在任何代码执行前就崩掉，Vercel 只给一个没有线索的
 * FUNCTION_INVOCATION_FAILED。改成动态导入后，失败会变成
 * 可以被 handler 捕获、能写进日志的普通异常。
 */
export async function getRedis(): Promise<Redis> {
  if (client) return client;
  const cred = readRestCredentials();
  if (!cred) throw new Error('REDIS_NOT_CONFIGURED');
  const { Redis: RedisCtor } = await import('@upstash/redis');
  client = new RedisCtor({ url: cred.url, token: cred.token });
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
  const redis = await getRedis();
  const all = await redis.hgetall<Record<string, unknown>>(HASH_KEY);
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
  const redis = await getRedis();
  await redis.hset(HASH_KEY, { [kid]: JSON.stringify(state) });
}
