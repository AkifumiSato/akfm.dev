import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import { CustomNextPage } from '@/pages/page'
import { Post } from './type'
import PostList from './PostList'
import { GetStaticProps } from 'next'
import React from 'react'
import styles from './common.module.css'

type PageProps = {
  posts: Array<Post>
}

const PostsPage: CustomNextPage<PageProps> = ({ posts }) => {
  return (
    <main className={styles.main}>
      <PostList title="Posts - Archive" posts={posts} />
    </main>
  )
}

PostsPage.getTitle = () => 'posts(archive)'

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
    .filter(({ archive }) => archive)
  return {
    props: {
      posts,
    },
  }
}
