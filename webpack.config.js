const path = require('path'),
	webpack = require('webpack'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	getLocalIdent = require('css-loader/lib/getLocalIdent'),
	{getIfUtils, propIf, propIfNot, removeEmpty} = require('webpack-config-utils'),
	LOCAL_IDENT_NAME = '[name]__[local]___[hash:base64:5]';

module.exports = (env) => {
	const isHot = env.hot === true,
		{ifProduction} = getIfUtils(env);

	return {
		mode: ifProduction('production', 'development'),
		devtool: ifProduction('', 'cheap-module-eval-source-map'), // TODO: https://webpack.js.org/configuration/devtool/
		entry: [
			'webpack-hot-middleware/client',
			'./src/index.js'
		],
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: 'js/main.js',
			publicPath: '/' // Needed for hot module reloading and webpack adjusting asset paths properly.
		},
		plugins: [
			new webpack.optimize.OccurrenceOrderPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoEmitOnErrorsPlugin(),
			new MiniCssExtractPlugin({filename: 'css/main.css'}) // TODO: Add [contenthash] to filename to invalidate cache.
		],
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
					include: path.resolve(__dirname, 'src'),
					use: [
						{
							loader: propIf(
								isHot,
								'style-loader',
								MiniCssExtractPlugin.loader // Extract CSS to file for production.
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
					use: [
						{
							loader: propIf(
								isHot,
								'style-loader',
								MiniCssExtractPlugin.loader // Extract CSS to file for production.
							)
						},
						{
							loader: 'css-loader',
							options: {
								modules: true,
								localIdentName: LOCAL_IDENT_NAME,
								getLocalIdent: (loaderContext, localIdentName, localName, options) => {
									// Don't use CSS modules on CSS files from dependencies.
									return loaderContext.resourcePath.includes('node_modules')
										? localName
										: getLocalIdent(loaderContext, localIdentName, localName, options);
								},
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
