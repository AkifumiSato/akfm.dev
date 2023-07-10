import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import PostList from '../PostList'
import React from 'react'
import styles from '../common.module.css'

export const metadata = {
  title: 'posts(archive) - akfm.dev',
}

export default function PostsPage() {
  const posts = readAllPosts()
  return (
    <main className={styles.main}>
      <PostList title="Posts - Archive" posts={posts} />
    </main>
  )
}

const readAllPosts = () => {
  const allParams = getAllPostsParams()
  return allParams
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
}
