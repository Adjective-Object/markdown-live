var webpack = require("webpack");
var path = require("path");
nodeModules = __dirname + '/node_modules';
module.exports = {
	context: __dirname,
	entry: "./src/client.js",
	output: {
		path: path.join(__dirname, "public/"),
		filename: "js/app.js"
	},
    module: {
        loaders: [
            { 
                test: /\.handlebars$/,
                loader: nodeModules + '/handlebars-loader/index.js',
                query: {
                    runtime: nodeModules + '/handlebars/dist/handlebars.runtime.js'
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader?presets[]=es2015',
            }
        ]
    },
	plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false }
        }),
        new webpack.optimize.DedupePlugin()
	],
};
