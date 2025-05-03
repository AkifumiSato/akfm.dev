import { getAllPostsParams } from "@/lib/server/posts/getAllPostsParams";
import { matterMarkdown } from "@/lib/server/posts/matterMarkdown";
import React from "react";
import PostList from "./PostList";
import styles from "./common.module.css";

export const metadata = {
  title: "posts - akfm.dev",
};

async function PostsPage() {
  const posts = readAllPosts();
  return (
    <main className={styles.main}>
      <PostList title="Posts" posts={posts} />
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
