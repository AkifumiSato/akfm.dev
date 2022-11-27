import Link from 'next/link'
import styles from './BaseLayout.module.css'
import React, { ReactElement } from 'react'

type Props = {
  children: ReactElement
  header?: boolean
}

export const BaseLayout: React.FC<Props> = ({ children, header = false }) => (
  <>
    <div className={styles.outer}>
      <div className={styles.container}>
        <div className={styles.inner}>
          {header && (
            <header className={styles.header}>
              <Link href="/" className={styles.logoLink}>
                akfm.dev
              </Link>
            </header>
          )}
          {children}
        </div>
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
)
