'use strict'
const common = require('../common/common.js');
var _ = require('underscore');
var styleConfig = require('../common/webpack.style');

var electronStyleConfig = _.clone(styleConfig)
electronStyleConfig.output = {
    path: common.dist('electron/assets/css'),
    filename: '[name].css',
}

module.exports = electronStyleConfig;
