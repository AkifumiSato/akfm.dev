import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import { CustomNextPage } from '@/pages/page'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import React from 'react'
import styles from './index.module.css'

type PageProps = {
  posts: Array<{
    title: string
    path: string
  }>
}

const PostsList: CustomNextPage<PageProps> = ({ posts }) => {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Posts</h1>
      <ul>
        {posts.map(({ title, path }) => (
          <li key={path}>
            <Link href={path}>{title}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

PostsList.getTitle = () => 'posts'

export default PostsList

export const getStaticProps: GetStaticProps<PageProps> = (context) => {
  const allParams = getAllPostsParams()
  const posts = allParams.map(({ params: { year, date, slug } }) => {
    const { title } = matterMarkdown(`${year}/${date}/${slug}`).data
    return {
      title,
      path: `/posts/${year}/${date}/${slug}`,
    }
  })
  return {
    props: {
      posts,
    },
  }
}
