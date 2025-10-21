# Go Travel · PWA (Vercel)

纯前端版本；用户输入自己的 OpenAI API Key。

## 部署
1. 把本项目推到 GitHub
2. Vercel → Import Project → 选择该仓库 → Deploy
3. 打开域名，填 API Key，开始生成行程

## PWA
- `manifest.json` + `sw.js` 已配置
- 如遇缓存问题，把 `sw.js` 的 `CACHE` 名字改成新版本再部署

## 模型
- 默认 `gpt-4o-mini`，可在页面中修改；如需固定，可把 app.js 内 `model` 写死
