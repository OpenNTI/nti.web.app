/*
 * WARNING: DO NOT mimic this file.  This is a very very special pattern where we are taking advantage Ext's
 * classloader.
 *
 * We are using the fact that the framework will not call the application's "launch" function until all requires are
 * satisfied.  So we are using the define as a make-shift callback/event emitter.
 *
 * Once all external libraries are loaded we define the class...which then lets the Ext.Loader finish dependency loads.
 *
 * this expects a libs.js in jsonp format. The function name is "loadExternalLibraries".
 *
 * The libraries arg should be an array of objects.
 * Each object will have a single key (the library name) and a value.
 *
 * The Value can be either a url string or an object, where the url is assigned to the url key, and a waitFor may be defined (it must define a symbole in the global space to wait for it to exist) then a callback can be defined on the key "cb".
 */

(function (global) {

	function finish() { Ext.define('NextThought.util.ExternalLibraries', {}); }

	function loadExternalLibraries(libs) {
		var rec = [];

		function maybeFinish(name) {
			if (name) {
				delete rec[name];
			}
			if (Object.keys(rec).length === 0) {
				finish();
			}
		}

		if (global.libsLoaded) {
			return;
		}
		Ext.each(libs, function (o) {
			Ext.Object.each(o, function waiting(name, v) {
				var cb = v && v.cb,
						url = (v && v.url) || v,
						waitFor = (v && v.waitFor) || false;

				rec[name] = true;

				if (waitFor && !global[waitFor]) {
					Ext.defer(waiting, 10, this, [name, v]);
					return;
				}

				Ext.Loader.loadScript({
										  url:     url,
										  onError: function () {
											  maybeFinish(name);
											  console.error(name + ' failed to load');
										  },
										  onLoad:  function () {
											  maybeFinish(name);
											  Ext.callback(cb);
											  /*console.debug(name+' finshed loading');*/
										  }
									  });
			});
		});
		maybeFinish();//if no libraries are defined, lets go ahead and finish.
		global.libsLoaded = true;
	}

	if (!global.libsLoaded) {
		global.loadExternalLibraries = loadExternalLibraries;
		Ext.Loader.loadScript('javascript/libs.js');
	}
	else {
		finish();
	}

}(window));
