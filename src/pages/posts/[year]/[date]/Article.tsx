import styles from './Article.module.css'
import React from 'react'

type Props = {
  html: string
}

export const Article: React.FC<Props> = ({ html }) => (
  <article
    className={styles.article}
    dangerouslySetInnerHTML={{
      __html: html,
    }}
  />
)
