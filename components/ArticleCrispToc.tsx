"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { ChevronDown, List, Volume2, VolumeX } from 'lucide-react'

export interface ArticleCrispTocItem {
  id: string
  label: string
  level?: number
}

interface ArticleCrispTocProps {
  items: ArticleCrispTocItem[]
  contentSelector?: string
  ariaLabel?: string
  soundEnabled?: boolean
}

const HEADING_OFFSET = 120
const SOUND_STORAGE_KEY = 'article-crisp-toc-sound'
const TICK_MIN_SPACING = 0.035
let tocAudioContext: AudioContext | null = null
let lastTickStartTime: number | undefined

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function shouldRenderArticleCrispToc(items: ArticleCrispTocItem[]) {
  return items.length > 0
}

export function getArticleCrispTocRootClassName(isCollapsed: boolean) {
  return `article-crisp-toc${isCollapsed ? ' is-collapsed' : ''}`
}

export function clearArticleCrispTocAnimationFrame(
  frameRef: { current: number | null },
  cancelFrame: (handle: number) => void,
) {
  if (frameRef.current === null) return
  cancelFrame(frameRef.current)
  frameRef.current = null
}

export function getArticleCrispTocBallTop(activeIndex: number, itemCenters: number[]) {
  if (itemCenters.length === 0) return 0
  return itemCenters[clamp(activeIndex, 0, itemCenters.length - 1)] ?? 0
}

export function getNearestArticleCrispTocIndex(itemCenters: number[], localY: number) {
  if (itemCenters.length === 0) return 0

  return itemCenters.reduce((nearestIndex, center, index) => {
    const nearest = itemCenters[nearestIndex] ?? 0
    return Math.abs(center - localY) < Math.abs(nearest - localY) ? index : nearestIndex
  }, 0)
}

export function canPlayArticleCrispTocSound(enabled: boolean, prefersReducedMotion: boolean) {
  return enabled && !prefersReducedMotion
}

export function shouldPlayArticleCrispTocDragTick(
  previousIndex: number | null,
  nextIndex: number,
  isDragging: boolean,
  canPlaySound: boolean,
) {
  return isDragging && canPlaySound && previousIndex !== null && previousIndex !== nextIndex
}

function getArticleCrispTocAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioContextCtor =
    window.AudioContext ??
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioContextCtor) return null

  if (!tocAudioContext) {
    tocAudioContext = new AudioContextCtor()
  }

  if (tocAudioContext.state === 'suspended') {
    void tocAudioContext.resume()
  }

  return tocAudioContext
}

function getNextArticleCrispTocTickStartTime(
  currentTime: number,
  lastScheduled: number | undefined,
) {
  if (lastScheduled === undefined) return currentTime
  return Math.max(currentTime, lastScheduled + TICK_MIN_SPACING)
}

function playArticleCrispTocTickSound() {
  const context = getArticleCrispTocAudioContext()
  if (!context) return

  const now = getNextArticleCrispTocTickStartTime(context.currentTime, lastTickStartTime)
  lastTickStartTime = now

  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const filter = context.createBiquadFilter()

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(940, now)
  oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.032)

  filter.type = 'highpass'
  filter.frequency.setValueAtTime(420, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.022, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.052)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)

  oscillator.start(now)
  oscillator.stop(now + 0.06)
}

export function ArticleCrispToc({
  items,
  contentSelector = '.rich-content',
  ariaLabel = '文章目录',
  soundEnabled = true,
}: ArticleCrispTocProps) {
  const tocItems = useMemo(
    () => items.filter((item) => item.id && item.label),
    [items],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [itemCenters, setItemCenters] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundEnabled)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const frameRef = useRef<number | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const canPlaySound = canPlayArticleCrispTocSound(
    soundEnabled && isSoundEnabled,
    prefersReducedMotion,
  )

  const getHeading = useCallback(
    (index: number) => document.getElementById(tocItems[index]?.id ?? ''),
    [tocItems],
  )

  const measureItemCenters = useCallback(() => {
    const root = rootRef.current
    if (!root) return

    const rootRect = root.getBoundingClientRect()
    const centers = tocItems.map((_, index) => {
      const item = itemRefs.current[index]
      if (!item) return 0
      const rect = item.getBoundingClientRect()
      return rect.top - rootRect.top + rect.height / 2
    })

    setItemCenters(centers)
  }, [tocItems])

  const getActiveIndex = useCallback(() => {
    if (tocItems.length === 0) return 0

    const anchor = window.scrollY + HEADING_OFFSET
    let nextIndex = 0

    for (let index = 0; index < tocItems.length; index += 1) {
      const heading = getHeading(index)
      if (!heading) continue

      const top = heading.getBoundingClientRect().top + window.scrollY
      if (anchor >= top) {
        nextIndex = index
      }
    }

    const nearPageEnd =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8
    if (nearPageEnd) {
      nextIndex = tocItems.length - 1
    }

    return nextIndex
  }, [getHeading, tocItems.length])

  const syncActiveFromScroll = useCallback(() => {
    frameRef.current = null
    if (dragIndexRef.current !== null) return
    setActiveIndex(getActiveIndex())
  }, [getActiveIndex])

  useEffect(() => {
    if (!shouldRenderArticleCrispToc(tocItems)) return

    const requestSync = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(syncActiveFromScroll)
    }

    requestSync()
    window.addEventListener('scroll', requestSync, { passive: true })

    return () => {
      window.removeEventListener('scroll', requestSync)
      clearArticleCrispTocAnimationFrame(frameRef, window.cancelAnimationFrame)
    }
  }, [syncActiveFromScroll, tocItems])

  useEffect(() => {
    if (!shouldRenderArticleCrispToc(tocItems)) return

    measureItemCenters()

    const root = rootRef.current
    const content = document.querySelector<HTMLElement>(contentSelector)
    const observer = new ResizeObserver(measureItemCenters)

    if (root) observer.observe(root)
    if (content) observer.observe(content)
    window.addEventListener('resize', measureItemCenters)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureItemCenters)
    }
  }, [contentSelector, measureItemCenters, tocItems])

  useEffect(() => {
    measureItemCenters()
  }, [activeIndex, measureItemCenters])

  useEffect(() => {
    setIsSoundEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SOUND_STORAGE_KEY)
      if (stored === 'off') setIsSoundEnabled(false)
      if (stored === 'on') setIsSoundEnabled(true)
    } catch {
      // Keep the in-memory default if localStorage is unavailable.
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)

    return () => {
      mediaQuery.removeEventListener('change', updatePreference)
    }
  }, [])

  const scrollToIndex = useCallback(
    (index: number, updateHash: boolean, behavior: ScrollBehavior = 'smooth') => {
      const nextIndex = clamp(index, 0, tocItems.length - 1)
      const target = getHeading(nextIndex)
      if (!target) return

      setActiveIndex(nextIndex)
      target.scrollIntoView({ behavior, block: 'start' })

      if (updateHash) {
        history.replaceState(null, '', `#${tocItems[nextIndex].id}`)
      }
    },
    [getHeading, tocItems],
  )

  const updateDrag = useCallback(
    (clientY: number) => {
      const root = rootRef.current
      if (!root || tocItems.length === 0) return

      const rootRect = root.getBoundingClientRect()
      const nextIndex = getNearestArticleCrispTocIndex(itemCenters, clientY - rootRect.top)
      const previousIndex = dragIndexRef.current

      if (shouldPlayArticleCrispTocDragTick(previousIndex, nextIndex, true, canPlaySound)) {
        playArticleCrispTocTickSound()
      }

      dragIndexRef.current = nextIndex
      scrollToIndex(nextIndex, false, 'auto')
    },
    [canPlaySound, itemCenters, scrollToIndex, tocItems.length],
  )

  const finishDrag = useCallback(() => {
    const finalIndex = dragIndexRef.current
    dragIndexRef.current = null
    setIsDragging(false)
    document.body.style.userSelect = ''

    if (finalIndex !== null && tocItems[finalIndex]) {
      history.replaceState(null, '', `#${tocItems[finalIndex].id}`)
    }
  }, [tocItems])

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      document.body.style.userSelect = 'none'
      setIsDragging(true)
      if (canPlaySound) {
        getArticleCrispTocAudioContext()
      }
      updateDrag(event.clientY)
    },
    [canPlaySound, updateDrag],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      event.preventDefault()
      updateDrag(event.clientY)
    },
    [isDragging, updateDrag],
  )

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      event.preventDefault()
      event.currentTarget.releasePointerCapture(event.pointerId)
      finishDrag()
    },
    [finishDrag, isDragging],
  )

  if (!shouldRenderArticleCrispToc(tocItems)) {
    return null
  }

  const activeDotTop = getArticleCrispTocBallTop(activeIndex, itemCenters)
  const SoundIcon = canPlaySound ? Volume2 : VolumeX

  return (
    <nav ref={rootRef} className={getArticleCrispTocRootClassName(isCollapsed)} aria-label={ariaLabel}>
      <div className="article-crisp-toc__toolbar">
        <button
          type="button"
          className="article-crisp-toc__collapse-toggle"
          aria-label={isCollapsed ? 'Expand article toc' : 'Collapse article toc'}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? 'Expand article toc' : 'Collapse article toc'}
          onClick={() => setIsCollapsed((current) => !current)}
        >
          <List size={15} strokeWidth={1.9} aria-hidden />
          <ChevronDown size={15} strokeWidth={1.9} aria-hidden />
        </button>

        <button
          type="button"
          className={`article-crisp-toc__sound-toggle ${canPlaySound ? 'is-enabled' : ''}`}
          aria-label={isSoundEnabled ? 'Disable toc drag sound' : 'Enable toc drag sound'}
          aria-pressed={canPlaySound}
          title={
            prefersReducedMotion
              ? 'Sound paused by reduced motion preference'
              : isSoundEnabled
                ? 'Disable toc drag sound'
                : 'Enable toc drag sound'
          }
          onClick={() => {
            const nextEnabled = !isSoundEnabled
            setIsSoundEnabled(nextEnabled)
            try {
              window.localStorage.setItem(SOUND_STORAGE_KEY, nextEnabled ? 'on' : 'off')
            } catch {
              // Keep the in-memory setting if localStorage is unavailable.
            }
          }}
        >
          <SoundIcon size={14} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      <div
        className={`article-crisp-toc__rail-layer ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span
          className="article-crisp-toc__ball"
          style={{ transform: `translateY(${activeDotTop}px) translateY(-50%)` }}
          aria-hidden
        />
      </div>

      <ol className="article-crisp-toc__list">
        {tocItems.map((item, index) => {
          const isActive = index === activeIndex
          const isLevelThree = item.level === 3
          const distance = Math.abs(index - activeIndex)
          const strength = distance === 0 ? 1 : distance === 1 ? 0.45 : 0

          return (
            <li
              key={`${item.id}-${index}`}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              className={`article-crisp-toc__row ${
                isActive ? 'is-active' : ''
              } ${isLevelThree ? 'is-level-3' : 'is-level-2'}`}
            >
              <span className="article-crisp-toc__rail-cell" aria-hidden>
                <span
                  className={`article-crisp-toc__tick ${
                    isActive ? 'is-active' : ''
                  } ${distance === 1 ? 'is-near' : ''}`}
                  style={{ ['--toc-tick-strength' as string]: strength }}
                />
              </span>
              <a
                href={`#${item.id}`}
                title={item.label}
                className="article-crisp-toc__item"
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToIndex(index, true)
                }}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
