import styles from './Section.module.css'
import React from 'react'

type Props = {
  children: React.ReactNode
}

export const Section: React.FC<Props> = ({ children }) => (
  <section className={styles.section}>{children}</section>
)
