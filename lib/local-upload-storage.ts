interface LocalUploadMetadata {
  contentType: string
  originalName?: string
}

async function getLocalUploadPath(key: string) {
  const path = await import('node:path')
  const root = path.resolve(process.cwd(), '.local-uploads')
  const target = path.resolve(root, ...key.split('/').filter(Boolean))

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error('Invalid local upload path')
  }

  return { root, target }
}

async function readMetadata(pathname: string): Promise<LocalUploadMetadata> {
  const fs = await import('node:fs/promises')
  try {
    const raw = await fs.readFile(`${pathname}.json`, 'utf8')
    const parsed = JSON.parse(raw) as Partial<LocalUploadMetadata>
    return {
      contentType: parsed.contentType || 'application/octet-stream',
      originalName: parsed.originalName,
    }
  } catch {
    return { contentType: 'application/octet-stream' }
  }
}

export function canUseLocalUploadStorage(hasImagesBinding: boolean) {
  if (process.env.NODE_ENV === 'production') return false
  if (process.env.VITEST) return false

  return !hasImagesBinding || process.env.npm_lifecycle_event === 'dev'
}

export async function putLocalUploadedFile(
  key: string,
  file: File,
  metadata: LocalUploadMetadata,
) {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const { target } = await getLocalUploadPath(key)

  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, new Uint8Array(await file.arrayBuffer()))
  await fs.writeFile(`${target}.json`, JSON.stringify(metadata), 'utf8')
}

export async function getLocalUploadedFile(key: string) {
  const fs = await import('node:fs/promises')
  const { target } = await getLocalUploadPath(key)
  const [bytes, metadata, stat] = await Promise.all([
    fs.readFile(target),
    readMetadata(target),
    fs.stat(target),
  ])

  return {
    bytes,
    contentType: metadata.contentType,
    size: stat.size,
  }
}
