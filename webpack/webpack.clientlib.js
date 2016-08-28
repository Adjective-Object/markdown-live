var common = require('./common');

module.exports = _.chain(common.js).clone().assign({
    name: 'client',
	context: __dirname,
	entry: './client/js/client.js',
	output: {
		path: path.join(__dirname, 'dist/public/js/'),
		filename: '[name].js'
	},
}).value();
