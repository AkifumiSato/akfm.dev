import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { Article } from './Article'
import { Metadata } from 'next'
import { MarkdownMera, matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import React from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeExternalLinks from 'rehype-external-links'
import shiki from 'shiki'
import withShiki from '@stefanprobst/rehype-shiki'
import rehypeStringify from 'rehype-stringify'
import styles from './page.module.css'

type Post = {
  year: string
  date: string
  slug: string
}

type PageProps = {
  content: string
  params: Post
} & MarkdownMera

async function parsePost({ year, date, slug }: Post) {
  try {
    const post = matterMarkdown(`${year}/${date}/${slug}`)
    const highlighter = await shiki.getHighlighter({ theme: 'github-dark' })
    const file = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(withShiki, { highlighter })
      .use(rehypeExternalLinks, { target: '_blank' })
      .use(rehypeStringify)
      .process(post.content)

    return {
      ...post,
      content: String(file),
    }
  } catch (e) {
    throw new Error(`${year}/${date}/${slug}: not found markdown.`)
  }
}

export default async function PostPage({ params }: { params: Post }) {
  const { content, data } = await parsePost(params)
  const { year, date } = params
  const dateTime = `${year}-${date.slice(0, 2)}-${date.slice(2, 4)}`
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <time dateTime={dateTime} className={styles.date}>
          {dateTime}
        </time>
        <h1 className={styles.title}>{data.title}</h1>
      </div>
      {data.archive && (
        <div className={styles.archive}>
          この記事はArchiveされているため、情報が更新されていない可能性があります。
        </div>
      )}
      <Article html={content} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Post
}): Promise<Metadata> {
  const { data } = await parsePost(params)
  return {
    title: `${data.title} - akfm.dev`,
  }
}

export function generateStaticParams() {
  return getAllPostsParams()
}
