import type { NextRequest as NextRequestOrg } from 'next/dist/server/web/spec-extension/request'
import type { NextResponse as NextResponseOrg } from 'next/dist/server/web/spec-extension/response'

const NextRequest = {} as NextRequestOrg

const NextResponse = {
  redirect: jest.fn((arg: unknown) => arg),
} as any as NextResponseOrg

export { NextRequest, NextResponse }
