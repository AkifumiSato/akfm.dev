import { getAllPostsParams } from "@/lib/server/posts/get-all-posts-params";
import { matterMarkdown } from "@/lib/server/posts/matter-markdown";
import withShiki from "@stefanprobst/rehype-shiki";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import shiki from "shiki";
import { unified } from "unified";

type Post = {
  year: string;
  date: string;
  slug: string;
};

async function PostPage({ params }: { params: Promise<Post> }) {
  const { year, date, slug } = await params;
  const { content, data } = await parsePost({ year, date, slug }).catch(() => {
    notFound();
  });
  const dateTime = `${year}-${date.slice(0, 2)}-${date.slice(2, 4)}`;

  return (
    <main className="flex flex-col gap-y-5">
      <div className="border-b border-gray-700 pb-5 flex flex-col gap-y-3">
        <time dateTime={dateTime} className="text-gray-500">
          {dateTime}
        </time>
        <h1 className="text-3xl font-bold">{data.title}</h1>
      </div>
      <article
        className="article"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    </main>
  );
}

export default PostPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<Post>;
}): Promise<Metadata> {
  const { year, date, slug } = await params;
  const { data } = await parsePost({ year, date, slug }).catch(() => {
    notFound();
  });
  return {
    title: `${data.title} - akfm.dev`,
  };
}

export function generateStaticParams() {
  return getAllPostsParams();
}

async function parsePost({ year, date, slug }: Post) {
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
}
