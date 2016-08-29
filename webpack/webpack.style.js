'use strict';
const common = require('./common');
const _ = require('underscore');
const glob = require('glob');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const precss = require('precss');
const autoprefixer = require('autoprefixer');

// figure out the entrypoints
const entryPoints = glob.sync(path.join(__dirname, '../client/css/*.scss'));
const keys = _(entryPoints).map((p) => {
  const base = path.relative(path.dirname(p), p);
  return base.substring(0, base.length - path.extname(base).length);
});
const entry = _.object(keys, entryPoints);

module.exports = {
  name: 'style',
  context: common.projectRoot,
  entry: entry,
  output: {
    path: 'dist/public/css',
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
    ],
  },
  postcss: function applyPostCss() {
    return [precss, autoprefixer];
  },
};
