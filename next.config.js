const CopyWebpackPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    API_URL: process.env.API_URL || process.env.NUXT_PUBLIC_API_URL,
    CDN_URL: process.env.CDN_URL || process.env.NUXT_PUBLIC_CDN_URL,
    SHOW_SSO_LOGIN_BUTTON: process.env.SHOW_SSO_LOGIN_BUTTON,
    FORCE_SSO_AUTH: process.env.FORCE_SSO_AUTH,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          { from: "node_modules/hls.js/dist/hls.min.js", to: "../public/dist" },
        ],
      })
    );

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
