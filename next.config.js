/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_SHOW_SSO_LOGIN_BUTTON:
      process.env.NEXT_PUBLIC_SHOW_SSO_LOGIN_BUTTON,
    NEXT_PUBLIC_FORCE_SSO_AUTH: process.env.NEXT_PUBLIC_FORCE_SSO_AUTH,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
