'use strict';
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const projectRoot = path.join(__dirname, '..');
const nodeModulesDir = path.join(projectRoot, 'node_modules');

const handlebarsLoaderPath = path.join(
    nodeModulesDir,
    'handlebars-loader/index.js'
);

const handlebarsRuntimePath = path.join(
    nodeModulesDir,
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

const vendor = [
  'domready',
  'underscore',
  'object-hash',
  'gator',
  'prismjs',
  'prismjs/components/prism-handlebars.min.js',
  'prismjs/components/prism-yaml.min.js',
  'socket.io-client',
];

const devBuild = process.env['MD_LIVE_BUILD'] === 'dev';

// platform handler
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
  resolve: {
    extensions: ['', '.js', '.handlebars'],
  },
  plugins: devBuild ? [] : [
    exitErrorPlugin,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};

function addPlatform(platform) {
  jsConfig.resolve.extensions.push( '.' + platform + '.js' );
}


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
    return source.concat(target);
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

let nodeModules = {};
fs.readdirSync(nodeModulesDir)
.filter(function filterDotBin(x) {
  return ['.bin'].indexOf(x) === -1;
})
.forEach(function addCommonJs(mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

// load package.json
module.exports = {
  js: jsConfig,
  vendor: vendor,
  vendorDll: 'dist/web/clientlib-manifest.json',
  electronVendorDll: 'dist/electron/assets/clientlib-manifest.json',
  projectRoot: projectRoot,
  extend: extend,
  addPlatform: addPlatform,
  nodeModules: nodeModules,
  devBuild: devBuild
};

