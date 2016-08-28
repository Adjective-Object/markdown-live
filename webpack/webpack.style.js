var common = require('./common');
var _ = require('underscore');
var glob = require('glob');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin')

// figure out the entrypoints
var entryPoints = glob.sync(path.join(__dirname, '../client/css/*.scss'));
var keys = _(entryPoints).map((p) => {
    var base = path.relative(path.dirname(p), p);
    return base.substring( 0, base.length - path.extname(base).length );
});
var entry = _.object(keys, entryPoints);

module.exports = {
    name: 'style',
    context: common.projectRoot,
    entry: entry,
    output: {
        path: 'dist/public/css',
        filename: '[name].css'
    },
    plugins: [
        new ExtractTextPlugin("[name].css")
    ],
    module: {
        loaders: [
            { 
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    "css-loader?minimize!sass-loader"
                )
            },
        ]
    }
}