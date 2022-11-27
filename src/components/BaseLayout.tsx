import { Footer } from '@/components/Footer'
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
        <Footer />
      </div>
    </div>
  </>
)
