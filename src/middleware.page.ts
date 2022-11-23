import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
function middlewarePage(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (
    request.nextUrl.pathname.startsWith('/blog') &&
    request.nextUrl.pathname.endsWith('.html')
  ) {
    // todo replace new URL
    console.log('request.nextUrl.pathname', request.nextUrl.pathname)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export default middlewarePage

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/about', '/blog/:path*'],
}
