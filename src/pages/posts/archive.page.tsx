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
    date: string
  }>
}

const PostsList: CustomNextPage<PageProps> = ({ posts }) => {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Posts</h1>
      <ul className={styles.list}>
        {posts.map(({ title, path, date }) => (
          <li key={path}>
            <div className={styles.item}>
              <time dateTime={date}>{date}</time>
              <Link href={path} className={styles.postLink}>
                {title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

PostsList.getTitle = () => 'posts(archive)'

export default PostsList

export const getStaticProps: GetStaticProps<PageProps> = (context) => {
  const allParams = getAllPostsParams()
  const posts = allParams
    .map(({ params: { year, date, slug } }) => {
      const { title, archive } = matterMarkdown(`${year}/${date}/${slug}`).data
      return {
        title,
        path: `/posts/${year}/${date}/${slug}`,
        date: `${year}-${date.slice(0, 2)}-${date.slice(2, 4)}`,
        archive: archive ?? false,
      }
    })
    .filter(({ archive }) => archive)
  return {
    props: {
      posts,
    },
  }
}
