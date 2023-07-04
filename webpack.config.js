const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const webpack = require('webpack');
const DotenvWebpackPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const autoprefixer = require('autoprefixer');
const { getIfUtils } = require('webpack-config-utils');
const LOCAL_IDENT_NAME = '[name]__[local]___[hash:base64:8]';

dotenvExpand(dotenv.config());

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
  throw new Error('The NODE_ENV environment variable must be either "production" or "development".');
}

module.exports = (env = {}) => {
  const { ifProduction, ifDevelopment } = getIfUtils(process.env.NODE_ENV);
  return {
    mode: ifProduction('production', 'development'),
    devtool: ifProduction('source-map', 'eval-cheap-module-source-map'),
    entry: [
      path.resolve(__dirname, 'src/index.js')
    ],
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: ifProduction('js/[name]-[contenthash:8].js', 'js/[name].js'),
      publicPath: '/',
      globalObject: 'self'
    },
    optimization: {
      concatenateModules: false,
      runtimeChunk: false,
      splitChunks: false,
      minimizer: [
        new CssMinimizerPlugin()
      ],
      moduleIds: 'named',
      usedExports: true
    },
    plugins: [
      new CleanWebpackPlugin(),
      new DotenvWebpackPlugin(),
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
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    ],
    module: {
      rules: [
        {
          test: require.resolve(path.resolve(__dirname, 'src/lib/jsmpeg/jsmpeg.min.js')),
          use: [
            {
              loader: 'exports-loader',
              options: {
                exports: 'JSMpeg',
              },
            },
          ],
        },
        {
          test: /\.worker\.js$/,
          use: { loader: 'worker-loader' }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                cacheDirectory: true
              }
            },
            ifDevelopment({
              loader: 'eslint-loader'
            })
          ]
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
                modules: {
                  localIdentName: LOCAL_IDENT_NAME,
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [autoprefixer({ grid: true })],
                },
                sourceMap: true,
              },
            },
          ],
        }
      ]
    },
    stats: {
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
    },
    devServer: {
      writeToDisk: true,
      publicPath: '/',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    }
  };
};
