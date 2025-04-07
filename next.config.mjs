import removeImports from 'next-remove-imports';
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

/** @type {import('next').NextConfig} */
const baseConfig = {
  transpilePackages: ['monaco-editor'],
  webpack: (config, { isServer }) => {
    // Add CSS loader configuration
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        'postcss-loader'
      ],
    });
    
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript", "typescript", "json", "html", "css", "python", "java", "c", "c++", "c#", "go", "rust", "php", "ruby", "swift", "kotlin", "scala", "haskell", "erlang", "elixir", "dart", "sass", "scss"],
          filename: "static/chunks/[name].worker.[hash].js",
        })
      );
    }
    return config;
  },
};

const removeImportsConfig = removeImports({
  ...baseConfig,
  experimental: { esmExternals: true }
});

export default removeImportsConfig;
