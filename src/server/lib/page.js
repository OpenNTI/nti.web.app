/*eslint strict: 0*/
'use strict';
const url = require('url');

const {URL: {join: urlJoin}} = require('nti-commons');

const logger = require('./logger');
const {resolveTemplateFile, getModules, getTemplate} = require('./utils');

const isRootPath = RegExp.prototype.test.bind(/^\/(?!\/).*/);
const isSiteAssets = RegExp.prototype.test.bind(/^\/site\-assets/);
const shouldPrefixBasePath = val => isRootPath(val) && !isSiteAssets(val);

const basepathreplace = /(manifest|src|href)="(.*?)"/igm;
const configValues = /<\[cfg\:([^\]]*)\]>/igm;
const injectConfig = (cfg, orginal, prop) => cfg[prop] || 'MissingConfigValue';



exports.getPage = function getPage () {
	const templateFile = resolveTemplateFile();
	let warnedAboutChunks = false;

	function warnAboutChunks (e) {
		if (!warnedAboutChunks) {
			warnedAboutChunks = true;
			logger.warn('Could not resolve chunk names: %s', e.message || e);
		}
	}


	return (basePath, req, clientConfig) => {
		const ScriptFilenameMap = { index: 'js/index.js' };
		const u = url.parse(req.url);
		const manifest = u.query === 'cache' ? '<html manifest="/manifest.appcache"' : '<html';

		return Promise.all([
			getTemplate(templateFile),
			getModules()
				.catch(warnAboutChunks)
		])
			.then(([template = 'Bad Template', modules]) => {
				if (modules != null) {
					Object.assign(ScriptFilenameMap, modules);
				}

				const cfg = Object.assign({}, clientConfig.config || {});

				const basePathFix = (original, attr, val) =>
										attr + `="${
											shouldPrefixBasePath(val)
												? urlJoin(basePath, val)
												: val
										}"`;


				const html = /*rendererdHtml +*/ clientConfig.html;

				let out = template
						.replace(/<html/, manifest)
						.replace(configValues, injectConfig.bind(this, cfg))
						.replace(basepathreplace, basePathFix)
						.replace(/<!--html:server-values-->/i, html)
						.replace(/resources\/styles\.css/, 'resources/styles.css?rel=' + encodeURIComponent(ScriptFilenameMap.index));

				for (let script of Object.keys(ScriptFilenameMap)) {
					out = out.replace(new RegExp(`js\\/${script}\\.js`), ScriptFilenameMap[script]);
				}

				return out;
			});
	};
};
