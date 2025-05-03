import Link from "next/link";
import type React from "react";
import styles from "./base-layout.module.css";

type Props = {
  children: React.ReactNode;
  header?: boolean;
};

export const BaseLayout: React.FC<Props> = ({ children, header = false }) => (
  <>
    {header && (
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
    )}
    <div className={styles.outer}>
      <div className={styles.container}>
        <div className={styles.inner}>{children}</div>
        <footer className={styles.footer}>
          <p className={styles.copyright}>
            ©︎akfm.dev 2022. Using&nbsp;
            <a
              href="https://www.google.com/intl/ja/policies/privacy/partners/"
              target="_blank"
              rel="noreferrer"
            >
              Google Analytics
            </a>
          </p>
        </footer>
      </div>
    </div>
  </>
);
