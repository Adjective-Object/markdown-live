'use strict';
const common = require('./common');
const fs = require('fs');

const nodeModules = {};
fs.readdirSync(common.nodeModules)
.filter(function filterDotBin(x) {
  return ['.bin'].indexOf(x) === -1;
})
.forEach(function addCommonJs(mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

module.exports = common.extend({
  name: 'server',
  entry: './server/app.js',
  target: 'node',
  output: {
    path: 'dist/',
    filename: 'server.js',
    library: 'markdown-live',
    libraryTarget: 'commonjs2',
  },
  externals: nodeModules,
});
