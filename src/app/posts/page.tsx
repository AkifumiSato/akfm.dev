import { getAllPostsParams } from "@/lib/server/posts/get-all-posts-params";
import { matterMarkdown } from "@/lib/server/posts/matter-markdown";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "posts - akfm.dev",
};

async function PostsPage() {
  const posts = readAllPosts();
  return (
    <main>
      <article className="flex flex-col gap-y-10">
        <h1 className="text-4xl font-bold">Posts</h1>
        <ul className="flex flex-col gap-y-5">
          {posts.map(({ title, path, date }) => (
            <li key={path}>
              <Link
                href={path}
                className="flex flex-col gap-y-3 border-b border-gray-700 pb-5 transition duration-500 hover:opacity-50"
              >
                <time dateTime={date}>{date}</time>
                <div className="text-xl">{title}</div>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}

export default PostsPage;

const readAllPosts = () => {
  const allParams = getAllPostsParams();
  return allParams
    .map(({ year, date, slug }) => {
      const { title, archive } = matterMarkdown(`${year}/${date}/${slug}`).data;
      return {
        title,
        path: `/posts/${year}/${date}/${slug}`,
        date: `${year}-${date.slice(0, 2)}-${date.slice(2, 4)}`,
        archive: archive ?? false,
      };
    })
    .filter(({ archive }) => !archive);
};
