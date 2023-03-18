// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      process.env.SUPABASE_HOSTNAME || 'xxxx.supabase.co', // to prevent vercel failed
      'b.jimmylv.cn',
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

module.exports = withSentryConfig(module.exports, { silent: true }, { hideSourcemaps: true })
