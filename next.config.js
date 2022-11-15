/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  pageExtensions: ["page.tsx"],
};

module.exports = nextConfig;
