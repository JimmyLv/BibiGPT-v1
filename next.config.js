/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  /*async rewrites() {
    return {
      fallback: [
        {
          source: '/api/bilibili/:path*',
          destination: `https://api.bilibili.com/:path*`,
        },
      ],
    }
  },*/
};
