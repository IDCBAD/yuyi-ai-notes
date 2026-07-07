import { describe, expect, it } from 'vitest'
import {
  canPlayArticleCrispTocSound,
  clearArticleCrispTocAnimationFrame,
  getArticleCrispTocBallTop,
  getArticleCrispTocRootClassName,
  getNearestArticleCrispTocIndex,
  shouldPlayArticleCrispTocDragTick,
  shouldRenderArticleCrispToc,
} from '@/components/ArticleCrispToc'

describe('ArticleCrispToc helpers', () => {
  it('does not render without toc items', () => {
    expect(shouldRenderArticleCrispToc([])).toBe(false)
  })

  it('positions the rail handle at the measured item center', () => {
    expect(getArticleCrispTocBallTop(0, [18, 64, 126])).toBe(18)
    expect(getArticleCrispTocBallTop(2, [18, 64, 126])).toBe(126)
    expect(getArticleCrispTocBallTop(8, [18, 64, 126])).toBe(126)
  })

  it('finds the nearest measured item center while dragging the rail handle', () => {
    expect(getNearestArticleCrispTocIndex([20, 74, 160], 22)).toBe(0)
    expect(getNearestArticleCrispTocIndex([20, 74, 160], 90)).toBe(1)
    expect(getNearestArticleCrispTocIndex([20, 74, 160], 150)).toBe(2)
  })

  it('only plays drag tick sound when dragging crosses to another toc item', () => {
    expect(shouldPlayArticleCrispTocDragTick(null, 0, true, true)).toBe(false)
    expect(shouldPlayArticleCrispTocDragTick(0, 0, true, true)).toBe(false)
    expect(shouldPlayArticleCrispTocDragTick(0, 1, true, true)).toBe(true)
    expect(shouldPlayArticleCrispTocDragTick(0, 1, false, true)).toBe(false)
    expect(shouldPlayArticleCrispTocDragTick(0, 1, true, false)).toBe(false)
  })

  it('respects sound setting and reduced motion preference', () => {
    expect(canPlayArticleCrispTocSound(true, false)).toBe(true)
    expect(canPlayArticleCrispTocSound(false, false)).toBe(false)
    expect(canPlayArticleCrispTocSound(true, true)).toBe(false)
  })

  it('clears a canceled animation frame so navigation can schedule sync again', () => {
    const frameRef = { current: 42 }
    const canceled: number[] = []

    clearArticleCrispTocAnimationFrame(frameRef, (handle) => canceled.push(handle))

    expect(canceled).toEqual([42])
    expect(frameRef.current).toBeNull()
  })

  it('marks the toc root collapsed only when collapsed by the user', () => {
    expect(getArticleCrispTocRootClassName(false)).toBe('article-crisp-toc')
    expect(getArticleCrispTocRootClassName(true)).toBe('article-crisp-toc is-collapsed')
  })
})
