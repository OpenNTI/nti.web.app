/*eslint strict: 0, no-console: 0, import/no-unresolved: 0, import/order: 0*/
'use strict';


const path = require('path');

const autoprefixer = require('autoprefixer');
const AppCachePlugin = require('appcache-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
// const CompressionPlugin = require('compression-webpack-plugin');

const publicPath = '/app/';
const outPath = path.resolve(__dirname, './dist');

const root = path.resolve(__dirname, 'src', 'main', 'js');
const modules = path.resolve(__dirname, 'node_modules');
const sassRoot = path.resolve(__dirname, 'src', 'main', 'resources', 'scss');
// const eslintrc = path.resolve(__dirname, '.eslintrc');

const gitRevision = JSON.stringify(require('nti-util-git-rev'));

const ENV = process.env.NODE_ENV || 'development';
const PROD = ENV === 'production';

exports = module.exports =
{
	name: 'browser',
	output: {
		path: path.resolve(outPath, './client'),
		filename: 'js/[name]-[hash].js',
		chunkFilename: 'js/[hash]-[id].js',
		publicPath: publicPath
	},

	cache: true,
	// devtool: PROD ? 'hidden-source-map' : 'source-map',
	devtool: 'cheap-module-source-map',

	entry: {
		index: './src/main/js/index.js'
	},

	target: 'web',


	node: {
		net: 'empty',
		tls: 'empty',
		request: 'empty'
	},

	externals: [
		{
			'extjs': 'Ext',
			'react' : 'React',
			'react-dom': 'ReactDOM',
			'react/lib/ReactCSSTransitionGroup': 'React.addons.CSSTransitionGroup'
		}
	],

	resolve: {
		modules: [root, modules],
		extensions: ['.jsx', '.js', '.json', '.css', '.scss', '.html']
	},


	module: {
		rules: [
			// {
			// 	test: /src.main.js.+jsx?$/,
			// 	loader: 'eslint',
			// 	enforce: 'pre',
			// 	exclude: /node_modules/
			// 	options: {
			// 		configFile: eslintrc,
			// 		emitError: true,
			// 		failOnError: true,
			// 		quiet: true
			// 	}
			// },
			{
				test: /src.main.js.+jsx?$/,
				loader: 'baggage-loader',
				options: {
					'[file].scss':{}
				}
			},
			{
				test: /\.js(x?)$/,
				enforce: 'pre',
				include: /nti\-/,
				loader: 'source-map-loader'
			},

			{
				test: /\.async\.jsx$/i,
				loader: 'react-proxy-loader'
			},

			{
				test: /\.js(x?)$/i,
				include: /src.main.js/,
				loader: 'babel-loader'
			},

			{
				test: /\.(ico|gif|png|jpg|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'resources/images/[name].[ext]',
					mimeType: 'image/[ext]'
				}
			},

			{
				test: /\.(eot|ttf|woff)$/,
				loader: 'file-loader',
				options: {
					name: 'resources/fonts/[name].[ext]'
				}
			},

			{
				test: /\.(s?)css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true,
								plugins: () => [
									autoprefixer({ browsers: ['> 1% in US', 'last 2 versions', 'iOS > 8'] })
								]
							}
						},
						{
							loader: 'resolve-url-loader',
							options: {
								// debug:true,
								// silent: false,
								sourceMap: true,
								root: __dirname
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true,
								includePaths: [sassRoot]
							}
						}
					]
				})
			}
		]
	},

	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: PROD ? 'production' : 'development'
		}),

		PROD && new StatsPlugin('../compile-data.json'),

		new AppCachePlugin({
			cache: [
				'index.html',
				'resources/images/favicon.ico',
				'resources/images/app-icon.png',
				'resources/images/app-splash.png'
			],
			network: [
				'/dataserver2/',
				'/content/',
				'*'
			],
			fallback: ['/dataserver2/ offline.json', '/ index.html'],
			settings: ['prefer-online'],
			exclude: [],
			output: 'manifest.appcache'
		}),

		new webpack.DefinePlugin({
			'BUILD_SOURCE': gitRevision
		}),

		new ExtractTextPlugin({
			filename: 'resources/styles.css',
			allChunks: true,
			disable: false
		}),

		PROD && new webpack.optimize.UglifyJsPlugin({
			test: /\.js(x?)($|\?)/i,
			compress: { warnings: false }
		}),

		// PROD && new CompressionPlugin({ algorithm: 'gzip' })
	].filter(x => x)
};
