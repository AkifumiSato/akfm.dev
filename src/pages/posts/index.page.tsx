import styles from './index.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>akfm.dev</h1>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Name</h2>
        <p>Akifumi Sato.</p>
      </section>
    </main>
  )
}
