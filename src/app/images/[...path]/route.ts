import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Next snapshots public/ at startup, so images the seed downloads later
// (new champions, new base skins) fall through to this handler instead.
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const SEGMENT = /^[a-z0-9_-][a-z0-9_.-]*$/i
const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path
  const contentType = CONTENT_TYPES[path.extname(segments.at(-1) ?? '').toLowerCase()]
  if (!contentType || segments.length > 3 || !segments.every(s => SEGMENT.test(s))) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const file = await readFile(path.join(IMAGES_DIR, ...segments))
    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
