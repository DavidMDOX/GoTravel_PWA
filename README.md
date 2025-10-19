# Go Travel — PWA Wrapper

这是一个**零成本**把你 Hugging Face Space（Gradio 应用）包装成 PWA 的外壳项目：
- 支持 `添加到主屏幕`（iOS/Android/桌面）
- 支持离线外壳（主页面和静态资源离线；HF 内容在线加载）
- 预留了 `升级/付费` 页面占位符（下一步可接 Stripe/PayPal）

## 1) 使用方法

1. 打开 `config.js`，把
   ```js
   window.HF_SPACE_URL = "https://YOUR-SPACE-NAME.hf.space"
   ```
   改成你的 Hugging Face Space 地址（例如 `https://mytripplanner.hf.space`）。

2. 部署整个文件夹到 **Vercel / Netlify / Cloudflare Pages / 任意静态托管**：
   - 文档根目录就是本文件夹根目录；
   - 必须使用 HTTPS（这些平台默认有）。

3. 用手机 Safari 或 Chrome 访问你的域名：
   - iOS：点击分享按钮 → “添加到主屏幕”；
   - Android/桌面 Chrome：会出现“可安装”提示或点击地址栏安装图标。

> 注意：本 PWA 外壳以 iframe 方式加载你的 Space，**无需修改你的 Gradio 代码**。

## 2) Stripe（之后接）

- 你提供 Stripe 账号后，我们把 `/billing.html` 替换成结账按钮，后端可用 Cloudflare Workers/Netlify Functions/Vercel Functions。
- 典型流程：
  1) 前端点击“升级/付费” → 调用 `/api/create-checkout-session`；
  2) 跳转到 Stripe Checkout；
  3) 支付成功 webhook → 标记你的用户订阅状态（存在你自己的后端）；
  4) 你的 Gradio/HF 服务通过后端发 token 校验订阅/配额。

## 3) 本地测试

- 用任意静态服务器（VSCode Live Server / `python -m http.server`）在本目录启动；
- 浏览器访问 `http://localhost:8000`（或端口）；
- 首次打开后，Service Worker 会缓存必要文件；断网后仍能打开外壳页面（HF 内容需联网）。

## 4) 图标

- 已包含 180/192/512 三个尺寸 PNG。你可以替换为自己的品牌图标（建议正方形无透明边）。

## 5) 常见问题

- **能否直接在 Hugging Face Space 里变成 PWA？**  
  Gradio 页面无法直接修改 `<head>` 注入 `manifest`，因此推荐用本“外壳”PWA在自有域名托管，并 iframe 你的 Space。
