'use strict';
const common = require('../common/common.js');
const _ = require('underscore');
const styleConfig = require('../common/webpack.style');

const electronStyleConfig = _.clone(styleConfig);
electronStyleConfig.output = {
  path: common.dist('electron/assets/css'),
  filename: '[name].css',
};

module.exports = electronStyleConfig;
