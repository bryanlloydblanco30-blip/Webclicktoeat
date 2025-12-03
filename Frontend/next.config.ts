/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ccfd3agjzt.ucarecd.net',
      },
      {
        protocol: 'https',
        hostname: 'uploadcare.com',
      },
    ],
  },
  // Remove the rewrites and headers sections completely
};

export default nextConfig;