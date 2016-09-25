'use strict'
const common = require('../common/common.js');
var _ = require('underscore');
var styleConfig = require('../common/webpack.style');

var webStyleConfig = _.clone(styleConfig)
webStyleConfig.output = {
    path: common.dist('web/public/css'),
    filename: '[name].css',
},

module.exports = webStyleConfig;
