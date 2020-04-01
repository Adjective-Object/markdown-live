'use strict';
const common = require('./common');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  name: 'style',
  context: common.projectRoot,
  entry: common.entryGlob('client/css/*.scss'),
  plugins: [
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.svg$/,
        use: 'svg-url-loader',
      },
    ],
  },
};
