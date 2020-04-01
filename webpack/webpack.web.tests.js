'use strict';
const common = require('./common/common.js');
const webpack = require('webpack');

// add web as target platform
common.addPlatform('web');

module.exports = common.extend({
  name: 'server',
  entry: common.entryGlob('./server/tests/!(_)*.js'),
  target: 'node',
  output: {
    path: common.dist('tests/web'),
    filename: '[name].js',
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
