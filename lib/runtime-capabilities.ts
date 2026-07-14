export interface RuntimeCapabilities {
  bindings: {
    d1: boolean
    cache: boolean
    images: boolean
    queue: boolean
    vectorize: boolean
  }
  features: {
    asyncJobs: {
      enabled: boolean
      strategy: 'queue' | 'inline'
      note: string
    }
    mediaPipeline: {
      enabled: boolean
      strategy: 'cloudflare' | 'client'
      note: string
    }
    relatedContent: {
      enabled: boolean
      strategy: 'vectorize' | 'fts'
      note: string
    }
  }
}

function readFlag(value: unknown): boolean {
  return typeof value === 'string' && ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

export function detectRuntimeCapabilities(env?: Partial<CloudflareEnv> | null): RuntimeCapabilities {
  const bindings = {
    d1: Boolean(env?.DB),
    cache: Boolean(env?.CACHE),
    images: Boolean(env?.IMAGES),
    queue: Boolean(env?.BACKGROUND_QUEUE),
    vectorize: Boolean(env?.VECTOR_INDEX),
  }

  const asyncJobsEnabled = bindings.queue && readFlag(env?.ENABLE_BACKGROUND_JOBS)
  const vectorizeEnabled = bindings.vectorize && readFlag(env?.ENABLE_VECTOR_SEARCH)
  const cloudflareMediaEnabled = bindings.images && readFlag(env?.ENABLE_CF_IMAGE_PIPELINE)

  return {
    bindings,
    features: {
      asyncJobs: {
        enabled: asyncJobsEnabled,
        strategy: asyncJobsEnabled ? 'queue' : 'inline',
        note: asyncJobsEnabled
          ? '使用 Cloudflare Queues 处理后台任务。'
          : '未启用队列时使用请求内处理或 waitUntil。',
      },
      mediaPipeline: {
        enabled: true,
        strategy: cloudflareMediaEnabled ? 'cloudflare' : 'client',
        note: cloudflareMediaEnabled
          ? '启用 Cloudflare 图片处理链路。'
          : '默认使用浏览器侧压缩，R2 原图链路仍可用。',
      },
      relatedContent: {
        enabled: true,
        strategy: vectorizeEnabled ? 'vectorize' : 'fts',
        note: vectorizeEnabled
          ? '使用 Vectorize 做语义召回。'
          : '使用 D1/FTS 与规则召回。',
      },
    },
  }
}
