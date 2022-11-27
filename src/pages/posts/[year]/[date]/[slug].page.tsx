import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { Article } from '@/pages/posts/[year]/[date]/Article'
import { marked } from 'marked'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MarkdownMera, matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import { CustomNextPage } from '@/pages/page'
import React from 'react'
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

const renderer = new marked.Renderer()
renderer.link = (href, title, text) =>
  `<a href="${href}" title=${title} target="_blank">${text}</a>`

function parsePost({ year, date, slug }: Post) {
  try {
    const post = matterMarkdown(`${year}/${date}/${slug}`)
    return {
      ...post,
      content: marked.parse(post.content, { renderer }),
    }
  } catch (e) {
    throw new Error(`${year}/${date}/${slug}: not found markdown.`)
  }
}

const Post: CustomNextPage<PageProps> = ({ content, data, params }) => {
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

Post.getTitle = ({ data }) => `${data.title}`

export const getStaticPaths: GetStaticPaths<Post> = async () => {
  return {
    paths: getAllPostsParams(),
    fallback: false, // can also be true or 'blocking'
  }
}

export const getStaticProps: GetStaticProps<PageProps, Post> = async ({
  params,
}) => {
  if (params === undefined) throw new Error('not found params.')
  const { content, data } = parsePost(params)
  return {
    props: {
      content,
      data,
      params,
    },
  }
}

export default Post
