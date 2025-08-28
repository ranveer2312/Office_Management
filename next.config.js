/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost', 'www.tirangaaerospace.com', 'idmstiranga.online'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'idmstiranga.online',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'idmstiranga.online',
        port: '8080',
        pathname: '/api/**',
      },
      // This is the new entry for Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/daju0j8vi/image/upload/**',
      },
    ],
  },
};

module.exports = nextConfig;