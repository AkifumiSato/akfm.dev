import { BaseLayout } from '@/components/BaseLayout'
import { Section } from '@/components/Section'
import { CustomNextPage } from '@/pages/page'
import Link from 'next/link'
import React from 'react'
import styles from './index.module.css'

const Home: CustomNextPage = () => {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>akfm.dev</h1>
      <Section>
        <h2>Name</h2>
        <p>Akifumi Sato.</p>
      </Section>
      <Section>
        <h2>About</h2>
        <p>Web application developer interested in Rust / Typescript.</p>
      </Section>
      <Section>
        <h2>Links</h2>
        <ul>
          <li>
            <a href="https://github.com/AkifumiSato">github</a>
          </li>
          <li>
            <a href="https://zenn.dev/akfm">zenn.dev</a>
          </li>
          <li>
            <a href="https://twitter.com/akfm_sato">twitter</a>
          </li>
          <li>
            <Link href="/posts">posts</Link>
          </li>
          <li>
            <Link href="/posts/archive">posts(archive)</Link>
          </li>
        </ul>
      </Section>
    </main>
  )
}

Home.getLayout = (page) => <BaseLayout>{page}</BaseLayout>

export default Home
