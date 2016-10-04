'use strict';
const common = require('./common/common.js');
const webpack = require('webpack');
const combineLoaders = require('webpack-combine-loaders');

// add electron as target platform
common.addPlatform('electron');

module.exports = common.compileLazy({
  name: 'electron-tests',
  context: common.projectRoot,
  entry: common.entryGlob('client/tests/!(_)*.js', 'server/tests/!(_)*.js'),
  platform: 'node',
  node: {fs: 'empty'},
  output: {
    path: common.dist('tests/electron/'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.BannerPlugin(
      'require("source-map-support").install();', {
        raw: true,
        entryOnly: false,
      }),
  ],
  loaders: [
    {
      test: /\.handlebars$/,
      loader: common.handlebarsLoaderPath,
      query: { runtime: common.handlebarsRuntimePath },
    },
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: combineLoaders([
        {
          loader: 'babel-loader',
          query: {
            'presets': ['es2015'],
            'plugins': ['transform-flow-strip-types'],
          },
        },
        {
          loader: 'mocha-loader',
        },
      ]),
    },
  ],
  externals: common.nodeModules,
});
