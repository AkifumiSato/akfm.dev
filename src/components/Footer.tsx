import styles from './Footer.module.css'
import React from 'react'

export const Footer: React.FC = () => (
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
)
