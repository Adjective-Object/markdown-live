var path = require('path');
var content = [
	require(path.join(__dirname, 'webpack', 'webpack.server.js')),
	require(path.join(__dirname, 'webpack', 'webpack.client.js')),
	require(path.join(__dirname, 'webpack', 'webpack.clientlib.js')),
]

module.exports = content;
