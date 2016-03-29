/*eslint no-var: 0 strict: 0*/
'use strict';
var baseConfig = require('nti-unittesting-clientside');
var Progress = require('nti-unittesting-clientside/progress');

module.exports = function (config) {
	const webpack = baseConfig.webpack;
	const externals = webpack.externals || [];

	Object.assign(webpack, {externals});

	webpack.plugins.push(Progress.getPlugin());

	externals.push({'extjs': 'Ext'});

	baseConfig.webpackServer.noInfo = false;

	baseConfig.files.unshift('https://downloads.nextthought.com/libs/ext-4.2/ext-all.js');

	config.set(baseConfig);
};
