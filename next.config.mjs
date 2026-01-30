/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack 비활성화 (호환성)
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
