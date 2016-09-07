var path = require('path');
var content = [
	require(path.join(__dirname, 'webpack', 'webpack.server.js')),
	require(path.join(__dirname, 'webpack', 'webpack.clientlib.js')),
	require(path.join(__dirname, 'webpack', 'webpack.client.js')),
	require(path.join(__dirname, 'webpack', 'webpack.style.js')),
]

module.exports = content;
