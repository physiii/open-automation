const path = require('path');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: [
		'./src/index.js',
		'webpack-hot-middleware/client'
	],
	output: {
		filename: 'js/main.js',
		path: path.resolve(__dirname, 'public'),
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: ['env', 'stage-0', 'react'],
					plugins: ['react-hot-loader/babel']
				}
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
};
