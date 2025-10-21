// 运行在 Vercel Edge：把 hf.space 的内容代理到本域，并移除禁止内嵌的响应头
export const config = { runtime: 'edge' };
// 新版写法也兼容：export const runtime = 'edge';

const TARGET_ORIGIN = 'https://davidmdox-gotravel-uipro.hf.space';

export default async function handler(req: Request) {
  const url = new URL(req.url);
  // 把 /api/app-proxy 后面的路径和查询拼到目标
  const suffix = url.pathname.replace(/^\/api\/app-proxy/, '') + url.search;
  const target = TARGET_ORIGIN + (suffix || '/');

  // 透传用户 UA/语言等必要头
  const headers = new Headers(req.headers);
  // 有些 hop-by-hop 头不该传（edge 环境一般会自动处理，这里可适度清理）
  ['host','connection','keep-alive','transfer-encoding','content-length'].forEach(h=>headers.delete(h));

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  });

  // 复制响应并移除/放宽拦截内嵌的响应头
  const newHeaders = new Headers(upstream.headers);
  newHeaders.delete('x-frame-options');

  const csp = newHeaders.get('content-security-policy');
  if (csp) {
    // 去掉 frame-ancestors 限制（尽量只移除该指令，其他保持）
    const cleaned = csp.replace(/frame-ancestors[^;]*;?/gi, '');
    newHeaders.set('content-security-policy', cleaned);
  }

  // 处理跨域字体/样式等
  if (!newHeaders.has('access-control-allow-origin')) {
    newHeaders.set('access-control-allow-origin', '*');
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: newHeaders,
  });
}
