import styles from './Section.module.css'
import React from 'react'

type Props = {
  children?: React.ReactNode
  html?: string
}

export const Section: React.FC<Props> = ({ children, html }) =>
  html ? (
    <section
      className={styles.section}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  ) : (
    <section className={styles.section}>{children}</section>
  )
