# 部署指南

余一的AI观察备忘录的正式部署方式是 `OpenNext + Cloudflare Workers`。

当前项目身份：

- 项目名称：余一的AI观察备忘录
- 英文项目名：YuYi AI Notes
- package name：`yuyi-ai-notes`
- GitHub 仓库：<https://github.com/IDCBAD/yuyi-ai-notes>
- 生产域名占位：<https://your-domain.com>

## Cloudflare 资源名

默认使用以下资源名：

- Worker：`yuyi-ai-notes`
- D1：`yuyi-ai-notes-db`
- R2：`yuyi-ai-notes-images`
- KV：`yuyi-ai-notes-cache`
- Queue：`yuyi-ai-notes-background-jobs`

## 首次部署

### 1. 安装依赖和准备环境变量

```bash
npm install
cp .env.example .env.local
```

至少填写：

```env
ADMIN_PASSWORD=change-me
ADMIN_TOKEN_SALT=change-me-to-a-random-string
AI_CONFIG_ENCRYPTION_SECRET=change-me-to-another-random-string
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 初始化 Cloudflare 资源

```bash
npm run cf:init -- --site-url=https://your-domain.com
```

如果需要启用公共缓存 KV：

```bash
npm run cf:init -- --site-url=https://your-domain.com --with-kv
```

这一步会生成本地的 `wrangler.local.toml`，并写入真实 D1 / R2 / KV 绑定。

### 4. 设置 secrets

```bash
npx wrangler secret put ADMIN_PASSWORD -c wrangler.local.toml
npx wrangler secret put ADMIN_TOKEN_SALT -c wrangler.local.toml
npx wrangler secret put AI_CONFIG_ENCRYPTION_SECRET -c wrangler.local.toml
```

如果需要外部 AI：

```bash
npx wrangler secret put AI_API_KEY -c wrangler.local.toml
```

### 5. 生成类型并部署

```bash
npm run cf-typegen
npm run build
npm run deploy
```

## 本地 Worker 预览

```bash
npm run preview
```

脚本会优先读取 `wrangler.local.toml`。仓库中的 `wrangler.toml` 不包含真实资源 ID，首次部署前应先运行 `npm run cf:init`。

## 日常更新

```bash
git pull
npm install
npm run verify
npm run deploy
```

## 常见问题

### `npm run deploy` 提示缺少 D1 或 R2

先执行：

```bash
npm run cf:init -- --site-url=https://your-domain.com
```

### 后台登录提示鉴权未配置完成

至少补齐：

```bash
npx wrangler secret put ADMIN_PASSWORD -c wrangler.local.toml
npx wrangler secret put ADMIN_TOKEN_SALT -c wrangler.local.toml
```

### AI Provider 已保存的 Key 无法识别

通常是 `AI_CONFIG_ENCRYPTION_SECRET` 或 `ADMIN_TOKEN_SALT` 被修改了。建议固定 `AI_CONFIG_ENCRYPTION_SECRET`，不要和 token salt 混用。

### RSS / sitemap / canonical 指向错误域名

检查：

- `.env.local`
- `wrangler.local.toml`

两处的 `NEXT_PUBLIC_SITE_URL` 应保持一致，生产环境统一使用你的真实域名。当前文档中的占位域名为：

```text
https://your-domain.com
```

## 许可证

本项目基于开源博客项目二次改造，具体许可信息见 [LICENSE](LICENSE)。不要删除或改写 LICENSE 中的原许可声明。
