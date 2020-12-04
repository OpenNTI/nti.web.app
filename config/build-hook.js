/*eslint-disable no-console, strict, import/order, import/no-commonjs, import/no-extraneous-dependencies*/
'use strict';
const path = require('path');
const fs = require('fs-extra');
const isCI = require('is-ci');
const glob = require('glob');
const call = require('@nti/lib-scripts/tasks/utils/call-cmd');
const paths = require('@nti/app-scripts/config/paths');
const checkRequiredFiles = require('@nti/app-scripts/tasks/utils/check-required-files');

const spriteInfo = require('../.spritesmith');

const CSS = path.resolve(paths.assetsRoot, 'resources/css');
const SCSS = path.resolve(paths.assetsRoot, 'resources/scss');

const SPRITE_VARS = path.resolve(paths.assetsRoot, 'resources/scss/utils/_icons.scss');
const SPRITE_SRC_MOD = getLatest(glob.sync(spriteInfo.src));
const SPRITE_MOD = getLatest(spriteInfo.destImage);
const CSSMOD = getLatest(CSS);
const SCSSMOD = getLatest(SCSS);

if (CSSMOD >= SCSSMOD && !(isCI || process.env.NODE_ENV === 'production')) {
	console.log('Legacy styles not modified. skipping.');
	return;
}

const f = x => [`${SCSS}/${x}.scss`, `${CSS}/${x}.css`];

ensurePath('spritesmith', 'sass', 'postcss-cli');

// Warn and crash if required files are missing
if (!checkRequiredFiles([SCSS])) {
	process.exit(1);
}

if (SPRITE_SRC_MOD > SPRITE_MOD && !(isCI || process.env.NODE_ENV === 'production')) {
	fs.removeSync(SPRITE_VARS);
	fs.removeSync(path.resolve(paths.assetsRoot, 'resources/images/sprite.png'));
	call('spritesmith');
	// mark(spriteInfo.destImage, SPRITE_SRC_MOD).catch(e => {console.log(e);});
}

fs.removeSync(CSS);
call('sass', f`accessibility`);
call('sass', f`legacy`);
call('sass', f`nti-override`);
call('postcss', ['--verbose', '--use', 'autoprefixer', '-r', CSS + '/**/*.css']);

mark(CSS, SCSSMOD).catch(e => {console.log(e);});

function getLatest (input) {
	const max = (x, y) => x > y ? x : y;
	try {
		let latest = 0;
		if (Array.isArray(input)) {
			return input.reduce((x, y) => max(x, getLatest(y)), latest);
		}

		if (input === SPRITE_VARS) {return latest;}
		const s = fs.statSync(input);

		if (!s.isDirectory()) {
			return max(latest, s.mtime);
		}

		for (let file of fs.readdirSync(input)) {
			latest = max(latest, getLatest(path.join(input, file)));
		}

		return latest;
	} catch (e) {
		return -1;
	}
}


async function mark (dir, time) {
	const pending = [];

	for (let file of await fs.readdir(dir)) {
		const fullPath = path.join(dir, file);
		const s = await fs.stat(fullPath);

		if (s.isDirectory()) {
			pending.push(mark(fullPath, time));
			continue;
		}

		pending.push(fs.utimes(fullPath, time, time));
	}

	await Promise.all(pending);
}

function ensurePath (...deps) {
	try {
		const bins = new Set();
		const MODULE_DIR = 'node_modules';
		for(const dep of deps) {
			const location = require.resolve(dep).split(MODULE_DIR).slice(0, -1).join(MODULE_DIR);
			bins.add(path.join(location, MODULE_DIR, '.bin'));
		}

		process.env.PATH = `${[...bins].join(':')}:${process.env.PATH}`;
	} catch {
		console.error('Could not resolve dependencies, make sure they are installed');
		process.exit(1);
	}
}
