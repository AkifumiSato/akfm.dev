import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import Script from "next/script";
import type React from "react";
import "./globals.css";

export const metadata = {
  title: "akfm.dev",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <body className="dark">
        <div className="flex items-center flex-col">
          <div className="flex flex-col gap-y-10 justify-between min-h-dvh akfm-container">
            <div>{children}</div>
            <footer className="flex items-center h-16">
              <p className="text-sm text-gray-400">
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
        <Analytics />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
        </Script>
      </body>
    </html>
  );
}
