export interface ArticleTocItem {
  id: string
  text: string
  level: 2 | 3
}

const HEADING_PATTERN = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi

function decodeBasicEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function getHeadingText(value: string) {
  return decodeBasicEntities(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function getExistingId(attrs: string) {
  const match = attrs.match(/\sid=(["'])(.*?)\1/i)
  return match?.[2]?.trim() || ''
}

function slugifyHeading(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}\-_]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || fallback
}

function uniqueId(base: string, counts: Map<string, number>) {
  const current = counts.get(base) ?? 0
  counts.set(base, current + 1)
  return current === 0 ? base : `${base}-${current + 1}`
}

export function prepareArticleHtmlWithToc(html: string) {
  const counts = new Map<string, number>()
  const toc: ArticleTocItem[] = []
  let index = 0

  const preparedHtml = html.replace(HEADING_PATTERN, (full, levelRaw: string, attrs: string, inner: string) => {
    const text = getHeadingText(inner)
    if (!text) return full

    const level = Number(levelRaw) as 2 | 3
    const existingId = getExistingId(attrs)
    const id = existingId || uniqueId(slugifyHeading(text, `section-${index + 1}`), counts)
    index += 1
    toc.push({ id, text, level })

    if (existingId) return full

    return `<h${levelRaw}${attrs} id="${id}">${inner}</h${levelRaw}>`
  })

  return { html: preparedHtml, toc }
}
