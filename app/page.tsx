import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <main className={styles.main}>
          <h1 className={styles.title}># akfm.dev</h1>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>## Name</h2>
            <p>Akifumi Sato.</p>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>## About</h2>
            <p>Web application developer interested in Rust / Typescript.</p>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>## Links</h2>
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
            </ul>
          </section>
        </main>

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
  );
}
