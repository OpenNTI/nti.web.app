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

const CSSMOD = getLatest(CSS);
const SCSSMOD = getLatest(SCSS);

if (CSSMOD > SCSSMOD && !(isCI || process.env.NODE_ENV === 'production')) {
	console.log('Legacy styles not modified. skipping.');
	return;
}

const f = x => [`${SCSS}/${x}.scss`, `${CSS}/${x}.css`];

// Warn and crash if required files are missing
if (!checkRequiredFiles([SCSS])) {
	process.exit(1);
}

fs.removeSync(CSS);
fs.removeSync(path.resolve(paths.assetsRoot, 'resources/scss/utils/_icons.scss'));
fs.removeSync(path.resolve(paths.assetsRoot, 'resources/images/sprite.png'));

//@spritesmith
call('spritesmith');
// @node-sass $(SRC)main/resources/scss -o $(SRC)main/resources/css
call('sass', f`accessibility`);
call('sass', f`legacy`);
call('sass', f`nti-override`);
// @postcss --use autoprefixer -r $(SRC)main/resources/css/*.css
call('postcss', ['--use', 'autoprefixer', '-r', CSS + '/*.css']);



function getLatest (dir) {
	let latest = 0;

	for (let file of fs.readdirSync(dir)) {
		const fullpath = path.join(dir, file);
		const s = fs.statSync(fullpath);

		if (s.isDirectory()) {
			latest = getLatest(fullpath);
		}

		else if (s.mtime > latest) {
			latest = s.mtime;
		}
	}

	return latest;
}
