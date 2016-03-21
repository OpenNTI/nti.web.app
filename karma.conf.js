/*eslint no-var: 0 strict: 0*/
'use strict';
var baseConfig = require('nti-unittesting-clientside');

module.exports = function (config) {
	const webpack = baseConfig.webpack;
	const externals = webpack.externals || [];

	Object.assign(webpack, {externals});


	externals.push({'extjs': 'Ext'});

	baseConfig.files.unshift('src/main/resources/vendor/ext/ext-all.js');

	config.set(baseConfig);
};
