const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "localhost", "www.tirangaaerospace.com", "idmstiranga.online", "res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "idmstiranga.online",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "idmstiranga.online",
        port: "8080",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**", // ✅ allows all paths under res.cloudinary.com
      },
    ],
  },
};

module.exports = nextConfig;
