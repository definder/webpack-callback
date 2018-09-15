const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TestPlugin = require('./plugins.js');
const path = require('path');

const config = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '..', 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: path.resolve(path.join(__dirname, 'loader.js')),
                        options: {}
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                            ],
                        }
                    },
                ]
            }
        ],
    },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: false,
                mangle: false,
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true,
            options: {
                context: __dirname
            }
        }),
        new TestPlugin({options: true})
    ],
    optimization: {
        minimize: false
    },
    mode: 'production',
};

module.exports = config;