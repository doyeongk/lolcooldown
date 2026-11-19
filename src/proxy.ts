import { NextResponse, type NextRequest } from 'next/server'

// The app has no Server Actions, so its pages only ever take GET. Bots POST
// probes at them (`Next-Action: x`, multipart forms), and Next logs each one as
// "Failed to find Server Action" before answering 404 (DOS-485). Answer those
// here, before Next's action handler sees them.
export function proxy(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD') return NextResponse.next()
  return new NextResponse(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
}

export const config = {
  // API routes keep their own methods; static assets never reach a page.
  matcher: ['/((?!api/|_next/static|_next/image|images/|favicon.ico).*)'],
}
