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
      filename: `${portal}/js/[name].[contenthash:8].js`,
      chunkFilename: `${portal}/js/[name].[contenthash:8].chunk.js`,
      assetModuleFilename: `${portal}/assets/[name].[contenthash:8][ext]`,
      publicPath: '/',
      clean: false,
      pathinfo: false, // Improve build performance
    },
    
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@apps': path.resolve(__dirname, '../src/apps'),
        '@shared': path.resolve(__dirname, '../src/shared'),
        '@features': path.resolve(__dirname, '../src/features'),
        '@store': path.resolve(__dirname, '../src/store'),
        '@theme': path.resolve(__dirname, '../src/shared/theme'),
        '@config': path.resolve(__dirname, '../src/config'),
        '@locales': path.resolve(__dirname, '../src/shared/locales'),
        '@hooks': path.resolve(__dirname, '../src/shared/hooks'),
        '@components': path.resolve(__dirname, '../src/shared/components'),
        '@services': path.resolve(__dirname, '../src/shared/services'),
        '@utils': path.resolve(__dirname, '../src/shared/utils'),
        '@types': path.resolve(__dirname, '../src/shared/types'),
      },
      // Improve module resolution performance
      modules: [
        path.resolve(__dirname, '../src'),
        path.resolve(__dirname, '../node_modules'),
        'node_modules'
      ],
      symlinks: false,
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
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                  },
                  modules: false,
                  useBuiltIns: 'usage',
                  corejs: 3
                }],
                ['@babel/preset-react', { 
                  runtime: 'automatic',
                  development: process.env.NODE_ENV === 'development'
                }],
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-transform-runtime', { 
                  regenerator: true,
                  corejs: false,
                  helpers: true,
                  useESModules: true
                }],
                // Production optimizations
                ...(process.env.NODE_ENV === 'production' ? [
                  ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }]
                ] : [])
              ],
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: process.env.NODE_ENV === 'development',
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    ['autoprefixer'],
                    ...(process.env.NODE_ENV === 'production' ? [['cssnano']] : [])
                  ],
                },
              },
            }
          ],
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: process.env.NODE_ENV === 'development',
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    ['autoprefixer'],
                    ...(process.env.NODE_ENV === 'production' ? [['cssnano']] : [])
                  ],
                },
              },
            },
            'sass-loader'
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: `${portal}/images/[name].[contenthash:8][ext]`,
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: `${portal}/fonts/[name].[contenthash:8][ext]`,
          },
        },
        {
          test: /\.pdf$/,
          type: 'asset/resource',
          generator: {
            filename: `${portal}/documents/[name].[contenthash:8][ext]`,
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
          'theme-color': '#1e3a8a',
          description: 'Legal CRM System - Professional Law Office Management',
          'apple-mobile-web-app-capable': 'yes',
          'apple-mobile-web-app-status-bar-style': 'default',
        },
        favicon: path.resolve(__dirname, '../public/favicon.ico'),
        minify: process.env.NODE_ENV === 'production' ? {
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
        } : false,
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
      moduleIds: 'deterministic',
      runtimeChunk: {
        name: `${portal}-runtime`,
      },
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: `${portal}-vendors`,
            priority: -10,
            chunks: 'all',
            enforce: true,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: `${portal}-mui`,
            priority: 20,
            chunks: 'all',
            enforce: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: `${portal}-react`,
            priority: 30,
            chunks: 'all',
            enforce: true,
          },
          shared: {
            test: /[\\/]src[\\/]shared[\\/]/,
            name: `${portal}-shared`,
            priority: 10,
            chunks: 'all',
            minChunks: 1,
          },
        },
      },
      usedExports: true,
      sideEffects: false,
    },
    
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/webpack'),
      buildDependencies: {
        config: [__filename],
      },
    },
    
    stats: {
      preset: 'minimal',
      moduleTrace: true,
      errorDetails: true,
    },
  };
};
