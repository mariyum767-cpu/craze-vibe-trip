/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    // Skip Next.js's built-in image optimizer entirely — it fetches remote
    // images through your own dev server, which can 500 if that server has
    // limited/blocked outbound internet access. This makes the browser load
    // images directly from their source URL instead (no local proxy step).
    unoptimized: true,
  },
};
module.exports = nextConfig;
