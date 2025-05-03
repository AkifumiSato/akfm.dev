import Link from "next/link";
import type React from "react";
import styles from "./layout.module.css";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logoLink}>
            akfm.dev
          </Link>
          <ul className={styles.headerMenu}>
            <li>
              <Link href="/" className={styles.headerMenuLink}>
                about
              </Link>
            </li>
            <li>
              <Link href="/posts" className={styles.headerMenuLink}>
                posts
              </Link>
            </li>
          </ul>
        </div>
      </header>
      <div className={styles.container}>{children}</div>
    </>
  );
}
