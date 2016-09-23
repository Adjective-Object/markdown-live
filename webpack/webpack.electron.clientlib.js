'use strict';
const webpack = require('webpack');
const common = require('./common');
const path = require('path');
const _ = require('underscore');

// add web as target platform
common.addPlatform('electron');

module.exports = {
  name: 'client',
  context: __dirname,
  entry: {
    vendor: common.vendor
  },
  output: {
    path: path.join(common.projectRoot, 'dist/electron/assets/js'),
    filename: 'client.lib.js',
    library: '[name]_lib'
  },
  plugins: [
    new webpack.DllPlugin({
        path: common.electronVendorDll,
        name: '[name]_lib'
    })
  ],
}