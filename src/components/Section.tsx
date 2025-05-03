import type React from "react";
import styles from "./Section.module.css";

type Props = {
  children: React.ReactNode;
};

export const Section: React.FC<Props> = ({ children }) => (
  <section className={styles.section}>{children}</section>
);
