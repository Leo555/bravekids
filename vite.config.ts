import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 本地开发时把 /api/* 交给真实的 Serverless Function 代码执行。
 *
 * 这样 `npm run dev` 跑的就是线上同一份 api/*.ts，不用装 vercel CLI，
 * 也不用为了调试单独写一套 mock。没配 Redis 凭据时，
 * api/_lib/store.ts 会自动落到 .dev-store.json 文件存储。
 */
function localApi(): Plugin {
  return {
    name: 'bravekids-local-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();

        const [pathname, search = ''] = url.split('?');
        // 只允许简单的路由名，避免路径穿越
        const route = pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
        if (!/^[a-zA-Z0-9/_-]+$/.test(route) || route.includes('..')) {
          res.statusCode = 400;
          res.end('bad api path');
          return;
        }

        const file = resolve(process.cwd(), `api/${route}.ts`);
        if (!existsSync(file)) return next();

        void (async () => {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(chunk as Buffer);
            const raw = Buffer.concat(chunks).toString('utf8');

            const contentType = String(req.headers['content-type'] || '');
            let body: unknown = raw;
            if (raw && contentType.includes('application/json')) {
              try {
                body = JSON.parse(raw);
              } catch {
                body = raw;
              }
            }

            // 补齐 VercelRequest / VercelResponse 上 handler 会用到的部分
            const vercelReq = Object.assign(req, {
              body,
              query: Object.fromEntries(new URLSearchParams(search)),
              cookies: {} as Record<string, string>,
            });

            const vercelRes = Object.assign(res, {
              status(code: number) {
                res.statusCode = code;
                return vercelRes;
              },
              json(data: unknown) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(data));
                return vercelRes;
              },
              send(data: unknown) {
                res.end(typeof data === 'string' ? data : JSON.stringify(data));
                return vercelRes;
              },
            });

            const mod = (await server.ssrLoadModule(`/api/${route}.ts`)) as {
              default?: (rq: unknown, rs: unknown) => unknown;
            };
            if (typeof mod.default !== 'function') {
              res.statusCode = 500;
              res.end('api handler must export default function');
              return;
            }

            await mod.default(vercelReq, vercelRes);
          } catch (err) {
            server.config.logger.error(`[local-api] /api/${route} 执行失败: ${String(err)}`);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            if (!res.writableEnded) res.end(JSON.stringify({ error: 'internal_error' }));
          }
        })();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // 把 .env / .env.local 里的变量（含没有 VITE_ 前缀的）注入到 dev server 进程，
  // 供 api/*.ts 读取；这些值只留在 Node 端，不会打进前端产物。
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    base: './',
    plugins: [react(), localApi()],
    server: {
      host: true,
      port: 5180,
    },
  };
});
