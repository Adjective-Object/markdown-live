'use strict';
const webpack = require('webpack');
const common = require('../common/common.js');

// add web as target platform
common.addPlatform('electron');

module.exports = {
  name: 'client',
  context: __dirname,
  entry: {
    vendor: common.vendor,
  },
  output: {
    path: common.dist('electron/assets/js'),
    filename: 'client.lib.js',
    library: '[name]_lib',
  },
  plugins: [
    new webpack.DllPlugin({
      path: common.vendorDll,
      name: '[name]_lib',
    }),
  ],
};
