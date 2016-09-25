'use strict';
const webpack = require('webpack');
const common = require('../common/common.js');
const fs = require('fs');

// add web as target platform
common.addPlatform('electron');

module.exports = common.extend({
  name: 'client',
  entry: './client/js/client.js',
  output: {
    path: common.dist('electron/assets/js'),
    filename: 'client.js',
  },
  plugins: [
      new webpack.DllReferencePlugin({
          context: '.',
          manifest: JSON.parse(fs.readFileSync(common.vendorDll))
      })
  ],
  target: 'electron'
});

