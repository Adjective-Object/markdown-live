var path = require('path');
var content = [
	require(path.join(__dirname, 'webpack', 'webpack.web.server.js')),
	require(path.join(__dirname, 'webpack', 'webpack.web.clientlib.js')),
	require(path.join(__dirname, 'webpack', 'webpack.web.client.js')),
	require(path.join(__dirname, 'webpack', 'webpack.style.js')),
]

module.exports = content;
