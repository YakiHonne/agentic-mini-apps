/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel optimizations
  experimental: {
    serverComponentsExternalPackages: ['@nostr-dev-kit/ndk'],
  },
}

export default nextConfig
