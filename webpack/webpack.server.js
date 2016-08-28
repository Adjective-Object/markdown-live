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

module.exports = _.chain(common.js).clone().assign({
    name: 'server',
    entry: './server/app.js',
    target: 'node',
    output: {
        path: 'dist/',
        filename: 'server.js'
    },
    externals: nodeModules
}).value()
