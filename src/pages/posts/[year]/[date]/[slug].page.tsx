import { Section } from '@/components/Section'
import { getAllPostsParams } from '@/lib/server/posts/getAllPostsParams'
import { marked } from 'marked'
import { GetStaticPaths, GetStaticProps } from 'next'
import { matterMarkdown } from '@/lib/server/posts/matterMarkdown'
import { CustomNextPage } from '@/pages/page'
import styles from './page.module.css'

type Post = {
  year: string
  date: string
  slug: string
}

type PageProps = {
  content: string
  data: {
    title: string
  }
}

function parsePost({ year, date, slug }: Post) {
  try {
    const post = matterMarkdown(`${year}/${date}/${slug}`)
    return {
      ...post,
      content: marked.parse(post.content),
    }
  } catch (e) {
    throw new Error(`${year}/${date}/${slug}: not found markdown.`)
  }
}

const Post: CustomNextPage<PageProps> = ({ content, data }) => {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{data.title}</h1>
      <Section html={content} />
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
    },
  }
}

export default Post
