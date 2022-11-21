import { NextPage } from 'next'
import { AppProps } from 'next/app'
import React from 'react'

type GetTitle<T extends Record<string, unknown>> = (props: T) => string

export type CustomApp = {
  Component: {
    getTitle?: GetTitle
  } & AppProps['Component']
} & AppProps

export type CustomNextPage<P = {}, IP = P> = NextPage<P, IP> & {
  getTitle?: GetTitle<P>
}
