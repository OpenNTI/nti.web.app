/*eslint-disable no-console, strict, import/order, import/no-commonjs, import/no-extraneous-dependencies*/
'use strict';
const path = require('path');
const fs = require('fs-extra');
const call = require('@nti/lib-scripts/tasks/utils/call-cmd');
const paths = require('@nti/app-scripts/config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const CSS = path.resolve(paths.assetsRoot, 'resources/css');
const SCSS = path.resolve(paths.assetsRoot, 'resources/scss');
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
