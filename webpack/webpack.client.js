var common = require('./common');
var _ = require('underscore');
var path = require('path');

module.exports = _.chain(common.js).clone().assign({
    name: 'client',
	entry: './client/js/client.js',
	output: {
		path: 'dist/public/js/',
		filename: 'client.js'
	},
}).value();
