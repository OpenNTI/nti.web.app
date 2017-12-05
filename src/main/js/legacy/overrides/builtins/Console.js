const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.builtins.Console', function () {

	// $AppConfig.maxLogCapture = $AppConfig.maxLogCapture || 20;

	//make sure console exists
	Ext.applyIf(window, {
		console: { log: Ext.emptyFn }
	});

	//make sure console functions exist.
	Ext.applyIf(window.console, {
		debug: console.log,
		info: console.log,
		warn: console.log,
		error: console.log,
		group: Ext.emptyFn,
		trace: Ext.emptyFn,
		groupCollapsed: Ext.emptyFn,
		groupEnd: Ext.emptyFn,
		time: Ext.emptyFn,
		timeEnd: Ext.emptyFn
	});


	var log = [],
		fns = ['log', 'debug', 'info', 'warn', 'error', 'group', 'trace', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd'],
		// ignored = {
		// 	debug: 1, group: 1, trace: 1, groupCollapsed: 1, groupEnd: 1, time: 1, timeEnd: 1
		// },
		originalLogFns = {};

	//capture the originals...
	Ext.copyTo(originalLogFns, console, fns, true);


	function disableLogging () {
		var l = fns.length - 1;
		for (l; l >= 0; l--) {
			if (fns[l]) {
				console[fns[l]] = Ext.emptyFn;//getReporter(fns[l]);
			}
		}
	}


	function enableLogging () {
		var l = fns.length - 1;
		for (l; l >= 0; l--) {
			if (fns[l]) {
				console[fns[l]] = originalLogFns[fns[l]];
			}
		}
	}

	try {
		console.getCollected = function () {
			try {
				return log;
			}
			finally {
				log = [];
			}
		};

		console.enable = enableLogging;
		console.disable = disableLogging;

		if (!(global.$AppConfig || {}).enableLogging) {
			console.disable();
		}
	} catch (e) {
		console.error(e.stack || e.message || e);
	}

	return {};
});
