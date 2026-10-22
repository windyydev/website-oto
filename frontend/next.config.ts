import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/cars",
        destination: "/xe",
        permanent: true,
      },
      {
        source: "/admin/dashboard",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/xe-dang-ban",
        destination: "/xe",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
