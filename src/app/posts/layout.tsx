import Link from "next/link";
import type React from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-header backdrop-blur-sm fixed top-0 left-0 right-0 w-full max-w-dvw h-20 flex justify-center">
        <div className="akfm-container flex justify-between items-center">
          <Link href="/" className="logo-text text-2xl font-bold">
            akfm.dev
          </Link>
          <ul className="flex gap-x-10 underline decoration-solid">
            <li>
              <Link href="/">about</Link>
            </li>
            <li>
              <Link href="/posts">posts</Link>
            </li>
          </ul>
        </div>
      </header>
      <div className="pt-20">{children}</div>
    </>
  );
}
