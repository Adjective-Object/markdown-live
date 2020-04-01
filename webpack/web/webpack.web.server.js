'use strict';
const common = require('../common/common.js');
const webpack = require('webpack');

// add web as target platform
common.addPlatform('web');

module.exports = common.extend({
  name: 'server',
  entry: './server/app.js',
  target: 'node',
  output: {
    path: common.dist('web/'),
    filename: 'server.js',
    library: 'markdown-live',
    libraryTarget: 'commonjs2',
  },
  plugins: common.devBuild ? [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
  ] : [],
  externals: common.nodeModules,
});
