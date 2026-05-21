// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  compiler: { reactCompiler: true },
  experimental: { turbopack: false },
};
module.exports = nextConfig;
