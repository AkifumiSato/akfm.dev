import { NextPage } from 'next'
import { AppProps } from 'next/app'
import { ReactElement } from 'react'

type GetTitle<T extends Record<string, unknown>> = (props: T) => string
type GetLayout = (page: ReactElement) => ReactElement

export type CustomApp = {
  Component: {
    getTitle?: GetTitle
    getLayout?: GetLayout
  } & AppProps['Component']
} & AppProps

export type CustomNextPage<P = {}, IP = P> = NextPage<P, IP> & {
  getTitle?: GetTitle<P>
  getLayout?: GetLayout
}
