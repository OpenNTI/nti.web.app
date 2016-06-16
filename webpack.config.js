/*eslint strict: 0, no-console: 0*/
'use strict';

const publicPath = '/app/';
const outPath = './stage/';

const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

const AppCachePlugin = require('appcache-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const path = require('path');

const root = path.resolve(__dirname, 'src', 'main', 'js');
const sassRoot = path.resolve(__dirname, 'src', 'main', 'resources', 'scss');
const modules = path.resolve(__dirname, 'node_modules');
const eslintrc = path.resolve(__dirname, '.eslintrc');

const gitRevision = JSON.stringify(require('nti-util-git-rev'));

const ENV = process.env.NODE_ENV || 'development';
const PROD = ENV === 'production';

exports = module.exports =
{
	name: 'browser',
	output: {
		path: outPath + 'client/',
		filename: 'js/index.js',
		chunkFilename: 'js/[hash]-[id].js',
		publicPath: publicPath
	},

	cache: true,
	// devtool: PROD ? 'hidden-source-map' : 'source-map',
	devtool: 'source-map',

	entry: './src/main/js/index.js',

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
			'react-dom': 'ReactDOM'
		}
	],

	resolve: {
		root: [root, modules],
		extensions: ['', '.jsx', '.js', '.json', '.css', '.scss', '.html']
	},

	resolveLoader: {
		root: [modules]
	},

	module: {
		preLoaders: [
			// {
			// 	test: /src.main.js.+jsx?$/,
			// 	loader: 'eslint',
			// 	exclude: /node_modules/
			// },
			{
				test: /src.main.js.+jsx?$/,
				loader: 'baggage?[file].scss'
			},
			{
				test: /\.js(x?)$/,
				loader: 'source-map'
			}
		],
		loaders: [
			{ test: /\.async\.jsx$/i, loader: 'react-proxy!exports?exports.default' },
			{ test: /\.js(x?)$/i, loader: 'babel', exclude: /node_modules/ },

			{ test: /\.json$/, loader: 'json' },
			{ test: /\.(ico|gif|png|jpg|svg)$/, loader: 'url?limit=10000&name=resources/images/[name].[ext]&mimeType=image/[ext]' },

			{ test: /\.(eot|ttf|woff)$/, loader: 'file?name=resources/fonts/[name].[ext]' },

			{ test: /\.(s?)css$/, loader: ExtractTextPlugin.extract(
				'style-loader',
				'css?sourceMap&-minimize!postcss!resolve-url!sass?sourceMap'
				)
			}
		]
	},

	eslint: {
		configFile: eslintrc,
		emitError: true,
		failOnError: true,
		quiet: true
	},

	postcss: [
		autoprefixer({ browsers: ['> 1%', 'last 2 versions'] })
	],

	sassLoader: {
		sourceMap: true,
		includePaths: [sassRoot]
	},

	plugins: [
		new StatsPlugin('stats.json'),
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
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.DefinePlugin({
			'SERVER': false,
			'BUILD_SOURCE': gitRevision,
			'process.browser': true,
			'process.env': {
				'NODE_ENV': JSON.stringify(ENV)
			}
		}),
		new webpack.ProvidePlugin({
			'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
		}),
		new ExtractTextPlugin('resources/styles.css', {allChunks: true}),
		PROD && new webpack.optimize.UglifyJsPlugin({
			test: /\.js(x?)($|\?)/i,
			compress: { warnings: false }
		}),
		PROD && new CompressionPlugin({ algorithm: 'gzip' })
	].filter(x => x)
};
