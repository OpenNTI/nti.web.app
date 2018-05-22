/*eslint-disable no-console, strict, import/no-commonjs*/
'use strict';
const path = require('path');

const redirects = require('./lib/redirects');

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

	register (expressApp, config) {
		const resolveDev = (dev) ? dev.setupDeveloperMode(config) : Promise.resolve();

		return resolveDev.then(devmode => {
			redirects.register(expressApp, config);

			if (devmode) {
				expressApp.use(devmode.middleware); //serve in-memory compiled sources/assets
			}

			return {
				devmode,

				assets
			};
		});

	}

};
