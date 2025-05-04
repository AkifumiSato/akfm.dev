import Link from "next/link";
import type { ReactNode } from "react";

function Page() {
  return (
    <main className="flex flex-col gap-y-10">
      <div className="py-15 border-b border-gray-700 w-auto">
        <h1 className="logo-text text-5xl font-bold w-fit">akfm.dev</h1>
      </div>
      <Section title="Name">
        <p>Akifumi Sato.</p>
      </Section>
      <Section title="About">
        <p>Web application developer interested in Rust / Typescript.</p>
      </Section>
      <Section title="Links">
        <ul className="list-disc pl-5 underline decoration-solid">
          <li>
            <a href="https://zenn.dev/akfm" target="_blank" rel="noreferrer">
              zenn.dev
            </a>
          </li>
          <li>
            <Link href="/posts">blog</Link>
          </li>
          <li>
            <a href="https://x.com/akfm_sato" target="_blank" rel="noreferrer">
              X
            </a>
          </li>
          <li>
            <a
              href="https://github.com/AkifumiSato"
              target="_blank"
              rel="noreferrer"
            >
              github
            </a>
          </li>
        </ul>
      </Section>
    </main>
  );
}

export default Page;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-y-5">
      <h2 className="font-bold text-2xl text-gray-500">{title}</h2>
      <div className="text-ls text-gray-300">{children}</div>
    </section>
  );
}
