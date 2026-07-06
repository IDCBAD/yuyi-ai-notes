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
    githubUrl: 'https://github.com/IDCBAD',
    githubLabel: 'IDCBAD',
    twitterUrl: 'https://x.com/hook_xiao',
    twitterHandle: '@hook_xiao',
    twitterLabel: '@hook_xiao',
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

export function getBrandTerminalHandle(config: BrandConfig = brand): string {
  const firstToken = (config.englishName || config.shortName || config.siteName).trim().split(/\s+/)[0] || ''
  return firstToken.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'blog'
}

export function getBrandTerminalPrompt(config: BrandConfig = brand): string {
  return `${getBrandTerminalHandle(config)}@blog:~$`
}

function getLastUrlSegment(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.pathname.split('/').filter(Boolean).at(-1) || ''
  } catch {
    return ''
  }
}

export function getBrandSocialLinks(config: BrandConfig = brand) {
  const links: Array<{ label: string; displayName: string; url: string; openInNewTab: boolean }> = []
  if (config.social.githubUrl) {
    links.push({
      label: 'GitHub',
      displayName: config.social.githubLabel || getLastUrlSegment(config.social.githubUrl) || 'GitHub',
      url: config.social.githubUrl,
      openInNewTab: true,
    })
  }
  if (config.social.twitterUrl) {
    links.push({
      label: 'Twitter/X',
      displayName:
        config.social.twitterLabel ||
        config.social.twitterHandle ||
        getLastUrlSegment(config.social.twitterUrl) ||
        'Twitter/X',
      url: config.social.twitterUrl,
      openInNewTab: true,
    })
  }
  return links
}

export function isBrandSocialLinkLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase().replace(/^~\//, '')
  return normalized === 'github' || normalized === 'twitter' || normalized === 'twitter/x' || normalized === 'x'
}

export function getBrandSiteUrl(nodeEnv = process.env.NODE_ENV): string {
  return nodeEnv === 'development' ? brand.siteUrl.development : brand.siteUrl.production
}
