'use strict';
const common = require('../common/common');
const webpack = require('webpack');
const fs = require('fs');

// add web as target platform
common.addPlatform('web');

module.exports = common.extend({
  name: 'client',
  entry: {
    'client': './client/js/client.js',
  },
  output: {
    path: common.dist('web/public/js'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: JSON.parse(fs.readFileSync(common.vendorDll)),
    }),
  ],
});

