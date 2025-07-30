const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = (env) => {
  const portal = env.portal || 'admin';
  const port = env.port || getPortForPortal(portal);
  
  return merge(common(env), {
    mode: 'development',
    devtool: 'inline-source-map',
    
    devServer: {
      static: {
        directory: path.join(__dirname, '../dist', portal),
      },
      compress: true,
      hot: true,
      port: port,
      open: true,
      historyApiFallback: {
        index: `/${portal}/index.html`,
        rewrites: [
          { from: /^\/admin/, to: '/admin/index.html' },
          { from: /^\/supervisor/, to: '/supervisor/index.html' },
          { from: /^\/secretary/, to: '/secretary/index.html' },
          { from: /^\/client/, to: '/client/index.html' },
        ],
      },
      proxy: {
        '/api': {
          target: process.env.API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          headers: {
            'X-Portal-Type': portal,
          },
        },
        '/socket.io': {
          target: process.env.SOCKET_URL || 'http://localhost:5000',
          ws: true,
          changeOrigin: true,
        },
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
        reconnect: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      onListening: function (devServer) {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        const port = devServer.server.address().port;
        console.log(`\n🚀 ${portal.toUpperCase()} Portal running at: http://localhost:${port}/${portal}\n`);
      },
    },
    
    optimization: {
      runtimeChunk: 'single',
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '../.webpack-cache'),
      buildDependencies: {
        config: [__filename],
      },
    },
    
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000,
    },
  });
};

function getPortForPortal(portal) {
  const ports = {
    admin: 3001,
    supervisor: 3002,
    secretary: 3003,
    client: 3004,
  };
  return ports[portal] || 3000;
}