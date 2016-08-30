'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const projectRoot = path.join(__dirname, '..');
const nodeModules = path.join(projectRoot, 'node_modules');

const handlebarsLoaderPath = path.join(
    nodeModules,
    'handlebars-loader/index.js'
);

const handlebarsRuntimePath = path.join(
    nodeModules,
    'handlebars/dist/handlebars.runtime.js'
);

// exit with error and remove build products if the build fails
function exitErrorPlugin() {
    this.plugin("done", function(stats)
    {
        if (stats.compilation.errors &&
            stats.compilation.errors.length)
        {
            for(let x of stats.compilation.errors) {
                console.log(x.message);
            }

            for (let a in stats.compilation.assets) {
                console.log('unlinking', stats.compilation.assets[a].existsAt);
                fs.unlink(stats.compilation.assets[a].existsAt);
            }

            // recurseKeys(stats, 'stats')

            if (! stats.compilation.compiler.options.watch) {
                process.exit(1);
            }
        }
    });
}

const jsConfig = {
  context: projectRoot,
  module: {
    loaders: [
      {
        test: /\.handlebars$/,
        loader: handlebarsLoaderPath,
        query: { runtime: handlebarsRuntimePath },
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader?presets[]=es2015',
      },
    ],
  },
  plugins: [
    exitErrorPlugin,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};

function _extend(source, target) {
  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);
  const n = {};
  let key;
  let i;

  if (typeof(source) !== typeof(target)) {
    throw new Error('mismatched types in _extend');
  }

  if (Array.isArray(target)) {
    return source + target;
  }

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    n[key] = source[key];
  }

  for (i = 0; i < targetKeys.length; i++) {
    key = targetKeys[i];
    if (source.hasOwnProperty(key) &&
            typeof(n[key]) === 'object') {
      n[key] = _extend(source[key], target[key]);
    }
    else {
      n[key] = target[key];
    }
  }

  return n;
}

function extend(extension) {
  return _extend(extension, jsConfig);
}

// load package.json
module.exports = {
  js: jsConfig,
  nodeModules: nodeModules,
  projectRoot: projectRoot,
  extend: extend
};
