/*eslint strict:0*/
'use strict';

const logger = require('./logger');

exports.setupDeveloperMode = function setupDeveloperMode (config) {
	const webpack = require('webpack');
	const webpackConfigFile = require('../../../webpack.config');

	const WebpackServer = require('webpack-dev-server');

	const port = config.port;
	let devPort = config['webpack-dev-server'] || (port + 1);

	const webpackConfig = Object.assign({}, webpackConfigFile);

	webpackConfig.output.path = '/';
	webpackConfig.output.publicPath = '/app/';
	webpackConfig.output.filename = 'js/index.js';
	webpackConfig.entry = './src/main/js/index.js';

	let webpackServer = new WebpackServer(webpack(webpackConfig), {
		contentBase: port,
		//hot: true,

		noInfo: false,
		quiet: false,
		lazy: false,
		watchOptions: {
			aggregateTimeout: 5000
		},
		publicPath: '/',

		stats: {
			version: true,
			hash: true,
			timings: true,

			assets: false,

			chunks: true,
			chunkModules: false,
			chunkOrigins: false,

			modules: false,

			// cached: false,
			// cachedAssets: false,
			// showChildren: false,
			// source: false,

			colors: true,
			reasons: true,
			errorDetails: true
		}
	});


	return {
		middleware: webpackServer.middleware,
		entry: webpackConfig.output.filename,
		start: () => {
			webpackServer.listen(devPort, 'localhost', err => {
				if (err) {
					logger.error(err);
				}

				logger.info('WebPack Dev Server listening on port %d', devPort);
			});
		}
	};
};
