// import exec from 'script.exec.js';

const path = require('path'),
	webpack = require('webpack'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	{getIfUtils, propIf, propIfNot, removeEmpty} = require('webpack-config-utils');

module.exports = (env) => {
	const isHot = env.hot === true,
		{ifProduction} = getIfUtils(env);

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
					use: removeEmpty([
						{
							loader: 'babel-loader',
							options: {
								presets: [
									'es2015',
									'stage-0',
									'react'
								], // TODO: Get react proptypes warnings working (BABEL_ENV?)
								plugins: ['react-hot-loader/babel']
							}
						},
						propIfNot(isHot, {
							loader: 'eslint-loader'
						})
					])
				},
				// This allows us to import jsmpeg in any file as if it was exported like an ES6 module.
				{
					test: require.resolve(path.resolve(__dirname, 'src/lib/jsmpeg/jsmpeg.min.js')),
					use: ['exports-loader?JSMpeg']
				},
				{
					test: /\.scss$/,
					use: [
						{
							loader: propIf(isHot, 'style-loader', MiniCssExtractPlugin.loader) // Extract CSS to file for production.
						},
						{
							loader: 'css-loader',
							options: {
								minimize: ifProduction(),
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
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
};
