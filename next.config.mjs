```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // React 19 handles this differently, strict mode is effectively always on for relevant checks
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google User Avatars
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // For GitHub User Avatars
      },
      {
        protocol: 'https',
        hostname: 'files.stripe.com', // For Stripe product images
      }
    ],
  },
  // experimental: {
  //   serverActions: true, // Server Actions are stable in Next.js 14+
  // },
};

export default nextConfig;
```