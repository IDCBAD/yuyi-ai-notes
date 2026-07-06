import { getBrandSiteUrl } from '@/lib/brand'

function parseSiteUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    try {
      return new URL(`https://${value}`)
    } catch {
      return null
    }
  }
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
}

function isPlaceholderHostname(hostname: string): boolean {
  return hostname === 'example.com' || hostname.endsWith('.example.com')
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    const parsed = parseSiteUrl(configured)
    if (parsed) {
      const hostname = parsed.hostname.toLowerCase()
      const isInvalidProductionHost =
        process.env.NODE_ENV === 'production' &&
        (isLocalHostname(hostname) || isPlaceholderHostname(hostname))

      if (!isInvalidProductionHost) {
        return parsed.toString().replace(/\/$/, '')
      }
    }
  }

  return getBrandSiteUrl(process.env.NODE_ENV)
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl())
}

export function getSiteDisplayUrl(): string {
  return getSiteUrl().replace(/^https?:\/\//, '')
}
