const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {getIfUtils, removeEmpty} = require('webpack-config-utils');

module.exports = env => {
	const isProduction = env.production === true;
	const isHot = env.hot === true;
	const {ifProduction} = getIfUtils(env);

	return {
		mode: ifProduction('production', 'development'),
		devtool: ifProduction('', 'cheap-module-eval-source-map'), // TODO: https://webpack.js.org/configuration/devtool/
		entry: [
			'./src/index.js',
			'webpack-hot-middleware/client'
		],
		output: {
			filename: 'js/main.js',
			path: path.resolve(__dirname, 'public'),
			publicPath: '/' // Needed for hot module reloading and webpack adjusting asset paths properly.
		},
		module: {
			// TODO: Add html-loader to generate index.html
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: "babel-loader",
					options: {
						presets: ['es2015', 'stage-0', 'react'], // TODO: Get react proptypes warnings working (BABEL_ENV?)
						plugins: ['react-hot-loader/babel']
					}
				},
				{
					test: /\.scss$/,
					use: [{
						loader: isHot ? 'style-loader' : MiniCssExtractPlugin.loader // Extract CSS to file for production.
					}, {
						loader: 'css-loader',
						options: {
							minimize: ifProduction(),
							sourceMap: true
						}
					}, {
						loader: 'postcss-loader',
						options: {
							sourceMap: true
						}
					}, {
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					}]
				}
			]
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new MiniCssExtractPlugin({filename: 'css/main.css'}) // TODO: Add [contenthash] to filename to invalidate cache.
		],
		optimization: {
			splitChunks: {
				cacheGroups: {
					// This is needed to make MiniCssExtractPlugin output all of the css to one file.
					styles: {
						name: 'styles',
						test: /\.css$/,
						chunks: 'all',
						enforce: true
					}
				}
			}
		}
	};
}
