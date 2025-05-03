import type React from "react";
import styles from "./Article.module.css";

type Props = {
  html: string;
};

export const Article: React.FC<Props> = ({ html }) => (
  <article
    className={styles.article}
    dangerouslySetInnerHTML={{
      __html: html,
    }}
  />
);
