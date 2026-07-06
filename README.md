# 余一的AI观察备忘录

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/IDCBAD/yuyi-ai-notes)
[![Use this template](https://img.shields.io/badge/GitHub-Use%20this%20template-111111?logo=github)](https://github.com/IDCBAD/yuyi-ai-notes/generate)

余一的AI观察备忘录是一个面向个人长期写作和项目记录的博客项目，英文名为 YuYi AI Notes。

它用于记录 AI、Agent、RPA 自动化、FDE、产品化思考、学习笔记和长期项目记录。项目基于开源博客项目二次个人化改造，保留了完整的前后台能力、AI 写作能力、默认主题、搜索、RSS、PWA 和 Cloudflare 部署链路。具体许可信息见 [LICENSE](LICENSE)。

- 当前仓库：<https://github.com/IDCBAD/yuyi-ai-notes>
- 本地开发地址：<http://localhost:3000>
- 生产域名占位：<https://your-domain.com>

## 功能特性

- 前台博客页面和后台管理页面
- 文章编辑、发布、草稿、隐藏、密码访问
- 分类、标签、搜索、RSS、sitemap、robots
- 多套首页主题，默认主题为 `editorial`
- 默认字体为 `serif`
- AI 写作辅助、摘要生成、标签生成、slug 生成
- AI 生图配置和历史记录
- 图片上传、封面设置、裁剪和替换
- API Token 和外部发布接口
- Cloudflare Workers + D1 + R2 部署

## 截图预览

### 首页主题

![首页主题](docs/screenshots/home-themes.webp)

### 编辑器

![编辑器](docs/screenshots/editor-overview.webp)

### Ask AI

![Ask AI](docs/screenshots/ask-ai.png)

### 后台设置

![后台设置](docs/screenshots/admin-settings.webp)

### 发布状态

![发布状态](docs/screenshots/publish-states.png)

### AI 图片配置

![AI 图片配置](docs/screenshots/image-provider.png)

## 本地开发

```bash
git clone https://github.com/IDCBAD/yuyi-ai-notes.git
cd yuyi-ai-notes
npm install
cp .env.example .env.local
npm run dev
```

常用入口：

- 首页：`/`
- 后台：`/admin`
- 编辑器：`/editor`

默认本地地址：

```text
http://localhost:3000
```

## 部署到 Cloudflare

可以使用页面顶部的 `Deploy to Cloudflare` 按钮，也可以使用 CLI 手动初始化资源。

手动部署流程：

```bash
npm install
cp .env.example .env.local
npx wrangler login
npm run cf:init -- --site-url=https://your-domain.com
npm run build
npm run deploy
```

默认 Cloudflare 资源名：

- Worker：`yuyi-ai-notes`
- D1：`yuyi-ai-notes-db`
- R2：`yuyi-ai-notes-images`
- KV：`yuyi-ai-notes-cache`
- Queue：`yuyi-ai-notes-background-jobs`

常用环境变量：

- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SALT`
- `AI_CONFIG_ENCRYPTION_SECRET`
- `AI_API_KEY`

更完整的部署说明见 [DEPLOY.md](DEPLOY.md)。

## 默认初始化内容

首次初始化后，项目会写入：

- 默认导航
- 默认主题和字体
- 默认分类
- AI 文本动作模板
- AI 文章元数据生成模板
- AI 封面生成模板

默认导航会指向：

- GitHub：<https://github.com/IDCBAD>
- Twitter/X：<https://x.com/hook_xiao>
- Admin：`/admin`
- RSS：`/feed.xml`

默认封面资源位于：

- `/default-covers/yy-cover-1.png`
- `/default-covers/yy-cover-2.png`
- `/default-covers/yy-cover-3.png`

## 技术栈

- Next.js 16
- React 19
- TypeScript
- OpenNext for Cloudflare
- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- Novel / Tiptap
- Vitest
- ESLint

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 构建应用 |
| `npm run verify:quick` | 运行 lint、test、build |
| `npm run verify` | 运行完整验证 |
| `npm run cf:init` | 初始化 Cloudflare 资源和默认数据 |
| `npm run preview` | 本地预览 Worker 运行时 |
| `npm run deploy` | 部署到 Cloudflare Workers |

## 作者

- 余一
- GitHub：<https://github.com/IDCBAD>
- Twitter/X：<https://x.com/hook_xiao>
- Blog：<https://your-domain.com>

## 许可证

本项目基于开源博客项目二次改造，具体许可信息见 [LICENSE](LICENSE)。
