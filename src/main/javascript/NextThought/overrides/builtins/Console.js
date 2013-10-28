Ext.define('NextThought.overrides.builtins.Console', function() {

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


	var fns = ['log', 'debug', 'info', 'warn', 'error', 'group', 'trace', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd'],
		originalLogFns = {};

	//capture the originals...
	Ext.copyTo(originalLogFns, console, fns, true);


	function disableLogging() {
		var l = fns.length - 1, fn = function() {};
		for (l; l >= 0; l--) {
			if (fns[l]) {
				console[fns[l]] = fn;
			}
		}
	}


	function enableLogging() {
		var l = fns.length - 1;
		for (l; l >= 0; l--) {
			if (fns[l]) {
				console[fns[l]] = originalLogFns[fns[l]];
			}
		}
	}


	console.enable = enableLogging;
	console.disable = disableLogging;

	if (!$AppConfig.enableLogging) {
		console.disable();
	}

	return {};
});
