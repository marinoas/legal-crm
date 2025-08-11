const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');

module.exports = (env) => {
  const portal = env.portal || 'admin';
  const analyze = env.analyze === 'true';
  
  const prodConfig = merge(common(env), {
    mode: 'production',
    devtool: 'source-map',
    
    output: {
      path: require('path').resolve(__dirname, `../dist/${portal}`),
      filename: `js/[name].[contenthash].js`,
      chunkFilename: `js/[name].[contenthash].chunk.js`,
      publicPath: `/`,
      crossOriginLoading: 'anonymous',
      clean: true,
    },
    
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    
    plugins: [
      new MiniCssExtractPlugin({
        filename: `css/[name].[contenthash].css`,
        chunkFilename: `css/[id].[contenthash].css`,
      }),
      
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.REACT_APP_PORTAL': JSON.stringify(portal),
        'process.env.REACT_APP_VERSION': JSON.stringify(require('../package.json').version),
        'process.env.REACT_APP_BUILD_TIME': JSON.stringify(new Date().toISOString()),
      }),
      
      // Content Security Policy
      new webpack.BannerPlugin({
        banner: `
/*! Legal CRM - ${portal.toUpperCase()} Portal
 * Copyright (c) ${new Date().getFullYear()} Your Law Firm
 * Licensed under proprietary license
 * Build: ${new Date().toISOString()}
 */`,
        raw: true,
      }),
    ],
    
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          parallel: true,
          extractComments: false,
        }),
      ],
      
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
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
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            name: `${portal}-react`,
            priority: 30,
          },
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux|redux)[\\/]/,
            name: `${portal}-redux`,
            priority: 25,
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
      
      moduleIds: 'deterministic',
    },
    
    performance: {
      hints: 'warning',
      maxAssetSize: 512000,
      maxEntrypointSize: 512000,
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      },
    },
    
    stats: {
      children: false,
      chunks: false,
      chunkModules: false,
      modules: false,
      reasons: false,
    },
  });
  
  if (analyze) {
    prodConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: `bundle-report.html`,
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: `stats.json`,
      })
    );
  }
  
  return prodConfig;
};
