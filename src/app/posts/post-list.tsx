import Link from "next/link";
import type React from "react";
import styles from "./post-list.module.css";

type Post = {
  title: string;
  path: string;
  date: string;
};

type PageProps = {
  title: string;
  posts: Array<Post>;
};

const PostList: React.FC<PageProps> = ({ title, posts }) => {
  return (
    <article className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <ul className={styles.list}>
        {posts.map(({ title, path, date }) => (
          <li key={path}>
            <div className={styles.item}>
              <time dateTime={date}>{date}</time>
              <Link href={path} className={styles.postLink}>
                {title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default PostList;
