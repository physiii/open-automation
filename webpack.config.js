const path = require('path'),
	dotenv = require('dotenv'),
	webpack = require('webpack'),
	DotenvWebpackPlugin = require('dotenv-webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	{getIfUtils, propIf, propIfNot, removeEmpty} = require('webpack-config-utils'),
	LOCAL_IDENT_NAME = '[name]__[local]___[hash:base64:5]';

dotenv.config();

module.exports = (env = {}) => {
	const {ifProduction} = getIfUtils(process.env.NODE_ENV),
		doHotModuleReplacement = Boolean(env.dev_middleware && process.env.OA_HOT_MODULE_REPLACEMENT && process.env.NODE_ENV === 'development');

	return {
		mode: ifProduction('production', 'development'),
		devtool: ifProduction('', 'cheap-module-eval-source-map'),
		entry: removeEmpty([
			propIf(doHotModuleReplacement, 'webpack-hot-middleware/client'),
			path.resolve(__dirname, 'src/index.js')
		]),
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: ifProduction('js/[name]-[contenthash:8].js', 'js/[name].js'),
			publicPath: '/' // Needed for hot module reloading and webpack adjusting asset paths properly.
		},
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all'
			}
		},
		plugins: removeEmpty([
			propIfNot(
				doHotModuleReplacement,
				new CleanWebpackPlugin([
					'public/js',
					'public/css',
					'public/index.html'
				])
			),
			new webpack.HashedModuleIdsPlugin(),
			new DotenvWebpackPlugin(),
			propIf(doHotModuleReplacement, new webpack.HotModuleReplacementPlugin()),
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, 'src/index.html'),
				title: process.env.OA_APP_NAME,
				minify: ifProduction(
					{
						collapseWhitespace: true,
						removeComments: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true,
						useShortDoctype: true
					},
					false
				),
				cache: false
			}),
			new MiniCssExtractPlugin({
				filename: ifProduction('css/[name]-[contenthash:8].css', 'css/[name].css')
			})
		]),
		module: {
			rules: [
				// This allows us to import jsmpeg as if it was exported like an ES6 module.
				{
					test: require.resolve(path.resolve(__dirname, 'src/lib/jsmpeg/jsmpeg.min.js')),
					use: ['exports-loader?JSMpeg']
				},
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
								],
								cacheDirectory: false,
								plugins: [
									'react-hot-loader/babel',
									[
										'react-css-modules',
										{
											exclude: 'node_modules',
											generateScopedName: LOCAL_IDENT_NAME,
											webpackHotModuleReloading: true,
											handleMissingStyleName: 'warn'
										}
									]
								]
							}
						},
						propIfNot(doHotModuleReplacement, {
							loader: 'eslint-loader'
						})
					])
				},
				{
					test: /\.scss$/,
					include: path.resolve(__dirname, 'src'),
					use: [
						{
							loader: propIf(
								doHotModuleReplacement,
								'style-loader', // Load CSS into DOM for hot module reloading.
								MiniCssExtractPlugin.loader // Save CSS to file.
							)
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
				},
				{
					test: /\.css$/,
					include: path.resolve(__dirname, 'src'),
					use: [
						{
							loader: propIf(
								doHotModuleReplacement,
								'style-loader', // Load CSS into DOM for hot module reloading.
								MiniCssExtractPlugin.loader // Save CSS to file.
							)
						},
						{
							loader: 'css-loader',
							options: {
								modules: true,
								localIdentName: LOCAL_IDENT_NAME,
								minimize: ifProduction(),
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true
							}
						}
					]
				}
			]
		}
	};
};
