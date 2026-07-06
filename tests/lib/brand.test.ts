import { describe, expect, it } from 'vitest'

import {
  brand,
  getBrandSiteUrl,
  getBrandSocialLinks,
  getBrandTerminalPrompt,
  isBrandSocialLinkLabel,
} from '@/lib/brand'

describe('brand config', () => {
  it('exposes the personal blog identity in one place', () => {
    expect(brand.siteName).toBe('余一的AI观察备忘录')
    expect(brand.shortName).toBe('余一')
    expect(brand.englishName).toBe('YuYi AI Notes')
    expect(brand.authorName).toBe('余一')
    expect(brand.defaultTheme).toBe('editorial')
    expect(brand.defaultFont).toBe('serif')
  })

  it('uses localhost in development and the configured production URL otherwise', () => {
    expect(getBrandSiteUrl('development')).toBe('http://localhost:3000')
    expect(getBrandSiteUrl('production')).toBe('https://your-domain.com')
  })

  it('derives visible navigation helpers without old author links', () => {
    expect(getBrandTerminalPrompt()).toBe('yuyi@blog:~$')
    expect(getBrandSocialLinks()).toEqual([
      {
        label: 'GitHub',
        displayName: 'IDCBAD',
        url: 'https://github.com/IDCBAD',
        openInNewTab: true,
      },
      {
        label: 'Twitter/X',
        displayName: '@hook_xiao',
        url: 'https://x.com/hook_xiao',
        openInNewTab: true,
      },
    ])
    expect(isBrandSocialLinkLabel('GitHub')).toBe(true)
    expect(isBrandSocialLinkLabel('~/twitter')).toBe(true)
    expect(isBrandSocialLinkLabel('Twitter/X')).toBe(true)
    expect(isBrandSocialLinkLabel('RSS')).toBe(false)
  })
})
