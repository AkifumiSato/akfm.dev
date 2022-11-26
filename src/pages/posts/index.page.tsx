import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import { CustomNextPage } from '@/pages/page'
import PostList from '@/pages/posts/PostList'
import { Post } from '@/pages/posts/type'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import React from 'react'
import styles from './common.module.css'

type PageProps = {
  posts: Array<Post>
}

const PostsPage: CustomNextPage<PageProps> = ({ posts }) => {
  return (
    <main className={styles.main}>
      <PostList title="Posts" posts={posts} />
      <div className={styles.filter}>
        <h2>Other</h2>
        <Link href="/posts/archive" className={styles.archiveLink}>
          archive posts
        </Link>
      </div>
    </main>
  )
}

PostsPage.getTitle = () => 'posts'

export default PostsPage

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
    .filter(({ archive }) => !archive)
  return {
    props: {
      posts,
    },
  }
}
