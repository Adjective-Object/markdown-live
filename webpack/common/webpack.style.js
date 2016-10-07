'use strict';
const common = require('./common');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const precss = require('precss');
const autoprefixer = require('autoprefixer');

module.exports = {
  name: 'style',
  context: common.projectRoot,
  entry: common.entryGlob('client/css/*.scss'),
  output: {
    path: 'dist/web/public/css',
    filename: '[name].css',
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
  ],
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          'css-loader?minimize!sass-loader!postcss-loader'
        ),
      },
      {
        test: /\.svg$/,
        loader: 'svg-url-loader',
      },
    ],
  },
  postcss: function applyPostCss() {
    return [precss, autoprefixer];
  },
};
