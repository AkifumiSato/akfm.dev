import middlewarePage from '@/middleware.page'
import { NextRequest } from 'next/server'

const reqFactory = ({ pathname, url }: { pathname: string; url: string }) =>
  ({
    url,
    nextUrl: {
      pathname,
    },
  } as NextRequest)

describe('aboutのリダイレクト', () => {
  test('/about`', () => {
    const res = middlewarePage(
      reqFactory({
        pathname: '/about',
        url: 'https://akfm.dev/about',
      })
    )
    expect(res).toStrictEqual(new URL('https://akfm.dev/'))
  })
})

describe('古いURLのリダイレクト', () => {
  test('/blog/2020-12-13/akfm-dev-v2-release.html', () => {
    const req = reqFactory({
      pathname: '/blog/2020-12-13/akfm-dev-v2-release.html',
      url: 'https://akfm.dev/blog/2020-12-13/akfm-dev-v2-release.html',
    })
    const res = middlewarePage(req)
    expect(res).toStrictEqual(new URL('https://akfm.dev/'))
  })
})
