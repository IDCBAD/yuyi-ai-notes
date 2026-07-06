export const brand = {
  siteName: '余一的AI观察备忘录',
  shortName: '余一',
  englishName: 'YuYi AI Notes',
  authorName: '余一',
  description: '记录 AI、Agent、RPA 自动化、FDE、产品化思考、学习笔记和长期项目记录。',
  siteUrl: {
    development: 'http://localhost:3000',
    production: 'https://your-domain.com',
  },
  social: {
    githubUrl: '',
    githubLabel: 'TODO',
    twitterUrl: '',
    twitterHandle: '',
    twitterLabel: 'TODO',
  },
  rss: {
    title: '余一的AI观察备忘录',
    description: '记录 AI、Agent、自动化与个人成长中的观察、实践和思考。',
  },
  seo: {
    title: '余一的AI观察备忘录',
    titleTemplate: '%s · 余一的AI观察备忘录',
    description: '记录 AI、Agent、RPA 自动化、FDE、产品化思考、学习笔记和长期项目记录。',
    locale: 'zh_CN',
    twitterCard: 'summary_large_image',
  },
  jsonLd: {
    websiteType: 'WebSite',
    organizationType: 'Organization',
    authorType: 'Person',
    logoPath: '/icon-512.png',
  },
  defaultTheme: 'editorial',
  defaultFont: 'serif',
} as const

export type BrandConfig = typeof brand

export function getBrandSiteUrl(nodeEnv = process.env.NODE_ENV): string {
  return nodeEnv === 'development' ? brand.siteUrl.development : brand.siteUrl.production
}
