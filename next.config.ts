import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
