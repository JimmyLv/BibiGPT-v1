/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: "/blocked",
          destination: "/shop",
        },
      ],
    };
  },
};
