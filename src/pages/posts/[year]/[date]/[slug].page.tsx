import matter from 'gray-matter'
import { glob } from 'glob'
import { marked } from 'marked'
import { GetStaticPaths, GetStaticProps } from 'next'
import { parsePostsMarkdown } from '@/lib/server/parsePostsMarkdown'
import { CustomNextPage } from '../../../page'
import styles from './page.module.css'

type Post = {
  year: string
  date: string
  slug: string
}

type PageProps = {
  content: string
  data: Record<string, unknown>
}

function parsePost({ year, date, slug }: Post) {
  try {
    const post = matter(parsePostsMarkdown(`${year}/${date}/${slug}`))
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
    <div className={styles.container}>
      <div className={styles.contents}>
        <main className={styles.main}>
          <h1 className={styles.title}># akfm.dev</h1>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>## date</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
            <div>{JSON.stringify(data)}</div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p className={styles.copyright}>
            ©︎akfm.dev 2022. Using&nbsp;
            <a
              href="app/posts/[year]/[date]/[slug]/page"
              target="_blank"
              rel="noreferrer"
            >
              Google Analytics
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

Post.getTitle = ({ data }) => `${data.title}`

export const getStaticPaths: GetStaticPaths<Post> = async () => {
  const files = glob.sync('posts/[0-9]*/[0-9]*/*.md')

  return {
    paths: files.map((file) => {
      // glob的に必ずmatch
      const [_post, year, date, slugMd] = file.split('/')
      const slug = slugMd.replace('.md', '')
      if (year && date && slug) {
        return {
          params: {
            year,
            date,
            slug,
          },
        }
      }
      throw new Error('/[year]/[date]/[slug]形式である必要があります')
    }),
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
