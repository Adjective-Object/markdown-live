var common = require('./common');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var nodeModules = {};
fs.readdirSync(common.nodeModules)
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
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
        libraryTarget: 'commonjs2'
    },

    target: 'node',

    externals: nodeModules
});
