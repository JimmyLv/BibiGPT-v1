/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      process.env.SUPABASE_HOSTNAME,
      "b.jimmylv.cn",
      "avatars.githubusercontent.com",
      "avatars.dicebear.com",
      "i2.hdslb.com",
      "s3-us-west-2.amazonaws.com",
    ],
  },
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
