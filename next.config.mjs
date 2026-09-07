/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // @xenova/transformers dynamically requires some node-only files (sharp, onnxruntime-node)
    // that don't need to be bundled for the client — only the API route uses this package.
    serverComponentsExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

export default nextConfig;
