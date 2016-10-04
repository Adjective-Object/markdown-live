'use strict';
const common = require('./common/common.js');
const webpack = require('webpack');
const _ = require('underscore');
const path = require('path');

// add web as target platform
const clientTestEntry = common.entryGlob('client/tests/!(_)*.js');
const serverTestEntry = common.entryGlob('server/tests/!(_)*.js');
const libEntry = common.entryGlob(
  'server/*.js',
  'server/!(tests)/*.js',
  'client/!(tests)/*.js'
  );

const loaders = common.js.module.loaders;
const plugins = [
  new webpack.BannerPlugin(
    'require("source-map-support").install();', {
      raw: true,
      entryOnly: false,
    }),
];

const externals = [
  common.nodeModules,
  function externalMapper(context, request, callback) {
    if (request.startsWith('.')) {
      return callback(null, 'commonjs ' + request);
    }
    return callback();
  },
];

// make a series of configs so we can map things

const clientTestConfig = {
  entry: clientTestEntry,
  output: {
    path: common.dist('tests/web/client/test/'),
    filename: '[name].js',
  },

  name: 'web-client-tests',
  context: common.projectRoot,
  platform: 'node',
  node: {fs: 'empty'},
  plugins: plugins,
  module: {
    loaders: loaders,
  },
  externals: externals,
};

const serverTestConfig = {
  entry: serverTestEntry,
  output: {
    path: common.dist('tests/web/server/test/'),
    filename: '[name].js',
  },
  name: 'web-server-tests',
  context: common.projectRoot,
  platform: 'node',
  node: {fs: 'empty'},
  plugins: plugins,
  module: {
    loaders: loaders,
  },
  externals: externals,

};

const libraryBaseConfig = {
  name: 'web-test-lib',
  context: common.projectRoot,
  platform: 'node',
  node: {fs: 'empty'},
  module: {
    loaders: loaders,
  },
  externals: externals,
};

// build multiple configs for the library entrypoints
const entryPoints = {};
const entryModules = {};
_.chain(libEntry)
  .pairs()
  .each(function addRelativeRoot(pair) {
    const relativeRoot = path.dirname(
      path.relative(
        common.projectRoot,
        pair[1]
      )
    );

    entryModules[relativeRoot] = entryModules[relativeRoot] || {};
    entryModules[relativeRoot][pair[0]] = pair[1];
    entryPoints[relativeRoot] = common.dist('tests/web/' + relativeRoot);
  });

// console.log(entryModules);

const libraryConfigs = [];
for (const entryDir in entryPoints) {
  const outDir = entryPoints[entryDir];
  const config = _.clone(libraryBaseConfig);

  Object.assign(config, {
    name: config.name + entryDir,
    entry: entryModules[entryDir],
    output: {
      libaryTarget: 'commonjs',
      path: outDir,
      filename: '[name].js',
    },
  });

  libraryConfigs.push(config);
}

// console.log(libraryConfigs);

module.exports = [
  clientTestConfig,
  serverTestConfig,
].concat(libraryConfigs);
