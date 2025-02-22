import removeImports from 'next-remove-imports';
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import withTMFactory from "next-transpile-modules";

const withTM = withTMFactory(["monaco-editor"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config here
};

const removeImportsConfig = removeImports({
  ...nextConfig,
  experimental: { esmExternals: true }
});

const configWithMonaco = withTM({
  ...removeImportsConfig,
  webpack: (config) => {
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ["javascript", "typescript", "json", "html", "css"],
        filename: "static/[name].worker.js",
      })
    );
    return config;
  },
});

export default configWithMonaco;
