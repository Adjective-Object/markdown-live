var path = require('path');

var projectRoot = path.join(__dirname, '..');
var nodeModules = path.join(projectRoot, 'node_modules');

var handlebarsLoaderPath = path.join(
    nodeModules,
    'handlebars-loader/index.js'
);

var handlebarsRuntimePath = path.join(
    nodeModules,
    'handlebars/dist/handlebars.runtime.js'
);

var common_js = {
    context: projectRoot,
    module: {
        loaders: [
            { 
                test: /\.handlebars$/,
                loader: handlebarsLoaderPath,
                query: { runtime: handlebarsRuntimePath }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader?presets[]=es2015',
            }
        ]
    }
};

// load package.json
module.exports = {
    js: common_js,
    nodeModules: nodeModules,
    projectRoot: projectRoot
}