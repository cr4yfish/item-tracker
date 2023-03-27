/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "images.unsplash.com"
      },
      {
        protocol: 'https',
        hostname: "www.themealdb.com"
      },
      {
        protocol: 'https',
        hostname: "www.edamam.com"
      }
    ]
  },
  reactStrictMode: true,
}

module.exports = nextConfig
