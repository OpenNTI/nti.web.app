Ext.define('NextThought.overrides.builtins.Console', function() {

	$AppConfig.maxLogCapture = $AppConfig.maxLogCapture || 20;

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
		ignored = {
			debug: 1, group: 1, trace: 1, groupCollapsed: 1, groupEnd: 1, time: 1, timeEnd: 1
		},
		originalLogFns = {};

	//capture the originals...
	Ext.copyTo(originalLogFns, console, fns, true);


	console.getCollected = function() {
		try {
			return Ext.encode(log);
		}
		finally {
			log = [];
		}
	};


	function collect(string) {
		if (log.last() !== string) {
			log.push(string);
		}
		var max = $AppConfig.maxLogCapture,
			len = log.length;
		if (len > max) {
			log.splice(0, len - max);
		}
	}


	function getReportableValue(val) {
		var v = val;
		if (!val) {
			v = val;
		}
		else if (val.asJSON) {
			v = val.asJSON();
		} else if (val.toJSON) {
			v = val.toJSON();
		} else if (val.isComponent) {
			v = '{Component: xtype=' + val.xtype + ', id=' + val.id + '}';
		} else if (Ext.isObject(val)) {
			try {
				v = Ext.encode(val);
			} catch (encodeError) {
				v = '{Could not encode}';
			}
		} else if (Ext.isArray(val)) {
			v = Ext.Array.map(val, getReportableValue).join(',');
		}

		return v;
	}


	function getReporter(name) {
		if (ignored.hasOwnProperty(name) || !$AppConfig.enableLogCapture) {
			return function() {};
		}
		return function() {

			try {
				//get a trace (in WebKit)
	//			var e = new Error(name),
	//				stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
	//			      .replace(/^\s+at\s+/gm, '')
	//			      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@'),

				var args = [[name, ':'].join('')].concat(Array.prototype.slice.call(arguments)),
					x = args.length - 1;

				for (x; x >= 0; x--) {
					args[x] = getReportableValue(args[x]);
				}

				collect(args.join(' '));
			} catch (e) {
				collect('Could not collect log... ' + e.stack || e.message);
			}
		};
	}



	function disableLogging() {
		var l = fns.length - 1;
		for (l; l >= 0; l--) {
			if (fns[l]) {
				console[fns[l]] = getReporter(fns[l]);
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
