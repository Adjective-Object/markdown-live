var common = require('./common');
var path = require('path');

module.exports = common.extend({
    name: 'client',
	entry: './client/js/client.js',
	output: {
		path: 'dist/public/js/',
		filename: 'client.js'
	},
});
