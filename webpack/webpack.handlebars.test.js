'use strict';
const common = require('../common/common');

let platform = process.env.TEST_PLATFORM || 'web';

module.exports = common.extend({
  name: 'handlebars',
  entry: common.entryGlob('client/js/templates/*.handlebars'),
  output: {
    path: 'dist/tests/'+platform+'/client/js/templates',
    filename: '[name].js',
  },
});

