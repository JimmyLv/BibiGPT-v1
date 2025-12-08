// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      process.env.SUPABASE_HOSTNAME || 'xxxx.supabase.co', // to prevent vercel failed
      'b.jimmylv.cn',
      'bibigpt.co',
      'avatars.dicebear.com',
      // "i2.hdslb.com",
      // "avatars.githubusercontent.com",
      // "s3-us-west-2.amazonaws.com",
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_HOSTNAME || ''}/api/:path*`,
      },
      {
        source: '/blocked',
        destination: '/shop',
      },
    ]
  },
}

const shouldEnableSentry = Boolean(process.env.SENTRY_AUTH_TOKEN)

module.exports = shouldEnableSentry
  ? withSentryConfig(nextConfig, { silent: true }, { hideSourceMaps: true })
  : nextConfig
