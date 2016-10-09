'use strict';
const fs = require('fs');
const _ = require('underscore');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

const projectRoot = path.join(__dirname, '..', '..');
const nodeModulesDir = path.join(projectRoot, 'node_modules');

const devBuild = process.env.MD_LIVE_BUILD !== 'prod';
const distFolder = path.join(projectRoot, devBuild ? 'dist/dev' : 'dist/prod');
function dist(distPath) {
  return path.join(distFolder, distPath);
}

// custom deep extend function
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

const handlebarsLoaderPath = path.join(
    nodeModulesDir,
    'handlebars-loader/index.js'
);

const handlebarsRuntimePath = path.join(
    nodeModulesDir,
    'handlebars/dist/handlebars.runtime.js'
);

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

const baseConfig = {
  context: projectRoot,
  node: {
    fs: 'empty',
  },
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
        loader: 'babel-loader',
        query: {
          'presets': ['es2015'],
          'plugins': ['transform-flow-strip-types'],
        },
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.handlebars'],
  },
  externals: [
    function(context, request, callback) {
      if (/^flowtype\/.*$/.test(request)) {
        return callback(null, "var null");
      }
      callback();
    }
  ],
};

const devJsConfig = _extend({
  devtool: '#inline-source-map',
}, baseConfig);

const prodJsConfig = _extend({
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
}, baseConfig);

const jsConfig = devBuild
  ? devJsConfig
  : prodJsConfig;

function addPlatform(platform) {
  jsConfig.resolve.extensions.push('.' + platform + '.js');
}

function extend(extension) {
  return _extend(extension, jsConfig);
}

// populate list of nodemodules as an externals array for webpack
const nodeModules = {};
fs.readdirSync(nodeModulesDir)
.filter(function filterDotBin(x) {
  return ['.bin'].indexOf(x) === -1;
})
.forEach(function addCommonJs(mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

// turn a glob into an object of entry points
function entryGlob() {
  let entryPoints = [];
  for(const map of arguments) {
    const mapEntry = glob.sync(path.join(projectRoot, map));
    entryPoints = entryPoints.concat(mapEntry);
  }

  const keys = _(entryPoints).map((p) => {
    const base = path.relative(path.dirname(p), p);
    return base.substring(0, base.length - path.extname(base).length);
  });
  return _.object(keys, entryPoints);
}

// remove from entry objects
function compileLazy(config) {
  for (const name in config.entry) {
    const outputPath = path.join(
      config.output.path,
      config.output.filename.replace('[name]', name)
    );

    const inputPath = path.join(
      config.entry[name]
    );

    if (fs.existsSync(outputPath)) {
      const inTime = fs.statSync(inputPath).mtime;
      const outTime = fs.statSync(outputPath).mtime;

      if (inTime < outTime) {
        delete config.entry[name];
      }
    }
  }
  return config;
}

// load package.json
module.exports = {
  js: jsConfig,
  vendor: vendor,
  vendorDll: dist('clientlib-manifest.json'),
  projectRoot: projectRoot,
  extend: extend,
  addPlatform: addPlatform,
  nodeModules: [nodeModules],
  nodeModulesDir: nodeModulesDir,
  devBuild: devBuild,
  distFolder: distFolder,
  dist: dist,
  entryGlob: entryGlob,
  compileLazy: compileLazy,
};

