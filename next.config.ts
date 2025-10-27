import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
