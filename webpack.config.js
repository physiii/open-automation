const path = require('path'),
	dotenv = require('dotenv'),
	dotenvExpand = require('dotenv-expand'),
	webpack = require('webpack'),
	DotenvWebpackPlugin = require('dotenv-webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
	autoprefixer = require('autoprefixer'),
	getLocalIdent = require('css-loader/lib/getLocalIdent'),
	{getIfUtils, propIf, propIfNot, removeEmpty} = require('webpack-config-utils'),
	LOCAL_IDENT_NAME = '[name]__[local]___[hash:base64:5]';

dotenvExpand(dotenv.config());

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
	throw new Error('The NODE_ENV environment variable must be either "production" or "development".');
}

module.exports = (env = {}) => {
	const {ifProduction, ifDevelopment} = getIfUtils(process.env.NODE_ENV),
		doHmr = Boolean(env.dev_middleware && process.env.OA_HOT_MODULE_REPLACEMENT && process.env.NODE_ENV === 'development');

	return removeEmpty({
		mode: ifProduction('production', 'development'),
		devtool: ifDevelopment('cheap-module-eval-source-map'),
		entry: removeEmpty([
			propIf(doHmr, 'webpack-hot-middleware/client'),
			path.resolve(__dirname, 'src/index.js')
		]),
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: ifProduction('js/[name]-[contenthash:8].js', 'js/[name].js'),
			publicPath: '/', // Needed for hot module reloading and webpack adjusting asset paths properly.
			globalObject: 'this' // https://github.com/webpack/webpack/issues/6642
		},
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all'
			}
		},
		plugins: removeEmpty([
			propIfNot(doHmr, new CleanWebpackPlugin([
				'public/js',
				'public/css',
				'public/index.html'
			])),
			new DotenvWebpackPlugin(),
			new webpack.HashedModuleIdsPlugin(),
			propIf(doHmr, new webpack.HotModuleReplacementPlugin()),
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
			}),
			ifProduction(new OptimizeCssAssetsPlugin()),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/) // Don't load locales for Moment.js.
		]),
		module: {
			rules: [
				// This allows us to import jsmpeg as if it was exported like an ES6 module.
				{
					test: require.resolve(path.resolve(__dirname, 'src/lib/jsmpeg/jsmpeg.min.js')),
					use: ['exports-loader?JSMpeg']
				},
				{
					test: /\.worker\.js$/,
					use: {loader: 'worker-loader'}
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: removeEmpty([
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env', '@babel/preset-react'],
								cacheDirectory: true,
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
						propIfNot(doHmr, ifDevelopment({
							loader: 'eslint-loader'
						}))
					])
				},
				{
					test: /\.css$/,
					use: [
						propIf(doHmr, 'style-loader', MiniCssExtractPlugin.loader),
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
								importLoaders: 1,
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
								plugins: [autoprefixer({grid: true})],
								sourceMap: true
							}
						}
					]
				}
			]
		},
		stats: propIf(doHmr, {
			context: process.cwd(),
			assets: false,
			builtAt: false,
			children: false,
			chunks: false,
			colors: true,
			entrypoints: false,
			errors: true,
			errorDetails: false,
			hash: true,
			modules: false,
			performance: false,
			timings: false,
			version: false,
			warnings: true,
			warningsFilter: (warning) => warning.includes('postcss-loader') && warning.includes('is not supported by IE') // Ignore warnings about CSS polyfill support for IE.
		})
	});
};
