'use strict';
const webpack = require('webpack');
const common = require('./common');
const path = require('path');

module.exports = common.extend({
  name: 'client',
  context: __dirname,
  entry: {
    vendor: [
      'domready',
      'underscore',
      'object-hash',
      'gator',
      'prismjs',
      'socket.io-client',
    ],
  },
  output: {
    path: path.join(common.projectRoot, 'dist/public/js/'),
    filename: 'client.lib.js',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
    	'client.lib.js'
),
  ],
});
