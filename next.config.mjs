import removeImports from 'next-remove-imports';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config here
};

const removeImportsConfig = removeImports({
  ...nextConfig,
  experimental: { esmExternals: true }
});

export default removeImportsConfig;
