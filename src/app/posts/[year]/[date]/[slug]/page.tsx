import { getAllPostsParams } from "@/lib/server/posts/get-all-posts-params";
import {
  type MarkdownMera,
  matterMarkdown,
} from "@/lib/server/posts/matter-markdown";
import withShiki from "@stefanprobst/rehype-shiki";
import type { Metadata } from "next";
import React from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import shiki from "shiki";
import { unified } from "unified";
import { Article } from "./article";
import styles from "./page.module.css";

type Post = {
  year: string;
  date: string;
  slug: string;
};

type PageProps = {
  content: string;
  params: Post;
} & MarkdownMera;

async function parsePost({ year, date, slug }: Post) {
  try {
    const post = matterMarkdown(`${year}/${date}/${slug}`);
    const highlighter = await shiki.getHighlighter({ theme: "github-dark" });
    const file = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(withShiki, { highlighter })
      .use(rehypeExternalLinks, { target: "_blank" })
      .use(rehypeStringify)
      .process(post.content);

    return {
      ...post,
      content: String(file),
    };
  } catch (e) {
    throw new Error(`${year}/${date}/${slug}: not found markdown.`);
  }
}

export default async function PostPage({ params }: { params: Post }) {
  const { content, data } = await parsePost(params);
  const { year, date } = params;
  const dateTime = `${year}-${date.slice(0, 2)}-${date.slice(2, 4)}`;
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
  );
}

export async function generateMetadata({
  params,
}: {
  params: Post;
}): Promise<Metadata> {
  const { data } = await parsePost(params);
  return {
    title: `${data.title} - akfm.dev`,
  };
}

export function generateStaticParams() {
  return getAllPostsParams();
}
