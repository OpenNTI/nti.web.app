/*eslint no-var: 0 strict: 0*/
'use strict';
var baseConfig = require('nti-unittesting-clientside');
var WebPack = require('webpack');
var start = new Date();
var chars = 0;

module.exports = function (config) {
	start = new Date();
	const webpack = baseConfig.webpack;
	const externals = webpack.externals || [];

	Object.assign(webpack, {externals});

	webpack.plugins.push(new WebPack.ProgressPlugin(progress));

	externals.push({'extjs': 'Ext'});

	baseConfig.webpackServer.noInfo = false;

	baseConfig.files.unshift('src/main/resources/vendor/ext/ext-all.js');

	config.set(baseConfig);
};


function progress (percentage, msg) {

	if(percentage < 1) {
		percentage = Math.floor(percentage * 100);
		msg = percentage + '% ' + msg;
		if(percentage < 100) {
			msg = ' ' + msg;
		}
		if(percentage < 10) {
			msg = ' ' + msg;
		}
	} else {
		msg += '\n';
	}

	if ((new Date() - start) < 5000) {
		return;
	}

	if (/emit/.test(msg)) {
		msg = '';
	}

	goToLineStart(msg);
	process.stderr.write(msg);
}


function goToLineStart (nextMessage) {
	var str = '';

	for(; chars > nextMessage.length; chars--) {
		str += '\b \b';
	}

	chars = nextMessage.length;
	for(let i = 0; i < chars; i++) {
		str += '\b';
	}
	if(str) {
		process.stderr.write(str);
	}
}
