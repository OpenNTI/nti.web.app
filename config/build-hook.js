/*eslint-disable no-console, strict, import/order, import/no-commonjs, import/no-extraneous-dependencies*/
'use strict';
const path = require('path');
const fs = require('fs-extra');
const isCI = require('is-ci');
const call = require('@nti/lib-scripts/tasks/utils/call-cmd');
const paths = require('@nti/app-scripts/config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const CSS = path.resolve(paths.assetsRoot, 'resources/css');
const SCSS = path.resolve(paths.assetsRoot, 'resources/scss');

const SPRITE_VARS = path.resolve(paths.assetsRoot, 'resources/scss/utils/_icons.scss');
const CSSMOD = getLatest(CSS);
const SCSSMOD = getLatest(SCSS);

if (CSSMOD >= SCSSMOD && !(isCI || process.env.NODE_ENV === 'production')) {
	console.log('Legacy styles not modified. skipping.');
	return;
}

const f = x => [`${SCSS}/${x}.scss`, `${CSS}/${x}.css`];

// Warn and crash if required files are missing
if (!checkRequiredFiles([SCSS])) {
	process.exit(1);
}

fs.removeSync(CSS);
fs.removeSync(SPRITE_VARS);
fs.removeSync(path.resolve(paths.assetsRoot, 'resources/images/sprite.png'));

//@spritesmith
call('spritesmith');
// @node-sass $(SRC)main/resources/scss -o $(SRC)main/resources/css
call('sass', f`accessibility`);
call('sass', f`legacy`);
call('sass', f`nti-override`);
// @postcss --use autoprefixer -r $(SRC)main/resources/css/*.css
call('postcss', ['--use', 'autoprefixer', '-r', CSS + '/*.css']);

mark(CSS, SCSSMOD);

function getLatest (dir, latest = 0) {
	try {

		for (let file of fs.readdirSync(dir)) {
			const fullpath = path.join(dir, file);
			if (fullpath === SPRITE_VARS) {continue;}
			const s = fs.statSync(fullpath);

			if (s.isDirectory()) {
				latest = getLatest(fullpath, latest);
			}

			else if (s.mtime > latest) {
				latest = s.mtime;
			}
		}

	} catch (e) {
		return -1;
	}

	return latest;
}


async function mark (dir, time) {
	const pending = [];

	for (let file of await fs.readdir(dir)) {
		const fullpath = path.join(dir, file);
		const s = await fs.stat(fullpath);

		if (s.isDirectory()) {
			pending.push(mark(fullpath, time));
			continue;
		}

		pending.push(fs.utimes(fullpath, time, time));
	}

	await Promise.all(pending);
}
