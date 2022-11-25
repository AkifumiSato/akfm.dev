import styles from './Section.module.css'
import React from 'react'

export const Section: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <section className={styles.section}>{children}</section>
