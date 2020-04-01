'use strict';
const common = require('../common/common.js');
const _ = require('underscore');
const styleConfig = require('../common/webpack.style');

const webStyleConfig = _.clone(styleConfig);
webStyleConfig.output = {
  path: common.dist('web/public/css'),
};

module.exports = webStyleConfig;
