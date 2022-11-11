import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          # akfm.dev
        </h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>## About</h2>
          <p>Akfiumi Sato.Web application developer interested in Rust / Typescript.</p>
        </section>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>app/page.tsx</code>
        </p>
      </main>
    </div>
  )
}
