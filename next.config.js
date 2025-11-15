/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sleeper.app',
      },
    ],
  },
};

module.exports = nextConfig;

