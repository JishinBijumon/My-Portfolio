/** @type {import('next').NextConfig} */
const basePath = '/myportfolio';

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  distDir: process.env.NEXT_DIST_DIR || '.next',
};
export default nextConfig;
