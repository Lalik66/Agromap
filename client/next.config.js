/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig; 