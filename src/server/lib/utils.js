const path = require('path');
const fs = require('fs');

const logger = require('./logger');

const statCache = {};
const templateCache = {};
const COMPILE_DATA = path.resolve(__dirname, '../compile-data.json');
const PRODUCTION_TEMPLATE = path.resolve(__dirname, '../../client/page.html');
const DEVELOPMENT_TEMPLATE = path.resolve(__dirname, '../../main/page.html');

function askToRestart () {
	if (askToRestart.callback != null) {
		askToRestart.callback();
	}
}

function exists (f) {
	try {
		fs.accessSync(f);
	} catch (e) {
		return false;
	}
	return true;
}

const wrapfs = (method, ...locked) =>
	(...args) => new Promise((fulfill, rej) =>
		fs[method](...[...args, ...locked], (er, data) =>
			er ? rej(er) : fulfill(data)
		)
	);

const stat = wrapfs('stat');
const read = wrapfs('readFile', 'utf8');
const unwrap = x => Array.isArray(x) ? x[0] : x;

function resolveTemplateFile () {
	function isFile (file) {
		try { return fs.statSync(file).isFile(); }
		catch (e) {/**/}
		return false;
	}

	let file = PRODUCTION_TEMPLATE;
	if (!isFile(file)) {
		file = DEVELOPMENT_TEMPLATE;
	}

	return file;
}


function getModules () {
	const file = COMPILE_DATA;
	logger.debug('Checking for compile data: %s', file);
	return stat(file)
		.then(({mtime}) => {
			logger.debug('compile data mtime:', mtime);
			if (statCache.mtime === mtime.getTime()) {
				logger.debug('compile data not modified');
				return statCache.chunks;
			}

			logger.debug('new compile data, loading...');

			if (statCache.mtime) {
				askToRestart(); //allow the current process to finish, then cleanly restart.
			}

			statCache.mtime = mtime.getTime();

			return read(file)
				.then(JSON.parse)
				.then(data => {
					logger.debug('data loaded? %s', !!data);
					const chunks = data.assetsByChunkName;

					for (let chunk of Object.keys(chunks)) {
						chunks[chunk] = unwrap(chunks[chunk]);
					}

					logger.debug('updated module data: %o', chunks);
					statCache.chunks = chunks;
					return chunks;
				});
		});
}


function getTemplate (file) {
	const cache = templateCache;
	logger.debug('Checking Template: %s', file);

	return stat(file)
		.then(({mtime}) => {
			logger.debug('template mtime: ', mtime);
			if (cache.mtime === mtime.getTime()) {
				logger.debug('template not modified');
				return cache.data;
			}

			cache.mtime = mtime.getTime();
			return read(file)
				.then(data => {
					logger.debug('template loaded (length: %s)', data.length);
					cache.data = data;
					return data;
				});
		})
		.catch(er => {
			logger.error('%s', er.stack || er.message || er);
			return 'Could not load page template.';
		});
}

Object.assign(exports, {
	askToRestart,
	exists,
	getModules,
	getTemplate,
	resolveTemplateFile
});
