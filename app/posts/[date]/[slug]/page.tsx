import styles from "./page.module.css";

function parsePost({ date, slug }: { date: string; slug: string }) {
  return new Promise((resolve) => {
    resolve(`date: ${date}, slug: ${slug}`);
  });
}

type Post = {
  params: {
    date: string;
    slug: string;
  };
};

export default async function Post({ params }: Post) {
  const data = await parsePost(params);

  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <main className={styles.main}>
          <h1 className={styles.title}># akfm.dev</h1>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>## date</h2>
            <p>JSON: {JSON.stringify(data)}</p>
          </section>
        </main>

        <footer className={styles.footer}>
          <p className={styles.copyright}>
            ©︎akfm.dev 2022. Using&nbsp;
            <a
              href="app/posts/[date]/[slug]/page"
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
