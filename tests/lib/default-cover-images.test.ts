import { describe, expect, it } from 'vitest'

import {
  DEFAULT_COVER_SEED,
  DEFAULT_POST_COVER_IMAGES,
  pickDefaultPostCoverPath,
  resolveDefaultSiteCoverImage,
  resolvePostCoverImage,
} from '@/lib/default-cover-images'

describe('default cover images', () => {
  it('picks a stable default cover for the same seed', () => {
    const first = pickDefaultPostCoverPath({ slug: 'stable-seed', title: 'Same title' })
    const second = pickDefaultPostCoverPath({ slug: 'stable-seed', title: 'Same title' })

    expect(first).toBe(second)
    expect(DEFAULT_POST_COVER_IMAGES).toContain(first)
  })

  it('falls back to a bundled default cover when no explicit cover is set', () => {
    const cover = resolvePostCoverImage(
      { slug: 'missing-cover', title: 'No cover here' },
      { baseUrl: 'https://your-domain.com' },
    )

    expect(cover).toMatch(/^https:\/\/your-domain\.com\/default-covers\/yy-cover-[1-3]\.png$/)
  })

  it('prefers the explicit cover image and resolves relative paths', () => {
    expect(resolvePostCoverImage(
      { cover_image: '/api/images/example.png', slug: 'post-slug', title: 'Post title' },
      { baseUrl: 'https://your-domain.com' },
    )).toBe('https://your-domain.com/api/images/example.png')

    expect(resolvePostCoverImage(
      { cover_image: 'https://cdn.example.com/cover.jpg', slug: 'post-slug', title: 'Post title' },
      { baseUrl: 'https://your-domain.com' },
    )).toBe('https://cdn.example.com/cover.jpg')
  })

  it('resolves the site-wide fallback cover image', () => {
    expect(resolveDefaultSiteCoverImage('https://your-domain.com'))
      .toBe('https://your-domain.com/default-covers/yy-cover-1.png')
  })

  it('uses a neutral fallback seed', () => {
    expect(DEFAULT_COVER_SEED).toBe('yuyi-default-cover')
  })
})
