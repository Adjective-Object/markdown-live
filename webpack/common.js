var path = require('path');
var webpack = require('webpack');

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
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};

function _extend(source, target) {
    if (typeof(source) !== typeof(target)) {
        throw "mismatched types in _extend";
    }

    if (Array.isArray(target)) {
        return source + target
    }

    var n = {};
    var sourceKeys = Object.keys(source);
    for (var i=0; i<sourceKeys.length; i++) {
        var k = sourceKeys[i];
        n[k] = source[k];
    }

    var targetKeys = Object.keys(target);
    for (var i=0; i<targetKeys.length; i++) {
        var k = targetKeys[i];
        if (source.hasOwnProperty(k) &&
            typeof(n[k]) === 'Object') {
            n[k] = _extend(source[k], target[k]);
        }
        else {
            n[k] = target[k];
        }
    }

    return n;
}

function extend(extension) {
    return _extend(extension, common_js)
}

// load package.json
module.exports = {
    js: common_js,
    nodeModules: nodeModules,
    projectRoot: projectRoot,
    extend: extend
}