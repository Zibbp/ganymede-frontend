/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
    CDN_URL: process.env.CDN_URL,
    SHOW_SSO_LOGIN_BUTTON: process.env.SHOW_SSO_LOGIN_BUTTON,
    FORCE_SSO_AUTH: process.env.FORCE_SSO_AUTH,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
