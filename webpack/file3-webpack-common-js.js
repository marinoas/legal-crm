const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {
  const portal = env.portal || 'admin';
  
  return {
    entry: {
      [portal]: path.resolve(__dirname, `../src/apps/${portal}/index.tsx`),
    },
    
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: `${portal}/js/[name].[contenthash].js`,
      chunkFilename: `${portal}/js/[name].[contenthash].chunk.js`,
      publicPath: '/',
      clean: false, // We handle cleaning manually
    },
    
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@apps': path.resolve(__dirname, '../src/apps'),
        '@shared': path.resolve(__dirname, '../src/shared'),
        '@features': path.resolve(__dirname, '../src/features'),
        '@store': path.resolve(__dirname, '../src/store'),
        '@theme': path.resolve(__dirname, '../src/theme'),
        '@config': path.resolve(__dirname, '../src/config'),
        '@locales': path.resolve(__dirname, '../src/locales'),
        '@hooks': path.resolve(__dirname, '../src/shared/hooks'),
        '@components': path.resolve(__dirname, '../src/shared/components'),
        '@services': path.resolve(__dirname, '../src/shared/services'),
        '@utils': path.resolve(__dirname, '../src/shared/utils'),
        '@types': path.resolve(__dirname, '../src/shared/types'),
      },
    },
    
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-transform-runtime', { regenerator: true }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: `${portal}/images/[name].[hash][ext]`,
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: `${portal}/fonts/[name].[hash][ext]`,
          },
        },
        {
          test: /\.pdf$/,
          type: 'asset/resource',
          generator: {
            filename: `${portal}/documents/[name].[hash][ext]`,
          },
        },
      ],
    },
    
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${portal}/**/*`],
        dangerouslyAllowCleanPatternsOutsideProject: true,
        dry: false,
      }),
      
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/index.html'),
        filename: `${portal}/index.html`,
        chunks: [portal],
        inject: true,
        title: `Legal CRM - ${portal.charAt(0).toUpperCase() + portal.slice(1)} Portal`,
        meta: {
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
          'theme-color': '#1976d2',
          description: 'Legal CRM System - Professional Law Office Management',
        },
        favicon: path.resolve(__dirname, '../public/favicon.ico'),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, '../public/assets'),
            to: `${portal}/assets`,
            noErrorOnMissing: true,
          },
          {
            from: path.resolve(__dirname, '../public/locales'),
            to: `${portal}/locales`,
            noErrorOnMissing: true,
          },
        ],
      }),
      
      new Dotenv({
        path: path.resolve(__dirname, `../.env.${portal}`),
        safe: false,
        allowEmptyValues: true,
        systemvars: true,
        silent: true,
        defaults: path.resolve(__dirname, '../.env'),
      }),
    ],
    
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: `${portal}-vendors`,
            priority: 10,
            reuseExistingChunk: true,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: `${portal}-mui`,
            priority: 20,
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
            name: `${portal}-common`,
          },
        },
      },
      runtimeChunk: {
        name: `${portal}-runtime`,
      },
    },
    
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};