# 余一的AI观察备忘录

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/IDCBAD/yuyi-ai-notes)
[![GitHub](https://img.shields.io/badge/GitHub-IDCBAD%2Fyuyi--ai--notes-111111?logo=github)](https://github.com/IDCBAD/yuyi-ai-notes)

这是一个面向个人长期写作、项目记录和知识发布的博客项目，英文名为 **YuYi AI Notes**。

当前线上版本的目标很明确：先保证博客稳定上线，保留前台展示、后台文章管理、Obsidian 发布、Cloudflare 部署能力；暂时移除线上不需要的 AI、微信发布等高成本能力，确保可以运行在 Cloudflare Workers Free 限制内。

本项目基于开源博客项目二次个人化改造，具体许可信息见 [LICENSE](LICENSE)。

## 当前状态

- 线上地址：[https://blog.yuyi-ai.top](https://blog.yuyi-ai.top)
- GitHub 仓库：[https://github.com/IDCBAD/yuyi-ai-notes](https://github.com/IDCBAD/yuyi-ai-notes)
- package name：`yuyi-ai-notes`
- Worker name：`yuyi-ai-notes`
- D1：`yuyi-ai-notes-db`
- R2：`yuyi-ai-notes-images`
- KV：`yuyi-ai-notes-cache`

## 保留功能

- 前台博客首页、文章页、分类页、搜索页、RSS、sitemap、robots。
- 后台登录与会话管理。
- 后台文章列表、文章编辑、发布、草稿、隐藏、置顶、删除。
- 分类管理。
- 导航、主题、字体、自定义代码、发布 Token 等基础设置。
- 图片上传、文章封面设置、图片裁剪、R2 图片存储。
- Obsidian 或外部工具通过 API 发布文章。
- Cloudflare Workers + D1 + R2 + KV 部署。

## 暂时移除的能力

这些能力不是当前线上博客的核心路径，已经从线上入口和接口中移除：

- AI 文本生成。
- AI 摘要、标签、slug、封面生成。
- AI 生图。
- Workers AI binding。
- 微信公众号发布。
- WeChat bridge。
- 公众号格式复制。
- PDF 导出。

项目中可能仍保留部分历史辅助代码或未来可复用代码，但当前后台和线上接口不再暴露这些功能。

## 后续可扩展方向

- 更完整的 Obsidian 发布插件流程。
- 文章备份、导入、导出。
- 文章访问统计。
- 更好的搜索体验。
- 图片管理后台。
- 评论系统。
- 站点分析与 SEO 优化。
- 独立重做后台管理系统。
- 重新设计 AI 写作能力，但建议作为独立服务接入，不再直接塞进主 Worker。
- 微信发布能力可以未来独立成桥接服务，避免影响主站部署包大小。

## 本地开发

```bash
git clone https://github.com/IDCBAD/yuyi-ai-notes.git
cd yuyi-ai-notes
npm install
cp .env.example .env.local
npm run dev
```

常用地址：

- 首页：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`
- 编辑器：`http://localhost:3000/editor`

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run lint` | 代码检查 |
| `npm run test:run` | 运行测试 |
| `npm run build` | Next.js 构建 |
| `npm run verify:quick` | 快速验证：lint + test + build |
| `npm run cf:init` | 初始化 Cloudflare 资源和默认数据 |
| `npm run preview` | 本地预览 Worker |
| `npm run deploy` | 部署到 Cloudflare Workers |

## 开发流程

每次改功能建议使用独立分支：

```bash
git pull --ff-only
git switch -c feature/your-change
npm run dev
```

开发完成后先验证：

```bash
npm run verify:quick
```

确认无误后提交：

```bash
git add -A
git commit -m "feat: your change"
git push -u origin feature/your-change
```

合并到 `main` 后再部署。

## Cloudflare 首次部署流程

适合 Windows + Git Bash / WSL 环境。

1. 登录 Cloudflare：

```bash
npx wrangler login
```

2. 初始化 Cloudflare 资源：

```bash
npm run cf:init -- --site-url=https://blog.yuyi-ai.top
```

这一步会创建或写入本地部署配置，包括：

- D1 database
- R2 bucket
- KV namespace
- `wrangler.local.toml`
- 数据库表结构
- 默认站点数据

`wrangler.local.toml` 包含真实资源 ID，默认不提交到 Git。

3. 设置后台登录密钥：

```bash
npx wrangler secret put ADMIN_PASSWORD -c wrangler.local.toml
npx wrangler secret put ADMIN_TOKEN_SALT -c wrangler.local.toml
```

4. 构建并检查包体：

```bash
rm -rf .open-next bundled
npx opennextjs-cloudflare build
npx wrangler deploy .open-next/worker.js --dry-run --outdir bundled -c wrangler.local.toml
```

Cloudflare Workers Free 需要 gzip 后小于 3 MiB。当前版本 dry-run 结果约为：

```text
Total Upload: 9317.39 KiB / gzip: 2178.07 KiB
```

5. 部署到线上：

```bash
npx wrangler deploy .open-next/worker.js -c wrangler.local.toml --domain blog.yuyi-ai.top
```

6. 验证线上访问：

```bash
curl -I https://blog.yuyi-ai.top/
curl -I https://blog.yuyi-ai.top/admin/login
```

期望返回 `200`。

## 日常上线流程

每次上线前执行：

```bash
npm run verify:quick
```

再做 Cloudflare dry-run：

```bash
rm -rf .open-next bundled
npx opennextjs-cloudflare build
npx wrangler deploy .open-next/worker.js --dry-run --outdir bundled -c wrangler.local.toml
```

确认包体和绑定无误后部署：

```bash
npx wrangler deploy .open-next/worker.js -c wrangler.local.toml --domain blog.yuyi-ai.top
```

## GitHub 仓库维护建议

- `main` 分支保持可部署状态。
- 新功能使用 `feature/*` 分支。
- 修复问题使用 `fix/*` 分支。
- 每次提交前运行 `npm run verify:quick`。
- `.env.local`、`wrangler.local.toml`、`.open-next`、`bundled` 不提交到 Git。
- 重要上线版本建议打 tag，例如：

```bash
git tag v0.1.0
git push origin v0.1.0
```

## 数据安全提醒

- `ADMIN_PASSWORD`、`ADMIN_TOKEN_SALT` 只放在 Cloudflare Secret 或本地 `.env.local`。
- `wrangler.local.toml` 包含真实 Cloudflare 资源 ID，不建议提交。
- 修改数据库结构前先备份 D1。
- 删除 D1 / R2 / KV 前确认线上数据已经备份。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- OpenNext for Cloudflare
- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- Cloudflare KV
- Novel / Tiptap
- Vitest
- ESLint

## 作者

- 作者：余一
- GitHub：[https://github.com/IDCBAD](https://github.com/IDCBAD)
- Twitter/X：[https://x.com/hook_xiao](https://x.com/hook_xiao)
- Blog：[https://blog.yuyi-ai.top](https://blog.yuyi-ai.top)

## 许可

本项目基于开源博客项目二次改造，具体许可信息见 [LICENSE](LICENSE)。
