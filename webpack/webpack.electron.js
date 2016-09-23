'use strict';
const webpack = require('webpack');
const common = require('./common');
const fs = require('fs');
const path = require('path');
const electronExec = path.resolve(
  path.join(__dirname, "../node_modules/electron/dist/electron")
);
console.log(electronExec);

// add web as target platform
common.addPlatform('electron');

module.exports = common.extend({
  name: 'electron',
  entry: './electron/app.js',
  output: {
    path: 'dist/electron',
    filename: 'main.js',
  },
  plugins: [
    new webpack.BannerPlugin('require("source-map-support").install();',
     { raw: true, entryOnly: false }),
    new webpack.BannerPlugin(
      'require("electron-reload")(__dirname, {main: "main.js", electron: "' + electronExec + '"});', { 
        raw: true,
        entryOnly: false
    }),
    new webpack.DefinePlugin({
      $dirname: '__dirname',
      $require: 'require',
    }),
  ],
  electron: {
    __filename: true,
    __dirname: true
  },
  target: 'electron',
  externals: common.nodeModules,
});
