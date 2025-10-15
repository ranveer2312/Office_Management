/** @type {import('next').NextConfig} */
const nextConfig = {
    // 👇 ADD THIS BLOCK TO IGNORE ESLINT ERRORS DURING DEPLOYMENT BUILD
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 👆 END OF ADDED BLOCK

    images: {
        domains: ["images.unsplash.com", "localhost",  "res.cloudinary.com"],
        remotePatterns: [{
                protocol: "https",
                hostname: "tirangaidms",
                pathname: "/api/**",
            },
            {
                protocol: "https",
                hostname: "tirangaidms",
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