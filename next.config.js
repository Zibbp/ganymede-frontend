/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    API_URL: process.env.API_URL || process.env.NUXT_PUBLIC_API_URL,
    CDN_URL: process.env.CDN_URL || process.env.NUXT_PUBLIC_CDN_URL,
    SHOW_SSO_LOGIN_BUTTON: process.env.SHOW_SSO_LOGIN_BUTTON,
    FORCE_SSO_AUTH: process.env.FORCE_SSO_AUTH,
    REQUIRE_LOGIN: process.env.REQUIRE_LOGIN,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  generateBuildId: async () => {
    // Get the latest commit hash from git
    const gitHash = process.env.GITHUB_SHA || 'development';
    // Get the current date
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${month}-${day}`;
    // Return the build id
    return `${gitHash}-${dateString}`;
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.CONFIG_BUILD_ID": JSON.stringify(buildId),
      })
    );
    return config;
  },
};

module.exports = nextConfig;
