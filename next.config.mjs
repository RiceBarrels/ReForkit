import removeImports from 'next-remove-imports';
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import withTMFactory from "next-transpile-modules";

const withTM = withTMFactory(["monaco-editor"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
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
    
    return config;
  },
};

const removeImportsConfig = removeImports({
  ...nextConfig,
  experimental: { esmExternals: true }
});

const configWithMonaco = withTM({
  ...removeImportsConfig,
  webpack: (config, { isServer }) => {
    // Add the CSS loader first
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
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
});

export default configWithMonaco;
