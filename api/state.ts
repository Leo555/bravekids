/**
 * GET  /api/state  读出两个孩子的全部存档
 * PUT  /api/state  覆盖写某一个孩子的存档，body: { kid, state }
 *
 * 请求头必须带家庭口令：Authorization: Bearer <FAMILY_PASSCODE>
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authorize } from './_lib/auth';
import { describeRedisEnv, isStoreReady, readAllKids, storeKind, writeKid } from './_lib/store';

/** 单个孩子的存档体积上限，正常只有几十 KB */
const MAX_BODY_BYTES = 512 * 1024;
const KID_IDS = ['cun', 'heng'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!isStoreReady()) {
    // 变量名对不上是最常见的部署问题，把实际存在的变量名打到函数日志里方便排查
    console.error('[api/state] Redis 未配置，当前相关环境变量：', describeRedisEnv());
    return res.status(503).json({
      error: 'redis_not_configured',
      message: '服务端未配置 Redis REST 凭据',
    });
  }
  res.setHeader('X-Store-Kind', storeKind());

  const auth = await authorize(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: 'unauthorized', message: auth.message });
  }

  try {
    if (req.method === 'GET') {
      const kids = await readAllKids();
      return res.status(200).json({ kids });
    }

    if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'payload_too_large' });
    }

    const body = req.body as { kid?: unknown; state?: unknown } | undefined;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'invalid_body' });
    }

    const kid = body.kid;
    if (typeof kid !== 'string' || !KID_IDS.includes(kid)) {
      return res.status(400).json({ error: 'invalid_kid' });
    }

    const state = body.state;
    if (state === null || typeof state !== 'object' || Array.isArray(state)) {
      return res.status(400).json({ error: 'invalid_state' });
    }

    if (JSON.stringify(state).length > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'payload_too_large' });
    }

    await writeKid(kid, state);
    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    if (message === 'REDIS_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'redis_not_configured' });
    }
    console.error('[api/state] failed:', message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
