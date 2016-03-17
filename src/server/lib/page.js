/*eslint strict: 0*/
'use strict';
const logger = require('./logger');

const url = require('url');
const Path = require('path');
const fs = require('fs');

const isRootPath = /^\/(?!\/).*/;
const basepathreplace = /(manifest|src|href)="(.*?)"/igm;
const configValues = /<\[cfg\:([^\]]*)\]>/igm;

function injectConfig (cfg, orginal, prop) {
	return cfg[prop] || 'MissingConfigValue';
}

function isFile (file) {
	try {
		return fs.statSync(file).isFile();
	} catch (e) {
		return false;
	}
}

exports.getPage = function getPage () {
	let template;
	let scriptFilename = 'js/index.js';
	let revision = require('./git-revision');

	try {

		let file = Path.resolve(__dirname, '../../client/index.html'); //production
		if (!isFile(file)) {
			file = Path.resolve(__dirname, '../../main/index.html'); //dev
		}

		template = fs.readFileSync(file, 'utf8');
	} catch (er) {
		logger.error('%s', er.stack || er.message || er);
		template = 'Could not load page template.';
	}


	return (basePath, req, clientConfig) => {
		let u = url.parse(req.url);
		let manifest = u.query === 'cache' ? '<html manifest="/manifest.appcache"' : '<html';

		let cfg = Object.assign({revision}, clientConfig.config || {});
		let html = '';

		let basePathFix = (original, attr, val) => attr + '="' +
				(isRootPath.test(val) ? (basePath || '/') + val.substr(1) : val) + '"';

		html += clientConfig.html;

		let out = template
				.replace(/<html/, manifest)
				.replace(configValues, injectConfig.bind(this, cfg))
				.replace(basepathreplace, basePathFix)
				.replace(/<!--html:server-values-->/i, html)
				.replace(/resources\/styles\.css/, 'resources/styles.css?rel=' + encodeURIComponent(scriptFilename))
				.replace(/js\/index\.js/, scriptFilename);

		return out;
	};
};
