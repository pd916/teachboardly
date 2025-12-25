import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   reactStrictMode: false,
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // allow all paths under this domain
      },
    ],
  },
  //  eslint: {
  //   ignoreDuringBuilds: true,
  // },
  experimental: { 
    optimizeCss: false,  
  },
  
};

export default nextConfig;
