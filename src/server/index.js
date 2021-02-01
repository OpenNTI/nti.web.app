/*eslint-disable no-console, strict, import/no-commonjs*/
'use strict';
const path = require('path');

const redirects = require('./lib/redirects');
const api = require('./lib/api');

let dev;
let assets = path.resolve(__dirname, '../client');

try {
	if (!/dist\/server/i.test(__dirname)) {
		dev = require('@nti/app-scripts/server/lib/devmode');
		assets = require('@nti/app-scripts/config/paths').assetsRoot;
	}
} catch (e) {
	console.error(e.stack || e.message || e);
}

exports = module.exports = {

	async register (expressApp, config) {
		const devmode = (dev) ? await dev.setupDeveloperMode(config) : false;

		redirects.register(expressApp, config);
		api.register(expressApp, config);

		if (devmode) {
			expressApp.use(devmode.middleware); //serve in-memory compiled sources/assets
		}

		return {
			devmode,

			assets
		};
	}

};
