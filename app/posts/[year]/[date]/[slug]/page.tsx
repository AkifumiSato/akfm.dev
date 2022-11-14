import matter from "gray-matter";
import { marked } from "marked";
import { parsePostsMarkdown } from "../../../../../src/lib/server/parsePostsMarkdown";
import styles from "./page.module.css";
import type { PageProps, Post } from "./type";

function parsePost({ year, date, slug }: Post) {
  try {
    const post = matter(parsePostsMarkdown(`${year}/${date}/${slug}`));
    return {
      ...post,
      content: marked.parse(post.content),
    };
  } catch (e) {
    throw new Error("not found page.");
  }
}

export default async function Post({ params }: PageProps) {
  const { content, data } = parsePost(params);

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
  );
}
