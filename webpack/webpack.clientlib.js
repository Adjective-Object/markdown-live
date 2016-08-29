var webpack = require('webpack');
var common = require('./common');
var path = require('path');
var _ = require('underscore');

module.exports = _.chain(common.js).clone().assign({
    name: 'client',
	context: __dirname,
	entry: {
		vendor: [
			'domready',
			'underscore',
			'object-hash',
			'gator',
			'prismjs',
			'socket.io-client',
		]
	},
	output: {
		path: path.join(common.projectRoot, 'dist/public/js/'),
		filename: '[name].js'
	},
	plugins: [
	    new webpack.optimize.CommonsChunkPlugin(
	    	/* chunkName= */'vendor',
	    	/* filename= */'client.lib.js'
	    )
	]
}).value();
