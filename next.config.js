// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: { reactCompiler: true },
  experimental: { turbopack: false },
};
module.exports = nextConfig;
