'use strict';
const common = require('./common');

module.exports = common.extend({
  name: 'client',
  entry: './client/js/client.js',
  output: {
    path: 'dist/public/js/',
    filename: 'client.js',
  },
});
