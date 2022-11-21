/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  pageExtensions: ['page.tsx', 'page.ts'],
}

module.exports = nextConfig
