/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/app/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	
	__webpack_require__(70);
	__webpack_require__(57);
	__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./controller/Application\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	
	
	/*
	    This file is generated and updated by Sencha Cmd. You can edit this file as
	    needed for your application, but these edits will have to be merged by
	    Sencha Cmd when it performs code generation tasks such as generating new
	    models, controllers or views and when running "sencha app upgrade".
	
	    Ideally changes to this file would be limited and most work would be done
	    in other places (such as Controllers). If Sencha Cmd cannot merge your
	    changes and its generated code, it will produce a "merge conflict" that you
	    will need to resolve manually.
	*/
	
	// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
	//@require @packageOverrides
	
	window.URL = window.URL || window.webkitURL;
	window.Blob = window.Blob || window.webkitBlob;
	
	Ext.USE_NATIVE_JSON = true;
	
	//disable script cache-busting _dc=... get string args
	Ext.Loader.setConfig('disableCaching', false); //for when unminified
	
	Ext.application({
		name: 'NextThought',
		appProperty: 'appInstance',
		appFolder: '/app/js/NextThought',
		autoCreateViewport: false,
	
		requires: [
			'NextThought.util.Globals',
			'NextThought.overrides.*',
			'NextThought.util.Localization',//require this SUPER early.
			'NextThought.util.*'
	
			// 'Ext.grid.Panel',
			// 'Ext.grid.column.Date',
			// 'Ext.grid.plugin.CellEditing',
	
			// //Require this early so we have it if we need it
			// 'NextThought.view.MessageBar',
			// 'NextThought.view.MessageBox'
		],
	
		controllers: [
			'Application'
		],
	
		launch: function() {
			console.debug('launching');
	
			function start() {
				if (Ext.is.iOS) {
					Ext.getBody().addCls('x-ios');
				}
	
				Ext.applyIf($AppConfig, {links: {}});
	
				me.getController('Application').load(me);
	
				// me.getController('Session').login(me);
				NextThought.isReady = true;
			}
	
			var me = this, ios,
				reasons = [],
				unsupported = [], g,
				geckoRev = /rv:(\d+\.\d+)/.exec(Ext.userAgent) || [];
	
			Ext.each(//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
					['Canvas', 'Range', 'CSS3BoxShadow', 'CSS3BorderRadius'],
					function(f) {Boolean(!Ext.supports[f] && unsupported.push(f));});
	
	
			// allow PhantomJS through the browser block - at least far enough for our headless login test
			Ext.isPhantomJS = /PhantomJS/i.test(navigator.userAgent);
	
			// allow capybara-webkit through in the same way
			Ext.isCapybaraWebkit = /capybara-webkit/i.test(navigator.userAgent);
	
			ios = (function() {
				if (/iP(hone|od|ad)/.test(navigator.platform)) {
					var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
					return v && [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
				}
			}());
	
	
			if (unsupported.length > 0) {
				reasons.push('Required html5 features are not present: ' + unsupported.join(','));
			}
	
			if (!Ext.isIE && !Ext.isIE11p && !(Ext.isGecko && parseFloat(geckoRev[1]) > 23.9) && !Ext.isWebKit) {
				reasons.push('This version of FireFox is not supported.');
			}
	
			if (Ext.isIE9m) {
				reasons.push('Please use IE10 or newer');
			}
	
			if (Ext.isSafari && Ext.safariVersion < 6 && !Ext.isPhantomJS && !Ext.isCapybaraWebkit) {
				reasons.push('Please use the latest Safari available. Currently only 5.1+ is supported.');
			}
	
			if (ios && ios[0] < 6) {
				reasons.push('iOS 6 is the oldest iOS Safari we support.');
			}
	
			if (reasons.length > 0) {
				console.error(reasons.join('\n'));
				location.replace($AppConfig.server.unsupported);
				return;//we're leaving... so lets just stop here.
			}
	
			if (!Globals.validateConfig()) {
				return;
			}
	
			//Uncomment to supress cross domain flash socket message
			//window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;
	
			//if we get this far, we're good... no need to redirect to the unsupoprted page.
			//Clear out the old onerror if there is one and register our own.
			//Note: In chrome and firefox if you delete window.onerror and then reset
			//it the old onerror function gets called when an error occurs (bizarre)
			//That is why we just null it out here rather than deleting it.
			//delete window.onerror;
			window.onerror = null;
			window.reportErrorEvent();//keep the error reporter going.
	
			Globals.loadScript(getURL('/socket.io/static/socket.io.js'));
	
			start();
		}
	});
	
	//lets not show our dirty lawndry... urls sould be pretty with no "files" in them.
	if (location.toString().indexOf('index.html') > 0) {
		location.replace(location.toString().replace('index.html', ''));
	}


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = Ext;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	var ParseUtils = __webpack_require__(3);
	
	
	module.exports = exports = Ext.define('NextThought.util.Globals', {
		singleton: true,
	
	
		/* DATASERVER 2 Constants*/
		MESSAGE_INBOX: 'RUGDByOthersThatIMightBeInterestedIn',
		RECURSIVE_STREAM: 'RecursiveStream',
		RECURSIVE_USER_GENERATED_DATA: 'RecursiveUserGeneratedData',
		USER_GENERATED_DATA: 'UserGeneratedData',
		USER_SEARCH_REL: 'UserSearch',
		BULK_USER_RESOLVE_REL: 'ResolveUsers',
		USER_RESOLVE_REL: 'ResolveUser',
		USER_GENERATED_DATA_SEARCH_REL: 'UGDSearch',
		USER_UNIFIED_SEARCH_REL: 'UnifiedSearch',
		CONTENT_ROOT: 'tag:nextthought.com,2011-10:Root',
	
		ROOT_URL_PATTERN: /^\//,//starts with a slash
		HOST_PREFIX_PATTERN: /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?/i,
		FILE_EXTENSION_PATTERN: /\..+$/,
		INVALID_CHARACTERS_PATTERN: /^[^\/\\";=?<>#%'\{\}\|\^\[\]\-]+$/,
		ESCAPE_REGEX_PATTERN: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
	
	
		CANVAS_URL_SHAPE_BROKEN_IMAGE: 'whiteboard-error-image',
		CANVAS_BROKEN_IMAGE: 'whiteboard-broken-image',
	
		CANVAS_GOLDEN_RATIO: 1.6180,    //http://en.wikipedia.org/wiki/Golden_ratio
	
		SAD_FACE: Ext.DomHelper.markup({
			style: {
				color: '#bbb',
				font: 'normal 400 10em \'Helvetica Neue\', Helvetica, Arial, sans-serif',
				'-webkit-transform': 'rotate(90deg)',
				'-moz-transform': 'rotate(90deg)',
				'-ms-transform': 'rotate(90deg)',
				'-o-transform': 'rotate(90deg)',
				transform: 'rotate(90deg)',
				display: 'inline-block',
				position: 'absolute',
				left: '50%',
				'letter-spacing': '0.1em;'
			},
			html: ':('
		}),
	
		//Holy mother of perl! JSLint really hates the javascript protocol. :( We have to really obfuscate that string for it not to complain.
		EMPTY_WRITABLE_IFRAME_SRC: ('javascript' + (function() {return ':';}())),
	
		ANIMATE_NO_FLASH: {
			listeners: {
				afteranimate: Ext.emptyFn
			}
		},
	
		WAIT_TIMES: {
			SHORT: 300,
			LONG: 5000
		},
	
	
		INTERNAL_MIMETYPES: {
			'application/pdf': true,
			'application/x-pdf': true
		},
	
	
		escapeForRegex: function(str) {
			return str.replace(this.ESCAPE_REGEX_PATTERN, '\\$&');
		},
	
	
		//A utility wrapper around JSON.parse to catch errors
		parseJSON: function(s, safe) {
			try {
				return JSON.parse(s);
			} catch (e) {
				if (safe) {
					return null;
				}
	
				throw e;
			}
		},
	
	
		parseError: function(response) {
			var error,
				status = response.status,
				error;
	
			if (status === 422) {
				error = this.parseJSON(response.responseText, true);
			}
	
			return error;
		},
	
	
		//Remove leading and trailing /'s from a route
		trimRoute: function(route) {
			route = route || '';
			//get rid of any leading slash
			route = route.replace(/^\//, '');
			//get rid of any trailing slash
			route = route.replace(/\/$/, '');
	
			return route;
		},
	
	
		getContainerLoadingMask: function() {
			return {
				xtype: 'box',
				autoEl: {cls: 'loading-mask container-loading-mask', cn: {cls: 'load-text', html: 'Loading...'}}
			};
		},
	
		/**
		 * Should the given ntiid, url, and targetMimeType be opened in the app
		 * or in another window.
		 * @param  {String} ntiid          the ntiid of the thing
		 * @param  {Srring} url            the url to the thing
		 * @param  {String} basePath
		 * @param  {String} targetMimeType the mimeType of the thing to open
		 * @return {Boolean}               if we can show this in the app
		 */
		shouldOpenInApp: function(ntiid, url, basePath, targetMimeType) {
			var isTargetAnNTIID = ParseUtils.isNTIID(url),
				canHandleTypeInternally = this.INTERNAL_MIMETYPES[targetMimeType] || (/\.pdf$/i).test((url || '').split('?')[0]),
				parts = this.getURLParts(url),
				internal = true;
	
			if ($AppConfig.openExternalPDFsInNewWindow) {
				internal = (!parts.protocol || parts.protocol === location.protocol) && (!parts.hostname || parts.hostname === location.hostname);
			}
	
	
			return isTargetAnNTIID || (ntiid && canHandleTypeInternally && internal);
		},
	
	
		/**
		 * Search the navigator for a  mimeType
		 * @param  {String} type mimeType to search for
		 * @return {MimeType}    the mimeType if we find it or null
		 */
		getNavigatorMimeType: function(type) {
			var key, mimeType;
	
			for (key in navigator.mimeTypes) {
				mimeType = navigator.mimeTypes[key];
	
				if (mimeType && mimeType.type === type) {
					return mimeType;
				}
			}
		},
	
	
		/**
		 * Search the navigator for a plugin
		 * @param  {String} name name of the plugin
		 * @return {Plugin}      the plugin if we find it or null
		 */
		getNavigatorPlugin: function(name) {
			var key, plugin;
	
			for (key in navigator.plugins) {
				plugin = navigator.plugins[key];
	
				if (plugin && plugin.name === name) {
					return plugin;
				}
			}
		},
	
	
		/**
		 * Attempt to create an active x object
		 *
		 * @param  {String} name name of the application providing the object
		 * @return {Object}      the active x object or null if we couldn't create one
		 */
		getActiveXObject: function(name) {
			try {
				return new ActiveXObject(name);
			} catch (e) {
				swallow(e);
			}
		},
	
	
		/**
		 * Attempt to detect whether or not a browser can render a pdf
		 *
		 * Adapted from: http://stackoverflow.com/questions/21485521/detecting-adobe-reader-in-ie11-with-javascript
		 *
		 * @return {Boolean} true if it can, false it it can't
		 */
		hasPDFSupport: function() {
			var support = false;
	
			//check if pdfs are registered as supported by the browser
			if (this.getNavigatorMimeType('application/pdf')) {
				support = true;
			//check for a plugin that could render a pdf
			} else if (this.getNavigatorPlugin('Adobe Acrobat') || this.getNavigatorPlugin('Chrome PDF Viewer') || this.getNavigatorPlugin('WebKit built-in PDF')) {
				support = true;
			//for IE check if we can create an active x object to show a pdf`
			} else if (this.getActiveXObject('AcroPDF.PDF') || this.getActiveXObject('PDF.PdfCtrl')) {
				support = true;
			}
	
			return support;
		},
	
	
		flatten: function(a) {
			if (!a.reduce) { return a; }
	
			return a.reduce(function(acc, x) {
				if (Array.isArray(x)) {
					acc = acc.concat(x);
				} else {
					acc.push(x);
				}
	
				return acc;
			}, []);
		},
	
	
		getError: function(e) {
			return e.stack || e;
		},
	
		stopBackspace: function(doc) {
			function fn() {
				return function(e) {
					var t = e.getTarget(),
						key = e.getKey(),
						notInput = (!t || (!(/input|textarea/i).test(t.tagName) && !t.getAttribute('contenteditable')));
	
					if (notInput && (key === e.ESC || key === e.BACKSPACE)) {
						console.log('blocking key for: ', t);
						e.stopEvent();
						return false;
					}
					return true;
				};
			}
	
			Ext.fly(doc).on({
				keydown: fn(),
				keypress: fn()
			});
		},
	
	
		validateConfig: function() {
			var HOST_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?$/i,
				HOST_PATTERN_PROTOCOL_MATCH_GROUP = 1,
				HOST_PATTERN_DOMAIN_MATCH_GROUP = 3,
				HOST_PATTERN_PORT_MATCH_GROUP = 5;
	
			if (window.$AppConfig === undefined || $AppConfig.server === undefined) {
				alert('Bad or no configuation.');
				return false;
			}
	
			if ($AppConfig.server.login === undefined) {
				alert('Bad or no login configuation.');
				return false;
			}
	
			if (!HOST_PATTERN.test($AppConfig.server.host)) {
				if ($AppConfig.server.host) {
					console.warn('Bad host config', $AppConfig.server.host, 'using domain', document.domain);
				}
				$AppConfig.server.host = location.protocol + '//' + location.host;
			}
	
			if (!/^\/.+\/$/.test($AppConfig.server.data)) {
				alert('Bad Server Config, your data path does not validate the pattern: /.+/');
				return false;
			}
	    /*
			var hostInfo = HOST_PATTERN.exec($AppConfig.server.host);
	
			Ext.apply($AppConfig.server,{
				protocol: hostInfo[HOST_PATTERN_PROTOCOL_MATCH_GROUP],
				domain: hostInfo[HOST_PATTERN_DOMAIN_MATCH_GROUP],
				port: parseInt(hostInfo[HOST_PATTERN_PORT_MATCH_GROUP],10)
			});
	    */
	
			if ($AppConfig.server.jsonp === undefined) {
				$AppConfig.server.jsonp = Ext.isIE && !Ext.isIE10p;
			}
	
			return true;
		},
	
	
		/**
		 * Loads a script into the dom
		 *
		 * @param {String} url
		 * @param {Function} [onLoad]
		 * @param {Function} [onError]
		 * @param {Object} [scope]
		 */
		loadScript: function(url, onLoad, onError, scope, bustCache) {
			var head, doc = document,
				script, onLoadFn, onErrorFn;
	
			function buildCallback(cb, scope) {
				return function() {
					script.onload = null;
					script.onreadystatechange = null;
					script.onerror = null;
	
					if (cb && cb.call) {
						cb.call(scope || window, script);
					}
				};
			}
	
			if (url && typeof url === 'object') {
				doc = url.document;
				url = url.url;
			}
	
			head = doc && (doc.head || doc.getElementsByTagName('head')[0]);
			script = doc.createElement('script');
			onLoadFn = buildCallback(onLoad, scope);
			onErrorFn = buildCallback(onError, scope);
	
			if (bustCache === true) {
				url += (url.indexOf('?') < 0 ? '?' : '&') + '_dc=' + (new Date().getTime());
			}
	
			script.type = 'text/javascript';
			script.setAttribute('src', url);
			script.setAttribute('async', true);
			script.async = true;
			script.src = url;
			script.onload = onLoadFn;
			script.onerror = onErrorFn;
	
			script.onreadystatechange = function() {
				if (this.readyState === 'loaded' || this.readyState === 'complete') {
					onLoadFn();
				}
			};
	
			head.appendChild(script);
	
			return script;
		},
	
	
		loadScripts: function(urls, onLoad, scope, bustCache) {
			var u, stack = [], errors = false;
			function tick() {
				stack.pop();
				if (stack.length === 0) {
					Ext.callback(onLoad, scope, [errors]);
				}
			}
	
			function fail(s) {
				errors = true;
				console.error('Problem with: ' + s.src);
				tick();
			}
	
			for (u in urls) {
				if (urls.hasOwnProperty(u)) {
					stack.push(u);
					Globals.loadScript(urls[u], tick, fail, this, bustCache);
				}
			}
		},
	
	
		loadStyleSheetPromise: function(url, id) {
			var old, head;
			//TODO: maybe try to restore the old one if it fails
			return new Promise(function(fulfill, reject) {
				var doc = document, i = 0,
					link, checkInterval, sibling;
	
				if (typeof url === 'object') {
					doc = url.document;
					url = url.url;
				}
	
				if (typeof doc !== 'undefined') {
					head = doc.head || doc.getElementsByTagName('head')[0];
				} else {
					console.error('Document not defined');
					reject();
					return;
				}
	
				//If we are given an id, reuse that link
				if (id) {
					old = doc.getElementById(id);
				}
	
				if (old) {
					old.id = '';
				}
	
				link = doc.createElement('link');
				link.rel = 'stylesheet';
				link.type = 'text/css';
				link.id = id;
				link.href = url;
	
				if (old) {
					head.insertBefore(link, old);
					head.removeChild(old);
				} else {
					head.appendChild(link);
				}
	
	
				/**
				 * Check all the style sheets of the link to see if the it has rules
				 * @return {Boolean} true if one matches false otherwise
				 */
				function checkIfLoaded() {
					return link.style;
				}
	
				checkInterval = setInterval(function() {
					i++;
	
					if (i > 300) {
						clearInterval(checkInterval);
						reject();
					} else if (checkIfLoaded()) {
						clearInterval(checkInterval);
						fulfill();
					}
				}, 100);
			});
		},
	
	
		/**
		 * Load a stylesheet file (.css) into the DOM.
		 *
		 * @param {String} url
		 * @param {Function} [onLoad]
		 * @param {Function} [onFail]
		 * @param {Object} [scope] Context object to execute the onLoad/onFail callbacks
		 */
		loadStyleSheet: function(url, onLoad, onFail, scope) {
			var t, i = 0, doc = document, head, link, call, check;
	
			if (typeof url === 'object') {
				doc = url.document;
				url = url.url;
			}
	
			head = typeof doc !== 'undefined' &&
					(doc.head || doc.getElementsByTagName('head')[0]);
			link = doc.createElement('link');
			call = function(cb) {
				clearInterval(t);
				if (cb) {
					cb.call(scope || window, link);
				}
			};
			check = function() {
				i++;
				//30 seconds, if each interval is 10ms
				if (i > 3000) {
					call(onFail);
				}
				else if (link.style) {
					call(onLoad);
				}
			};
	
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = url;
	
			head.appendChild(link);
	
			if (onLoad || onFail) {
				t = setInterval(check, 10);
			}
	
			return link;
		},
	
	
		handleCache: function() {
			try {
				var ac = window.applicationCache;
				if (!ac) { return; }
	
				ac.addEventListener('updateready', function(e) {
										if (ac.status === ac.UPDATEREADY) {
											ac.swapCache();
											Ext.MessageBox.confirm(
												'Update Available',
												'A new version of this site is available. Load it now?',
												function(btn) {
													if (btn === 'yes') { window.location.reload(); }
												}
											);
										}
										//else: Manifest didn't changed. Nothing new to do.
									}, false);
			}
			catch (error) {
				console.error('Error handling html5 app cache', error);
			}
		},
	
	
		getAsynchronousTaskQueueForList: function(s) {
			var list = [], i = (s && (s.length || s) - 1) || 0;
			for (i; i > 0; i--) { list.push({}); }
			return list;
		},
	
	
		removeLoaderSplash: function() {
			var me = this;
			me.removeLoaderSplash = Ext.emptyFn;
			setTimeout(function() {
				var mask = Ext.get('loading-mask');
	
				if (mask) {
					mask.fadeOut({remove: true});
				}
			}, 100);
		},
	
	
		/*
		 * Returns whether two Arrays are equal.
		 *
		 * They are equal if they are the same
		 * length and contain equal elemens in order
		 *
		 * @param a - first array
		 * @param b - second array
		 * @param [fn] - an equality function.  If this is ommited === is used on each elment
		 */
		arrayEquals: function(a, b, fn) {
			var i;
			if (a.length !== b.length) {
				return false;
			}
	
			for (i = 0; i < a.length; i++) {
				if (fn && !fn(a[i], b[i])) {
					return false;
				}
				if (a[i] !== b[i]) {
					return false;
				}
			}
	
			return true;
		},
	
	
		/*
		 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
		 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
		 * https://github.com/overset/javascript-natural-sort/blob/master/naturalSort.js
		 */
		naturalSortComparator: function naturalSort(a, b) {
	
			function i(s) {
				s = String(s);
				return naturalSort.insensitive ? s.toLowerCase() : s;
			}
	
			var re = naturalSort.re = (naturalSort.re || /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi),
		        sre = naturalSort.sre = (naturalSort.sre || /(^[ ]*|[ ]*$)/g),
		        dre = naturalSort.dre =
					  (naturalSort.dre || /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/),
		        hre = naturalSort.hre = (naturalSort.hre || /^0x[0-9a-f]+$/i),
		        ore = naturalSort.ore = (naturalSort.ore || /^0/),
				// convert all to strings strip whitespace
		        x = i(a).replace(sre, '') || '',
		        y = i(b).replace(sre, '') || '',
		        // chunk/tokenize
		        xN = x.replace(re, '\u0000$1\u0000').replace(/\u0000$/, '').replace(/^\u0000/, '').split('\u0000'),
		        yN = y.replace(re, '\u0000$1\u0000').replace(/\u0000$/, '').replace(/^\u0000/, '').split('\u0000'),
		        // numeric, hex or date detection
		        xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
		        yD = parseInt(y.match(hre), 10) || (xD && y.match(dre) && Date.parse(y)) || null,
		        oFxNcL, oFyNcL, cLoc;
	
	
		    // first try and sort Hex codes or Dates
		    if (yD) {
		        if (xD < yD) { return -1; }
		        if (xD > yD) { return 1;}
			}
		    // natural sorting through split numeric strings and default strings
		    for (cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
		        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
		        oFxNcL = (!(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc])) || xN[cLoc] || 0;
		        oFyNcL = (!(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc])) || yN[cLoc] || 0;
		        // handle numeric vs string comparison - number < string - (Kyle Adams)
		        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
		        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
		        if ((typeof oFxNcL) !== (typeof oFyNcL)) {
		            oFxNcL += '';
		            oFyNcL += '';
		        }
		        if (oFxNcL < oFyNcL) { return -1; }
		        if (oFxNcL > oFyNcL) { return 1; }
		    }
		    return 0;
		},
	
	
		getNaturalSorter: function(field) {
			return function(a, b) {
				var sa = a.get(field), sb = b.get(field);
				return Globals.naturalSortComparator(sa, sb);
			};
		},
	
	
		getCaseInsensitiveNaturalSorter: function(field) {
			return function(a, b) {
				var sa = String(a.get(field)).toLowerCase(), sb = String(b.get(field)).toLowerCase();
				return Globals.naturalSortComparator(sa, sb);
			};
		},
	
	
		/**
		 * Returns a sorter function for the Array/Ext.Array sort method.
		 *
		 * @param {String} key - name of the field to compare.
		 * @param {String} [dir] - Direction "ASC" or "DESC" defaults to "DESC"
		 * @param {Function} [g] - Getter function, where the value in the array is passed, and the getter returns the comparable.
		 * @param {Boolean} [natural] - Sort strings naturally (1 2...10 vs 1 10 2 20 ...etc)
		 */
		SortModelsBy: function(key, dir, g, natural) {
			function $(v) {
				return (g ? g(v) : v).get(key);
			}
	
			var n = Globals.naturalSortComparator;
	
			return function(a, b) {
				var c = 0, $a = $(a), $b = $(b);
	
				if ($a !== $b) {
					c = natural && Ext.isString($a) ? n($a, $b) : $a < $b ? -1 : 1;
	
					//FIXME this seems backwards. If a < b it would sort to a lower
					//position and be -1.  That is the proper order for ascending
					//We should only negate it for desc. Yet it seems things using
					//it render properly.  Seems unlikely the logic is backwards everywhere.
					if (dir && dir === 'ASC') {
						c *= -1;
					}
				}
	
				return c;
	
			};
		},
	
		ensureSlash: function(s, atBeginning) {
			if (!s) {return;}
	
			var index = atBeginning ? 0 : (s.length - 1),
				c = s[index];
	
			if (c !== '/') {
				if (atBeginning) {return '/' + s;}
				else {return s + '/';}
			}
			return s;
		},
	
	
		/**
		 * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
		 */
		guidGenerator: function() {
			var S4 = function() {
			   return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			};
			return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
		},
	
	
		isMe: function(user) {
			var id = user;
			if (typeof user !== 'string' && user && user.getId) {
				id = user.getId();
			}
			return $AppConfig.username === id;
		},
	
	
		getViewIdFromComponent: function(c) {
			return c.up('view-container').id;
		},
	
		buildBlocker: function(scope, blockTime) {
			var me = scope,
				key = this.guidGenerator(),
				time = blockTime || 500;
	
			return function() {
				var block = me.hasOwnProperty(key);
	
				if (block) { clearTimeout(me[key]); }
	
				me[key] = setTimeout(
						function() { delete me[key]; },
						time);
	
				if (block) {
					throw 'stop';
				}
			};
		},
	
	
		getURLObject: function() {
			var url;
	
			if (window.URL && window.URL.createObjectURL) {
				url = window.URL;
			} else if (window.webkitURL && window.webkitURL.createObjectURL) {
				url = window.webkitURL;
			}
	
			return url;
		},
	
	
		getURLParts: function(url) {
			return Url.parse(url);
		},
	
	
		getURLRooted: function(url, root) {
			if (!url) { return ''; }
	
			if (Globals.HOST_PREFIX_PATTERN.test(url) || url.indexOf('/') === 0) {
				return url;
			}
	
			url = Globals.trimRoute(url);
	
			if (root) {
				return Globals.getURLRooted(Globals.trimRoute(root) + '/' + url + '/');
			}
	
			var host = $AppConfig.server.host.replace(/\/$/, '');
	
			url = host + '/' + url;
	
			if (!Globals.FILE_EXTENSION_PATTERN.test(url)) {
				url += '/';
			}
	
			return url;
		},
	
	
		getURL: function(u, root) {
			if (!u) {return '';}
			if (!Globals.HOST_PREFIX_PATTERN.test(u) && u.indexOf('//') !== 0) {
				if (!Ext.isEmpty(root)) {
					u = root + u;
					return getURL(u);
				}
				return $AppConfig.server.host + u;
			}
			return u;
		},
	
		getResourceURL: function(name) {
			var url, d = document.createElement('div');
			d.setAttribute('class', name);
			try {
				document.body.appendChild(d);
				url = Ext.fly(d).getStyle('background-image');
				document.body.removeChild(d);
				return (/^url\("?([^"\)]+)"?\)$/).exec(url)[1];
			}
			catch (e) {
				return null;
			}
		},
	
	
		reloadCSS: function(doc) {
			doc = (doc || document);
			console.log('Document Title:', doc.title);
			var cb = '_dc=',
				nodes = doc.querySelectorAll('link[rel=stylesheet]'),
				href, i = nodes.length - 1, v;
	
			for (i; i > 0; i--) {
				v = nodes[i];
				href = v.getAttribute('href');
				if (href.indexOf(cb) < 0) {
					href += ((href.indexOf('?') < 0 ? '?' : '&') + cb + Ext.Date.now());
				}
				else {
					href = href.replace(new RegExp(RegExp.escape(cb) + '\\d+', 'g'), cb + Ext.Date.now());
				}
	
				v.href = href;
				console.debug(v.getAttribute('href'));
			}
		},
	
	
		isFeature: function(name) {
			var f = $AppConfig.features || {};
			return Boolean(f[name]);
		},
	
	
		//taken from the login app
		EMAIL_REGEX: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	
		isEmail: function(email) {
			return this.EMAIL_REGEX.test(email);
		},
	
	
		sendEmailTo: function(to, subject, body, cc, bcc) {
			var href = 'mailto:';
	
			to = (Ext.isArray(to)) ? to : [to];
			subject = subject || '';
			body = body || '';
			cc = cc || '';
			bcc = bcc || '';
	
			if (Ext.isEmpty(to)) {
				console.error('Tried to send an email with no recepients');
				return;
			}
	
			subject = encodeURIComponent(subject);
			body = encodeURIComponent(body);
			cc = encodeURIComponent(cc);
			bcc = encodeURIComponent(bcc);
	
			href += to.join(',');
			href += '?subject=' + subject + '&body=' + body + '&cc=' + cc + '&bcc=' + bcc;
	
			console.debug('Opening email', href);
			location.href = href;
		}
	
	},
	function() {
		var proto = '__proto__';
		//TODO: figure out how to fix this globals
		window.guidGenerator = this.guidGenerator;
		window.isMe = this.isMe;
		window.getURL = this.getURL;
		window.swallow = function(e) {};
		window.getResourceURL = this.getResourceURL;
		window.reloadCSS = Ext.bind(this.reloadCSS, this);
		window.isFeature = this.isFeature;
	
		this.stopBackspace(document);
	
		this.handleCache();
	
	
		function makeImage(prop) {
			var src = Globals[prop];
			src = getResourceURL(src);
			if (!src) {
				console.warn('No Image for: ' + prop);
				return;
			}
			Globals[prop] = new Image();
			Globals[prop].src = src;
		}
		makeImage('CANVAS_URL_SHAPE_BROKEN_IMAGE');
		makeImage('CANVAS_BROKEN_IMAGE');
	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var ObjectUtils = __webpack_require__(4);
	var UtilObject = __webpack_require__(4);
	var ReaderJson = __webpack_require__(12);
	
	
	/*jslint continue: true*/
	/*globals console, document, DOMParser */
	module.exports = exports = Ext.define('NextThought.util.Parsing', {
	    singleton: true,
	    COMMON_PREFIX: 'tag:nextthought.com,2011-10:',
	
	    /**
		 * @param {String|String[]|Object|Object[]} items
		 * @param {Object} [supplemental] Properties to add to the parsed items (such as flags)
		 */
		parseItems: function(items, supplemental) {
			var key, item, reader, results = [];
	
			if (!Ext.isArray(items)) {
				items = (items && items.Items) || [items];
			}
	
			for (key in items) {
				if (items.hasOwnProperty(key)) {
					item = items[key] || {};
	
					if (typeof item === 'string') {item = Ext.JSON.decode(item);}
	
					if (item instanceof Ext.data.Model) {
						results.push(item);
						continue;
					}
	
					reader = this.getReaderFor(item);
					if (!reader) {
						console.debug('No reader for item: ', item);
						continue;
					}
	
					if (supplemental) {
						Ext.applyIf(item, supplemental);
					}
	
					results.push(reader.read(item).records[0]);
				}
			}
	
			return results;
		},
	
	    findModel: function(data) {
			function recurse(dir, modelName) {
				var sub, o = dir[modelName];
	
				if (o) {
					return o;
				}
	
				for (sub in dir) {
					if (dir.hasOwnProperty(sub) && sub !== 'MAP') {
						if (!dir[sub].$isClass && !dir[sub].singleton) {
							o = recurse(dir[sub], modelName);
							if (o) {return o;}
						}
					}
				}
	
				return null;
			}
	
			var name, m;
	
			if (data.MimeType) {
				m = NextThought.model.MAP[data.MimeType];
				m = m && Ext.ClassManager.get(m);
				if (m) {
					return m;
				}
	
				console.warn('No model for mimeType: ' + data.MimeType + '. Falling back to classname resolution: ' + data.Class);
			}
	
			if (Ext.isString(data)) {
				name = data;
			} else if (data.Class) {
				name = data.Class;
			}
	
			return recurse(NextThought.model, name);
		},
	
	    getReaderFor: function(item) {
			this.readers = this.readers || [];
	
			var o = this.findModel(item);
			if (!o) {
				console.error('no model found for ', item);
				return;
			}
	
			if (!this.readers[o.$className]) {
				this.readers[o.$className] = NextThought.proxy.reader.Base.create({
					model: o.$className, proxy: 'nti'
				});
			}
	
			return this.readers[o.$className];
	
		},
	
	    isNTIID: function(id) {
			return Boolean(this.parseNTIID(id));
		},
	
	    /**
		 * Parses an id and returns an object containing the split portions
		 * See http://excelsior.nextthought.com/server-docs/ntiid-structure/
	
		 * @param {String} id
		 * @return {Object} an object containing the components of the id
		 */
		parseNTIID: function(id) {
			var parts = (typeof id !== 'string' ? (id || '').toString() : id).split(':'),
				authority, specific,
				result = {};
	
			if (parts.length < 3 || parts[0] !== 'tag') {
				//console.warn('"'+id+'" is not an NTIID');
				return null;
			}
	
			//First part is tag, second is authority, third is specific portion
	
			//authority gets split by comma into name and date
			authority = parts[1].split(',');
			if (authority.length !== 2) {
				//invalid authority chunk
				return null;
			}
	
			result.authority = {
				name: authority[0],
				date: authority[1]
			};
	
			//join any parts after the 2nd into the specific portion that will
			//then be split back out into the specific parts.
			//TODO yank the fragment off the end
			specific = parts.slice(2).join(':');
			specific = specific.split('-');
	
			result.specific = {
				type: specific.length === 3 ? specific[1] : specific[0],
				typeSpecific: specific.length === 3 ? specific[2] : specific[1]
			};
	
			//Define a setter on provider property so we can match the ds escaping of '-' to '_'
			ObjectUtils.defineAttributes(result.specific, {
				provider: {
					getter: function() {return this.$$provider;},
					setter: function(p) {
						if (p && p.replace) {
							p = p.replace(/-/g, '_');
						}
						this.$$provider = p;
					}
				}
			});
	
			result.specific.provider = specific.length === 3 ? specific[0] : null;
	
			result.toString = function() {
				var m = this,
					a = [
						m.authority.name,
						m.authority.date
					],
					s = [
						m.specific.provider,
						m.specific.type,
						m.specific.typeSpecific
					];
				if (!m.specific.provider) {
					s.splice(0, 1);
				}
	
				return ['tag', a.join(','), s.join('-')].join(':');
			};
	
			//FIXME include authority?
			result.toURLSuffix = function() {
				//#!html/mathcounts/mathcounts2013.warm_up_7
				var m = this, components = [];
	
				components.push(m.specific.type);
				if (m.specific.provider) {
					components.push(m.specific.provider);
				}
				components.push(m.specific.typeSpecific);
	
				return '#!' + Ext.Array.map(components, encodeURIComponent).join('/');
			};
	
			return result;
		},
	
	    /**
		 * CSS escape ids
		 * @param {string} id
		 * @return {string} CSS-friendly string to use in a selector
		 */
		escapeId: function(id) {
			return id.replace(/:/g, '\\3a ') //no colons
					.replace(/,/g, '\\2c ')//no commas
					.replace(/\./g, '\\2e ');//no periods
		},
	
	    /**
		 * Returns the prefix of the content ntiid we think this ntiid would reside beneath
		 * @param {String} id
		 * @return {String}
		 */
		ntiidPrefix: function(id) {
			var ntiid = this.parseNTIID(id);
			if (ntiid) {
				ntiid.specific.type = 'HTML';
				ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.').first();
			}
			return ntiid && ntiid.toString();
		},
	
	    parseNtiFragment: function(fragment) {
			var authority = 'nextthought.com,2011-10',
				parts, type, provider, typeSpecific, s;
	
			if (Ext.isEmpty(fragment) || fragment.indexOf('#!') !== 0) {
				return null;
			}
			fragment = fragment.slice(2);
			parts = fragment.split('/');
			if (parts.length < 2 || parts.length > 3) {
				return null;
			}
	
			type = parts[0];
			provider = parts.length === 3 ? parts[1] : '';
			typeSpecific = parts.length === 3 ? parts[2] : parts[1];
	
			s = Ext.Array.map([provider, type, typeSpecific], decodeURIComponent);
			if (Ext.isEmpty(provider)) {
				s.splice(0, 1);
			}
	
			return ['tag', authority, s.join('-')].join(':');
		},
	
	    parseQueryString: function(qStr) {
			if (Ext.isEmpty(qStr)) {
				return null;
			}
			var r = {};
	
			Ext.each(qStr.split('&'), function(kv) {
				kv = kv.split('=');
				r[kv[0]] = decodeURIComponent(kv[1]);
			});
	
			r.toString = function() {
				var out = [], k;
				for (k in this) {
					if (this.hasOwnProperty(k)) {
						out.push([k, encodeURIComponent(this[k])].join('='));
					}
				}
				return out.join('&');
			};
			return r;
		},
	
	    isEncodedNTIID: function(component) {
			var decoded = this.decodeFromURI(component);
	
			return this.isNTIID(decoded) && !this.isEncodedNTIIMimeType(component);
		},
	
	    isEncodedNTIIMimeType: function(component) {
			var decoded = decodeURIComponent(component),
				index = decoded.indexOf('application/vnd.nextthought');
	
			return index > -1;
		},
	
	    encodeForURI: function(ntiid) {
			var cut = this.COMMON_PREFIX.length;
	
			if (ntiid && ntiid.substr(0, cut) === this.COMMON_PREFIX) {
				ntiid = ntiid.substr(cut);
			}
	
			return encodeURIComponent(ntiid);
		},
	
	    decodeFromURI: function(component) {
			var ntiid = decodeURIComponent(component);
	
			if (!this.isNTIID(ntiid) && ntiid.substr(0,3) !== 'tag') {
				ntiid = this.COMMON_PREFIX + ntiid;
			}
	
			return ntiid;
		}
	},function() {
		/*
		 * DOMParser HTML extension
		 * 2012-02-02
		 *
		 * By Eli Grey, http://eligrey.com
		 * Public domain.
		 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
		 */
	
		/*! @source https://gist.github.com/1129031 */
		(function(DOMParser) {
		    'use strict';
		    var DOMParser_proto = DOMParser.prototype,
				real_parseFromString = DOMParser_proto.parseFromString;
	
		    // Firefox/Opera/IE throw errors on unsupported types
		    try {
		        // WebKit returns null on unsupported types
		        if ((new DOMParser()).parseFromString('', 'text/html')) {
		            // text/html parsing is natively supported
		            return;
		        }
		    } catch (ex) {}
	
		    DOMParser_proto.parseFromString = function(markup, type) {
			    if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
				    var doc = document.implementation.createHTMLDocument(''),
					    doc_elt = doc.documentElement,
					    first_elt;
	
				    try {
					    doc_elt.innerHTML = markup;
					    first_elt = doc_elt.firstElementChild;
	
					    if (doc_elt.childElementCount === 1 && first_elt.localName.toLowerCase() === 'html') {
						    doc.replaceChild(first_elt, doc_elt);
					    }
				    }
				    catch (IE_SUCKS) {
					    console.warn('Head tags may not be returned from queries, due to polyfill/browser shortcomings');
					    doc.body.innerHTML = markup;
				    }
	
				    return doc;
			    }
			    return real_parseFromString.apply(this, arguments);
		    };
		}(DOMParser));
	});


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.util.Object', {
		alternateClassName: 'ObjectUtils',
		singleton: true,
	
	
		deleteFunctionProperties: function deleteFunctionsOn(o, allowClassRefs) {
			var key;
			//let the functions go, free up some captured scopes
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					if (Ext.isFunction(o[key])) {
						delete o[key];
					} else if (o[key] && o[key].$className && allowClassRefs !== true) {
						o[key] = 'ref to a ' + o[key].$className;
					} else if (Ext.isObject(o[key]) && !o[key].$className) {
						deleteFunctionsOn(o[key], allowClassRefs);
					}
				}
			}
		},
	
	
		defineAttributes: function(obj, attrs) {
			var setter = '__defineSetter__',
				getter = '__defineGetter__',
				hasDefineProp = Boolean(Object.defineProperty),
				a, g, c, s, e = function() {};
	
			for (a in attrs) {
				if (attrs.hasOwnProperty(a)) {
					g = attrs[a].getter || e;
					s = attrs[a].setter || e;
					c = attrs[a].configurable || false;
	
					if (hasDefineProp) {
						Object.defineProperty(obj, a, { configurable: c, enumerable: true, set: s, get: g });
					}
					else {
						obj[setter](a, s);
						obj[getter](a, g);
					}
				}
			}
		},
	
	
		clean: function clean(o) {
			var key, v;
			if (!o || !Ext.isObject(o)) {return;}
			for (key in o) {
				if (o.hasOwnProperty(key)) {
					v = o[key];
					if (!v || clean(v)) {//remove falsy values and empty objects
						delete o[key];
					}
				}
			}
	
			return Ext.Object.isEmpty(o);
		}
	});


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(fetch) {
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var UserRepository = __webpack_require__(5);
	var User = __webpack_require__(7);
	var ParseUtils = __webpack_require__(3);
	var UtilParsing = __webpack_require__(3);
	var ModelUser = __webpack_require__(7);
	var ChatStateStore = __webpack_require__(13);
	
	
	module.exports = exports = Ext.define('NextThought.cache.UserRepository', {
	    alias: 'UserRepository',
	    singleton: true,
	    isDebug: $AppConfig.userRepositoryDebug,
	
	    constructor: function() {
			Ext.apply(this, {
				store: null,
				activeRequests: {},
				_activeBulkRequests: new Ext.util.MixedCollection(),
				_queuedBulkRequests: new Ext.util.MixedCollection(),
				_pendingResolve: {}
			});
	
			var active = this._activeBulkRequests,
				queued = this._queuedBulkRequests, task;
	
			task = Ext.util.TaskManager.newTask({
				interval: 50,
				run: function() {
					var t, i = $AppConfig.userBatchResolveRequestStagger || 20;
					function removeWhenDone(t) {
						return function() {
							active.remove(t);
						};
					}
					for (i; i > 0 && queued.getCount() > 0; i--) {
						t = queued.removeAt(0);
						if (t) {
							t = t();
							if (t) {
								active.add(t);
								t.always(removeWhenDone(t));
							}
						} else {
							task.stop();
						}
					}
					if (queued.getCount() === 0) {
						task.stop();
					}
				}
			});
	
			queued.on('add', 'start', task);
	
			this.ChatStore = NextThought.app.chat.StateStore.getInstance();
	
			this.setPresenceChangeListener(this.ChatStore);
		},
	
	    //<editor-fold desc="Private Interfaces">
		getStore: function() {
			if (!this.store) {
				this.store = Ext.data.Store.create({model: 'NextThought.model.User'});
				//By default getById on the store is order n.  given we need to call this to both cache
				//and retrieve data that makes resolving a big chunk of users n^2.  Mixed collection
				//supports constant lookups if you can do it by key (which we can for users) so replace
				//the implementation with something faster.
				this.store.getById = function(theId) {
					return (this.snapshot || this.data).getByKey(theId);
				};
			}
			return this.store;
		},
	
	    setPresenceChangeListener: function(store) {
			store.on('presence-changed', this.presenceChanged, this);
		},
	
	    precacheUser: function(refreshedUser) {
			var s = this.getStore(), uid, u;
	
			if (refreshedUser.getId === undefined) {
				refreshedUser = ParseUtils.parseItems(refreshedUser)[0];
			}
	
			uid = refreshedUser.getId();
			u = s.getById(uid); //user from the store
	
			//console.log('Update user called with', refreshedUser);
	
			//if the store had the user
			// AND it was not equal to the refreshedUser (the user resolved from the server)
			if (u && !u.equal(refreshedUser)) {
				//If we have a current user, and the user from the store is that user (compared by ID)
				if ($AppConfig.userObject && isMe(u)) {
					//If the INSTANCE of the user from the store does not match the instance of the current user object
					if (u !== $AppConfig.userObject) {
						/*//this is strange...why do we get here?
						console.warn('AppConfig user instance is different');
						//if the user in the store is not the same object as our global reference, then we need to make sure
						// that we fire changed event just incase someone is listening to it.
						$AppConfig.userObject.fireEvent('changed', u);
	
						//Correct the problem
						$AppConfig.userObject = u;*/
						if (this.isDebug) {
							console.log('Asked to precache an appuser that isnt the current $AppConfig.userObject. Dropping');
						}
						return;
					}
				}
	
				//If the incoming object is a summary object (not from a resolve user call)
				//we don't want to merge into a non summary object.  We end up losing data
				if (!refreshedUser.summaryObject || u.summaryObject) {
					this.mergeUser(u, refreshedUser);
				}
			}
	
			if (!u) {
				this.cacheUser(refreshedUser);
			}
		},
	
	    /*searchUser: function(query) {
			var fieldsToMatch = ['Username', 'alias', 'realname', 'email'],
				regex = new RegExp(query),
				matches;
			matches = this.getStore().queryBy(function(rec) {
				var matched = false;
	
				Ext.each(fieldsToMatch, function(field) {
					var v = rec.get(field);
					if (v && regex.test(v)) {
						matched = true;
					}
					return !matched;
				});
	
				return matched;
			});
			return matches;
		},*/
	
	
		mergeUser: function(fromStore, newUser) {
			//Do an in place update so things holding references to us
			//don't lose their listeners
			//console.debug('Doing an in place update of ', fromStore, 'with', newUser.raw);
			fromStore.set(newUser.raw);
	
			//For things (hopefully legacy things only) listening to changed events
			fromStore.fireEvent('changed', fromStore);
		},
	
	    cacheUser: function(user, maybeMerge) {
			var s = this.getStore(),
				id = user.getId() || user.raw[user.idProperty],
				fromStore = s.getById(id);
			if (fromStore) {
				if (maybeMerge) {
					this.mergeUser(fromStore, user);
					return fromStore;
				}
	
				s.remove(fromStore);
	
			}
			if (this.isDebug) {
				console.debug('Adding resolved user to store', user.getId(), user);
			}
			s.add(user);
			return user;
		},
	
	    resolveFromStore: function(key) {
			var s = this.getStore();
			return s.getById(key) || s.findRecord('Username', key, 0, false, true, true) || s.findRecord('NTIID', key, 0, false, true, true);
		},
	
	    //</editor-fold>
	
		//<editor-fold desc="Public Interface">
		getUser: function(username, callback, scope, forceFullResolve, cacheBust) {
			if (!Ext.isArray(username)) {
				username = [username];
				username.returnSingle = true;
			}
	
			//Did someone do something stupid and send in an empty array
			if (Ext.isEmpty(username)) {
				Ext.callback(callback, scope, [[]]);
				return Promise.resolve([]);
			}
	
			var me = this,
				result = {},
				l = username.length,
				names = [],
				toResolve = [],
				canBulkResolve = !forceFullResolve && isFeature('bulk-resolve-users');
	
			return new Promise(function(fulfill, reject) {
	
				function maybeFinish(k, v) {
					result[k] = v;
					l -= 1;
	
					if (l <= 0) {
						result = names.map(function(n) {
							return result[n] || User.getUnresolved(n);
						});
	
						if (username.returnSingle) {
							result = result.first();
						}
						fulfill(result);
						Ext.callback(callback, scope, [result]);
					}
				}
	
				username.forEach(function(o) {
						var name, r;
	
						if (Ext.isString(o)) {
							name = o;
						}
						else if (o.getId !== undefined) {
							if (o.isUnresolved && o.isUnresolved() === true) {
								names.push(o.getId());
								maybeFinish(o.getId(), o);
								return;
							}
							name = o.getId();
						}
						else {
							//JSON representation of User
							r = ParseUtils.parseItems(o)[0];
							if (!r || !r.getModelName) {
								Ext.Error.raise({message: 'Unknown result', object: r});
							}
							name = r.getId();
						}
						names.push(name);
	
						r = me.resolveFromStore(name);
						if (r && r.raw && (!forceFullResolve || !r.summaryObject)) {
							maybeFinish(name, r);
							return;
						}
	
						if (ParseUtils.isNTIID(name)) {
							Service.getObject(name)
								.then(function(u) {
									maybeFinish(name, me.cacheUser(u, true));
								})
								.fail(function() {
									maybeFinish(name);
								});
	
							return;
						}
	
						result[name] = null;
						toResolve.push(name);
						//Legacy Path begin:
						if (!canBulkResolve) {
							me.makeRequest(name, {
								scope: me,
								failure: function() {
									maybeFinish(name, User.getUnresolved(name));
								},
								success: function(u) {
									//Note we recache the user here no matter what
									//if we requestsd it we cache the new values
									maybeFinish(name, me.cacheUser(u, true));
								}
							}, cacheBust);
						} else {
							console.debug('Defer to Bulk Resolve...', name);
						}
						//Legacy Path END
					});
	
				if (toResolve.length > 0 && canBulkResolve) {
					me.bulkResolve(toResolve)
						.done(function(users) {
							//Note we recache the user here no matter what
							//if we requestsd it we cache the new values
							users.forEach(function(u) { maybeFinish(u.getId(), me.cacheUser(u, true)); });
							if (l > 0) {
								l = 0;
								maybeFinish();
							}
						})
						.fail(function(reason) {
							console.error('Failed to bulk resolve: %o %o', toResolve, reason);
							reject(reason);
							fulfill = Ext.emptyFn;
							Ext.callback(callback, scope, [[]]);
						});
				}
	
			});
		},
	
	    //</editor-fold>
	
	
		//<editor-fold desc="Bulk Request">
		/**
		 * Perform a bulk resolve. (and gather as many concurent resolves as posible w/o delaying too long)
		 * @param {String[]} names
		 * @return {Promise}
		 */
		bulkResolve: (function() {
			var toResolve = [],
				pending = [],
				work = Ext.Function.createBuffered(function() {
					var job = pending,
						load = toResolve;
	
					toResolve = [];
					pending = [];
	
					console.debug('Resolving in bulk...', load.length);
	
					this.makeBulkRequest(load)
							.done(function(v) {
								job.forEach(function(p) {
									try {
										p.fulfill(v);
									} catch (e) {
										console.error('%s: %o', e.message, e);
									}
								});
							})
							.fail(function(v) {
								job.forEach(function(p) {
									try {
										p.reject(v);
									} catch (e) {
										console.error('%s: %o', e.message, e);
									}
								});
							});
				}, 10);
	
			function toWork(names, fulfill, reject) {
				toResolve = Ext.Array.unique(toResolve.concat(names));
				pending.push({
					fulfill: fulfill,
					reject: reject
				});
				work.call(this);
			}
	
			return function(names) {
				var me = this;
	
				names = Ext.Array.unique(names);
	
				return new Promise(function(fulfill, reject) {
	
					function success(v) {
						var fulfillment = [], x, i;
	
						for (i = v.length - 1; i >= 0; i--) {
	
							for (x = names.length - 1; x >= 0; x--) {
	
								if (v[i] && names[x] === v[i].getId()) {
									fulfillment.push(v[i]);
								}
							}
						}
	
						if (fulfillment.length !== names.length) {
							console.warn('Length missmatch! Assuming this is due to communities in the list.', names, fulfillment, v);
						}
						fulfill(fulfillment);
					}
	
					toWork.call(me, names.slice(), success, reject);
				});
			};
		}()),
	
	    makeBulkRequest: function(usernames) {
			var me = this,
				chunkSize = $AppConfig.userBatchResolveChunkSize || 200;
	
			function rebuild(lists) {
				return me.__recompose(usernames, lists);
			}
	
			return Promise.all(usernames.chunk(chunkSize).map(me.__chunkBulkRequest.bind(me)))
					.done(rebuild)
					.fail(function failed(reason) {
						console.error('Failed: %o', reason);
						return Promise.reject(reason);
					});
		},
	
	    __recompose: function(names, lists) {
			var agg = [],
				i = lists.length - 1,
				x, list, u, m = {};
	
			agg.length = names.length;//JSLint doesn't like the Array(size) constructor. SO, lets just do the two-step version. (declare, then assign length :|)
	
			names.forEach(function(n, ix) { m[n] = ix; });
	
			//because we may not have the same lists of requested items,
			// we must rebuild based on usernames.
			for (i; i >= 0; i--) {
				list = lists[i] || [];
				for (x = (list.length - 1); x >= 0; x--) {
					u = list[x] && list[x].getId && list[x].getId();
					if (u && m.hasOwnProperty(u)) {
						agg[m[u]] = list[x];
					}
				}
			}
			return agg;
		},
	
	    __chunkBulkRequest: function(names) {
			var me = this,
				divert = [], requestNames,
				active = me._pendingResolve;
	
			requestNames = names.filter(function(n) {
				var a = active[n], u;
				if (a && divert.indexOf(a) === -1) {
					divert.push(a);
				} else {
					u = me.getStore().getById(n);
					if (u) {
						a = Promise.resolve([u]);
						divert.push(a);
					}
				}
	
				return !a;
			});
	
			if (requestNames.length > 0) {
				divert.push(me.__bulkRequest(requestNames));
			}
	
			return Promise.all(divert)
				.done(function(lists) {
					return me.__recompose(names, lists);
				})
				.fail(function(reason) {
					console.error('Failed: %o', reason);
					return Promise.reject(reason);
				});
		},
	
	    __bulkRequest: function(names) {
			var me = this,
				store = me.getStore(),
				active = me._pendingResolve,
				requestQue = me._queuedBulkRequests, p;
	
			function recieve(json) {
				var u = [], i = names.length - 1, o, n;
	
				json = (json || {}).Items || {};
	
				store.suspendEvents(true);
	
				//large sets, use as little extra function calls as possible.
				for (i; i >= 0; i--) {
					n = names[i];
					o = json[n];
					if (o) {
						o = json[n];
						if (o.MimeType === User.mimeType) {
							o = User.create(o, n);
						} else {
							console.warn('Parsing a non-user: "%s" %o', n, o);
							o = ParseUtils.parseItems(o)[0];
						}
						o.summaryObject = true;
						me.cacheUser(o, true);
						me.updatePresenceFromResolve([o]);
					} else {
						o = User.getUnresolved(n);
					}
					u.push(o);
				}
	
				store.resumeEvents();
	
	
				//schedual cleanup.
				wait(60000).then(function() {
					console.debug('Cleanup...');
					var i = names.length - 1;
					for (i; i >= 0; i--) {
						delete active[names[i]];
					}
				});
	
				return u;
			}
	
			function fire(fulfill) {
	
				return wait()
					.then(function() {
						return me.__makeRequest({
							url: Service.getBulkResolveUserURL(),
							method: 'POST',
							jsonData: {usernames: names}
						});
					})
					.always(recieve)
					.done(fulfill);
			}
	
			p = new Promise(function(fulfill, reject) {
				requestQue.add(fire.bind(null, fulfill, reject));
			});
	
			names.forEach(function(n) { active[n] = p; });
	
			return p;
		},
	
	    __foregroundRequest: function() {
			console.log('Requesting in foreground');
			return Service.request.apply(Service, arguments)
					.then(function(txt) { return Ext.decode(txt, true); });
		},
	
	    __makeRequest: function(req) {
			var w = this.worker, p, a = {};
			if (!w) {
				return this.__foregroundRequest(req);
			}
	
			a = w.active = w.active || a;
	
			p = new Deferred();//required to be a Deferred, since our worker communication
			// is "evented", we cannot pass a callback. Though, I'm sure we can reorganize
			// this logic to make it more 'proper'
	
			if (a.hasOwnProperty(p.id)) {
				console.error('ASSERTION FAILED');
				return;
			}
	
			a[p.id] = p;
			req.id = p.id;
			w.postMessage(req);
			return p;
		},
	
	    __workerMessage: function(msg) {
			var data = msg.data,
				w = this.worker, p, a;
			if (!w) {
				Ext.Error.raise('How did you get here without a worker?');
			}
	
			a = w.active = w.active || {};
			p = a[data.id];
			if (!p) {
				Ext.Error.raise('Bad Message, requet finished, but nothing was listening.');
			}
	
			delete a[data.id];
			p.fulfill(data.result);
		},
	
	    //</editor-fold>
	
	
		/**
		 * Once called, if the user is not in the cache, a placeholder object will be injected. If something requests that
		 * user while its still resolving, the record will not have a 'raw' property and it will have 'placeholder' set true
		 * in the 'data' property.
		 *
		 * @param {String} username
		 * @param {Object} callbacks
		 * @param {Boolean} cacheBust
		 */
		makeRequest: function(username, callbacks, cacheBust) {
			var me = this,
				result = null,
				url = Service.getResolveUserURL(username),
				options;
	
			if (cacheBust) {
				url += (url.indexOf('?') < 0 ? '?' : '&') + '_dc=' + (new Date()).getTime();
			}
	
			if (!username) {
				console.error('no user to look up');
				return null;
			}
	
			function callback(o, success, r) {
	
				delete me.activeRequests[username];
	
				if (!success) {
					if (this.debug) {
						console.warn('There was an error resolving user:', username, arguments);
					}
					if (callbacks && callbacks.failure) {
						callbacks.failure.call(callbacks.scope || this);
					}
					return;
				}
	
				var json = Ext.decode(r.responseText),
					list = ParseUtils.parseItems(json.Items);
	
				if (list && list.length > 1) {
					console.warn('many matching users: "', username, '"', list);
				}
	
				list.forEach(function(u) {
					if (u.get('Username') === username) {
						result = u;
						u.summaryObject = false;
						return false;
					}
				});
	
				me.updatePresenceFromResolve(list);
	
				if (result && callbacks && callbacks.success) {
					callbacks.success.call(callbacks.scope || this, result);
				}
	
				if (!result) {
					if (callbacks && callbacks.failure) {
						callbacks.failure.call(callbacks.scope || this);
					}
				}
			}
	
			if (this.activeRequests[username] && this.activeRequests[username].options) {
				//	console.log('active request detected for ' + username);
				options = this.activeRequests[username].options;
				options.callback = Ext.Function.createSequence(
					options.callback,
					function() {
						callback.apply(me, arguments);
					}, me);
				return null;
			}
	
	
			this.activeRequests[username] = Ext.Ajax.request({
				url: url,
				scope: me,
				async: !!callbacks,
				callback: callback
			});
	
			return result;
		},
	
	    updatePresenceFromResolve: function(list) {
			var store = this.ChatStore;
	
			list.forEach(function(u) {
				//check if we already have a presence info for them
				var presence = store.getPresenceOf(u.get('Username'));
				if (presence) {
					u.set('Presence', presence);
				}
			});
		},
	
	    presenceChanged: function(username, presence) {
			var u = this.getStore().getById(username), newPresence;
			if (this.debug) {console.log('User repository recieved a presence change for ', username, arguments);}
			newPresence = (presence && presence.isPresenceInfo) ?
						  presence :
						  NextThought.model.PresenceInfo.createFromPresenceString(presence, username);
	
			if (u) {
				if (this.debug) {
					console.debug('updating presence for found user', u);
				}
				u.set('Presence', newPresence);
				u.fireEvent('changed', u);
			}
			else if (this.debug) {
				console.debug('no user found to update presence');
			}
		}
	},
	function() {
		function worker() {
			var keep = {
				Class: 1,
				CreatedTime: 1,
				avatarURL: 1,
				Links: 1,
				MimeType: 1,
				NTIID: 1,
				OU4x4: 1,
				Username: 1,
				alias: 1,
				realname: 1,
				NonI18NLastName: 1,
				NonI18NFirstName: 1,
				href: 1,
				//profile fields (can't drop these) It would be nice to not to include these until we view the profile. (separate call?)
				about: 1,
				affiliation: 1,
				description: 1,
				home_page: 1,
				location: 1,
				role: 1
			};
	
			self.addEventListener('message', function(e) {
				var resp = {};
				fetch(e.data, function(json, shell) {
					var i, l, o, p;
	
					resp.id = e.data.id;
					try {
						resp.result = JSON.parse(json);
					} catch (er) {
						console.error(json + '\n', er.stack || er.message || er);
						resp.result = {};
					}
	
					if (shell) {
						l = (resp.result || {}).Items || {};
	
						if (l.avatarURL == null) {
							l.avatarURL = '@@avatar';
						}
	
						for (i in l) {
							if (l.hasOwnProperty(i)) {
								o = l[i];
								for (p in o) {
									if (o.hasOwnProperty(p) && !keep[p]) {
										delete o[p];
									}
								}
								o.shell = true;
							}
						}
					}
	
					self.postMessage(resp);
				});
			}, false);
	
			function fetch(data, fn) {
				var req = new XMLHttpRequest();
				req.open('POST', data.url, true);
				if (!data.hasOwnProperty('shell')) {
					data.shell = true;
				}
	
				req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
				req.setRequestHeader('Accept', 'application/json');
	
				req.onreadystatechange = function() {
					if (req.readyState === 4) {
						if (req.status === 200) {
							fn(req.responseText, data.shell);
						} else {
							fn('Error: ' + req.status);
						}
					}
				};
				req.send(JSON.stringify(data.jsonData));
			}
		}
		try {
			var re = /(__cov_\$[^\[]+\['\d+'\])(\[\d+\])?(\+\+)[;,]\s*/ig,//istanbul's (code coverage) instrumentation pattern
				code = worker.toString();
	
			if (Ext.isIE11p) { throw 'Webworkers are broken in IE11'; }
	
			//unit tests' coverage reporter doesn't instrument the generated
			// code correctly and causes code execution to halt. So, strip it out for now.
			code = code.replace(re, '');
	
			this.worker = new Worker(URL.createObjectURL(new Blob(['(', code, ')();'], {type: 'text/javascript'})));
			this.worker.onmessage = this.__workerMessage.bind(this);
			this.worker.onerror = function() {
				delete UserRepository.worker;
				console.error('No Worker for bulk resolve');
			};
		} catch (e) {
			console.error('No Worker for bulk resolve');
		}
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(73)))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	var ParseUtils = __webpack_require__(3);
	var TimeUtils = __webpack_require__(8);
	var MixinsHasLinks = __webpack_require__(10);
	var MixinsHasLinks = __webpack_require__(10);
	var ConvertersContentRangeDescription = __webpack_require__(19);
	var ConvertersDCCreatorToAuthor = __webpack_require__(20);
	var ConvertersDate = __webpack_require__(21);
	var ConvertersFuture = __webpack_require__(22);
	var ConvertersGroupByTime = __webpack_require__(23);
	var ConvertersItems = __webpack_require__(24);
	var ConvertersLinks = __webpack_require__(25);
	var ConvertersPresenceInfo = __webpack_require__(11);
	var ConvertersSynthetic = __webpack_require__(26);
	var ConvertersUsers = __webpack_require__(27);
	var ConvertersVideoSources = __webpack_require__(28);
	var UtilTime = __webpack_require__(8);
	var UtilParsing = __webpack_require__(3);
	var ProxyRest = __webpack_require__(66);
	
	
	module.exports = exports = Ext.define('NextThought.model.Base', {
	    extend: 'Ext.data.Model',
	
	    mixins: {
			hasLinks: 'NextThought.mixins.HasLinks'
		},
	
	    inheritableStatics: {
			idsBeingGloballyUpdated: {},
	
			isInstanceOf: function(instance) {
				return instance instanceof this;
			}
		},
	
	    statics: {
			/**
			 * Fact: creating elements is *kind of* expensive.
			 * Fact: JavaScript is thread-safe, because its not threaded. Its Evented. No more than one block of code runs at a time.
			 * Fact: Anchor tags implement the Location API. Setting a value to the href attribute populates:
			 *  #host, #hostname, #protocol, #port, #pathname, #search, #hash and #origin
			 *  AND modifiying those attribute updates #href.
			 *
			 *  Given those, we can safely make a single instance and share it for use of URL normalization and parsing.
			 *
			 *  ALWAYS set the href before using. NEVER rely on its previous value. Think of this the same way you would the return value of Ext.fly().
			 *  As in temporary!  Assume once your 'atomic' like action is finished, the value is useless. Reaquire, or re-init.
			 */
			__SHARED_LOCATION_INTERFACE: document.createElement('a'),
	
			/**
			 * Gives you the shared location interface intialized to a given ref.
			 *
			 * ALWAYS set the href before using. NEVER rely on its previous value. Think of this the same way you would the return value of Ext.fly().
			 * As in temporary!  Assume once your 'atomic' like action is finished, the value is useless. Reaquire.
			 *
			 * @param {String} ref
			 * @return {Location}
			 */
			getLocationInterfaceAt: function(ref) {
				var a = this.__SHARED_LOCATION_INTERFACE;
				a.setAttribute('href', ref);
				return a;
			}
		},
	
	    idProperty: 'NTIID',
	    proxy: { type: 'nti' },
	
	    fields: [
			{ name: 'Class', type: 'string', persist: false },
			{ name: 'ContainerId', type: 'string', useNull: true, convert: function(v) {
				if (v && v.isModel) { v = v.getId(); }
				if (!Ext.isString(v)) {console.error('The ContainerId value is unacceptable:', v);v = null;}
				return v; }
			},
			{ name: 'CreatedTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date(0) },
			{ name: 'Creator', type: 'auto', persist: false },
			{ name: 'ID', type: 'string', persist: false },
			{ name: 'Last Modified', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date(0) },
			{ name: 'LikeCount', type: 'int', persist: false },
			{ name: 'Links', type: 'links', persist: false, defaultValue: [], useInRaw: true},
			{ name: 'MimeType', type: 'string', useNull: true },
			{ name: 'NTIID', type: 'string', useNull: true },
			{ name: 'OID', type: 'string', persist: false },
			{ name: 'accepts', type: 'auto', persist: false, defaultValue: [] },
			{ name: 'href', type: 'string', persist: false, convert: function(v) {
				if (!v) { return ''; }
	
				var a = NextThought.model.Base.getLocationInterfaceAt(v), q;
	
				if (a.search) {
					q = Ext.Object.fromQueryString(a.search);
					delete q._dc;
					a.search = Ext.Object.toQueryString(q);
				}
	
				//do we ever want fragments in the model href??
				//if (a.hash) {
					//a.hash = '';
				//}
	
				//if the value wasn't absolute, it is now.
				return a.href
						//trim empty search & fragment tokens
						.replace(/[\?&#]+$/, '');
			} },
			{ name: 'tags', type: 'auto', defaultValue: [] },
			{ name: 'editied', type: 'bool', persist: false, convert: function(v, r) {
				var cd = r.get('CreatedTime'), lm = r.get('Last Modified');
				return ((cd && cd.getTime()) || 0) !== ((lm && lm.getTime()) || 0);
			}},
	
			//For templates
			{ name: 'isModifiable', persist: false, convert: function(v, r) {return r.phantom || r.getLink('edit') !== null;} },
			{ name: 'favoriteState', persist: false, type: 'auto', convert: function(o, r) { return r.getLink('unfavorite') ? 'on' : 'off'; }},
			{ name: 'likeState', persist: false, type: 'auto', convert: function(o, r) { return r.getLink('unlike') ? 'on' : 'off'; }}
		],
	
	    //TODO: move into model event domain??
		observer: new Ext.util.Observable(),
	
	    onClassExtended: function(cls, data) {
			var map,
				type,
				mime = {mimeType: 'application/vnd.nextthought.' + data.$className.replace(/^.*?model\./, '').toLowerCase()};
			data.proxy = {type: 'nti', model: cls};
			Ext.applyIf(cls, mime);//Allow overriding
			Ext.applyIf(data, mime);//Allow overriding
	
			type = data.mimeType || cls.mimeType;
	
			map = NextThought.model.MAP = NextThought.model.MAP || {};
			//console.log(type);
			if (map[type] !== undefined) {
				Ext.Error.raise('Cannot have more than one model per mimetype: ' + type);
			}
	
			map[type] = data.$className || cls.$className;
	
			//We don't want to be turning null into empty strings so we must set useNull
			//Failure to do so creates havok with server side validation and also
			//results in us potentially unexpectedly changing fields.
	
			//This will only effect subclasses, so note above where we manually set useNull on the base set of fields where
			// we do not set persist:false
			Ext.each(data.fields, function(f) {
				//If the field has not set this flag, and its going to be sent to the server... then set flag on the
				// fields behalf.
				if (f && !f.hasOwnProperty('useNull') && f.persist !== false) {
					f.useNull = true;
				}
			});
		},
	
	    getClassForModel: function(aliasPrefix, fallback) {
			var c = this,
				cls = null,
				name;
	
			while (c && !cls) {
				name = ((c.$className || '').split('.').last() || '').toLowerCase();
				cls = Ext.ClassManager.getByAlias(aliasPrefix + name);
				c = c.superclass;
			}
	
			return cls || fallback;
		},
	
	    is: function(selector) {
			return selector === '*';
		},
	
	    //Override isEqual so we can test more complex equality and
		//avoid resetting fields that haven't changed
		isEqual: function(a, b) {
			//Super checks === so if it is equal by that
			//return true
			if (this.callParent(arguments)) {
				return true;
			}
	
			//If one is an array, to be equal they must both
			//be arrays and they must contain equal objects in the proper order
			if (Ext.isArray(a) || Ext.isArray(b)) {
				return Ext.isArray(a) && Ext.isArray(b) && Globals.arrayEquals(a, b, Ext.bind(this.isEqual, this));
			}
	
			//if a defines an equals method return the result of that
			if (a && Ext.isFunction(a.equal)) {
				return a.equal(b);
			}
	
			//TODO Do anything for "normal" js object here
	
			return false;
		},
	
	    /**
		 * A list of keys to not include when syncing a record
		 * @type {Array}
		 */
		SYNC_BLACKLIST: [],
	
	    /**
		 * Given another instance of the same class, update this values.
		 *
		 * @param  {Model} record the instance to update with
		 */
		syncWith: function(record) {
			if (!this.self.isInstanceOf(record)) {
				consle.error('Trying to sync records or two different classes');
				return;
			}
	
			var newData = record.getData();
	
			this.SYNC_BLACKLIST.forEach(function(key) {
				delete newData[key];
			});
	
			this.set(newData);
	
			if (this.onSync) {
				this.onSync();
			}
	
			this.fireEvent('update', this);
		},
	
	    /**
		 * Given a response from the server, update my values
		 * @param  {String} response server response
		 */
		syncWithResponse: function(response) {
			var json = JSON.parse(response),
				newRecord;
	
			json = Ext.applyIf(json, this.getRaw());
	
			newRecord = ParseUtils.parseItems([json])[0];
	
			return this.syncWith(newRecord);
		},
	
	    /**
		 * Get the link to request updated values from on the server
		 *
		 * @return {String} the link
		 */
		__getLinkForUpdate: function() {
			return this.get('href');
		},
	
	    /**
		 * Update this record from the server.
		 *
		 * If we are unable to find a href or the update fails, just return
		 * the record with the same values.
		 *
		 * @return {Promise} fulfills with the record after it is updated
		 */
		updateFromServer: function() {
			var me = this,
				link = this.__getLinkForUpdate(),
				update;
	
			if (link) {
				update = Service.request(link)
					.then(function(response) {
						me.syncWithResponse(response);
	
						return me;
					});
			} else {
				console.warn('No link to update record from server with. ', this);
				update = Service.getObject(this.getId())
					.then(function(object) {
						me.syncWith(object);
	
						return me;
					});
			}
	
			return update
				.fail(function(reason) {
					console.error('Failed to update record from server.', reason);
	
					return me;
				});
		},
	
	    constructor: function(data, id, raw) {
			var fs = this.fields,
				cName = this.self.getName().split('.').pop(),
				cField = fs.getByKey('Class'), me = this;
	
			//Workaround for objects that don't have an NTIID yet.
			if (data && this.idProperty === 'NTIID' && id && raw) {
				if (!data.NTIID) {
					if (data.ID) {this.idProperty = 'ID';}
					else if (data.OID) {this.idProperty = 'OID';}
					else {console.error('Model has no id field');}
				}
			}
	
			cField.defaultValue = cName;
			cField.value = cName;
			fs.getByKey('MimeType').defaultValue = this.mimeType;
	
			this.callParent(arguments);
			this.addEvents('changed', 'destroy', 'child-added', 'parent-set', 'modified');
			this.enableBubble('changed', 'child-added', 'parent-set');
	
			//Piggyback on field events to support reconverting dependent readonly fields.
			//Fields  marked with affectedBy that also have a converter will be reset
			//when their affectedBy fields change
			fs.each(function(f) {
				var affectedBy = f.affectedBy,
					fnName = f.name + '-affectedByHandler';
				if (affectedBy && Ext.isFunction(f.convert)) {
					if (!Ext.isArray(affectedBy)) {
						affectedBy = [affectedBy];
					}
	
	
					me.observer[fnName] = function() {
						//Note set will end up calling the necessary converter
						this.set(f.name, this.get(f.mapping || f.name));
					};
	
					Ext.each(affectedBy, function(a) {
						me.addObserverForField(me.observer, a, me.observer[fnName], me);
					});
				}
			});
		},
	
	    getFieldItem: function(field, key) {
			var f = this.get(field) || [];
			// let not having an INDEX_KEYMAP throw an exception so we KNOW we don't have one
			// so that we can fallback to search... if it just doesn't have the key, we can take its word.
			return f[f.INDEX_KEYMAP[key]];
		},
	
	    //A model may have some derived fields that
		//are readonly values.  These values depend on other traditional fields.
		//one such property is 'flagged', it isn't a real field but
		//it is derived from Links.  We support getting those values by
		//looking for a properly named getter
		//
		//First we look for a traditional field with the given name
		//Second we look for a properly named getter function. ie. isField or getField
		get: function(f) {
			var capitalizedFieldName, possibleGetters,
				val;//undefined
	
			if (!f || this.fields.map[f]) {
				return this.callParent(arguments);
			}
	
			capitalizedFieldName = Ext.String.capitalize(f);
			possibleGetters = ['get' + capitalizedFieldName, 'is' + capitalizedFieldName];
	
			Ext.each(possibleGetters, function(g) {
				if (Ext.isFunction(this[g])) {
					val = this[g]();
					return false;
				}
				return true;
			}, this);
	
			return val;
		},
	
	    valuesAffectedByLinks: function() {
			return ['flagged', 'favorited', 'liked', 'published'];
		},
	
	    isTopLevel: function() {
			var notAReply = !this.get('inReplyTo'),
				noReferences = (this.get('references') || []).length === 0,
				noParent = !this.parent;
	
			//console.log('record is toplevel? ', notAReply, noReferences, noParent, this.raw);
	
			return notAReply && noReferences && noParent;
		},
	
	    /**
		 * Caller should wrap in beginEdit() and endEdit()
		 * @param {Ext.data.Model} recordSrc
		 * @param {String...} fields
		 */
		copyFields: function(recordSrc, fields) {
			var me = this, maybeFields = fields;
	
			if (!Ext.isArray(fields)) {
				maybeFields = Array.prototype.slice.call(arguments, 1) || [];
			}
	
			Ext.each(maybeFields, function(f) {
				if (Ext.isObject(f)) {
					Ext.Object.each(f, function(dest, src) {
						if (me.hasField(dest) && recordSrc.hasField(src)) {
							me.set(dest, recordSrc.get(src));
						} else {
							console.warn('fields are not declared:\n', me, '(dest)', dest, '\n', recordSrc, '(src)', src);
						}
					});
				}
				else {
					me.set(f, recordSrc.get(f));
				}
			});
		},
	
	    hasField: function(fieldName) {
			return this.data.hasOwnProperty(fieldName);
		},
	
	    tearDownLinks: function() {
			var p = this.parent, cn = (this.children || []),
				i, splice = Array.prototype.splice;
			delete this.parent;
			delete this.children;
	
			Ext.each(cn, function(c) {c.parent = p;});
	
			if (p && p.children) {
				i = Ext.Array.indexOf(p.children, this);
				if (i !== -1) {
					cn.unshift(i, 1);//add the index to our children list so it now looks like [i, 1, note, note, ...]
					splice.apply(p.children, cn);//use cn as the args of splice
				}
			}
	
			this.fireEvent('links-destroyed', this);
	
		},
	
	    getBubbleParent: function() {
			return this.parent;
		},
	
	    getRoot: function() {
			var current = this,
				currentParent = current.parent;
	
			while (currentParent && currentParent.parent) {
				current = currentParent;
				currentParent = currentParent.parent;
			}
	
			return current;
		},
	
	    wouldBePlaceholderOnDelete: function() {
			return (this.children !== undefined && this.get('RecursiveReferenceCount')) || (!Ext.isEmpty(this.children));
		},
	
	    convertToPlaceholder: function() {
			var me = this, keepList = {
				'Class': 1,
				'ContainerId': 1,
				'ID': 1,
				'MimeType': 1,
				'NTIID': 1,
				'OID': 1,
				'inReplyTo': 1,
				'references': 1
			};
			me.placeholder = true;
			me.fields.each(function(f) {
				if (!keepList[f.name]) {
					me.set(f.name, f.defaultValue);
				}
			});
	
			me.fireEvent('convertedToPlaceholder');
			me.fireEvent('updated', me);
			me.fireEvent('changed');
			me.maybeCallOnAllObjects('convertToPlaceholder', me, arguments);
		},
	
	    destroy: function(options) {
			var me = this,
				successCallback = (options || {}).success || Ext.emptyFn,
				failureCallback = (options || {}).failure || Ext.emptyFn;
	
			if (me.placeholder) {
				console.debug('Firing destroy because destroying placeholder', me);
				me.fireEvent('destroy', me);
				if (me.stores) {
					Ext.each(me.stores.slice(), function(s) { s.remove(me); });
				}
				return;
			}
	
			if (!me.isModifiable()) {return;}
	
			function clearFlag() {
				if (me.destroyDoesNotClearListeners) {
					console.log('clearing flag');
				}
				delete me.destroyDoesNotClearListeners;
			}
	
			function announce() {
				me.fireEvent('deleted', me);
			}
	
			options = Ext.apply(options || {},{
				success: Ext.Function.createSequence(clearFlag,
						Ext.Function.createSequence(announce, successCallback, null), null),
				failure: Ext.Function.createSequence(clearFlag, failureCallback, null)
			});
	
	
			if (me.wouldBePlaceholderOnDelete()) {
				me.destroyDoesNotClearListeners = true;
			}
			me.callParent([options]);
		},
	
	    enforceMutability: function() {
			if (!this.isModifiable()) {
				Ext.apply(this, {
					destroy: Ext.emptyFn(),
					save: Ext.emptyFn()
				});
			}
		},
	
	    getModelName: function() {
			return this.get('Class');
		},
	
	    getFriendlyLikeCount: function() {
			var c = this.get('LikeCount');
			if (c <= 0) {return '';}
			if (c >= 1000) { return '999+';}
			return String(c);
		},
	
	    isLikeable: function() {
			return Boolean(this.getLink('like') || this.getLink('unlike'));
		},
	
	    isFavoritable: function() {
			return Boolean(this.getLink('favorite') || this.getLink('unfavorite'));
		},
	
	    isFavorited: function() {
			return Boolean(this.getLink('unfavorite'));
		},
	
	    isLiked: function() {
			return Boolean(this.getLink('unlike'));
		},
	
	    isFlagged: function() {
			return Boolean(this.getLink('flag.metoo'));
		},
	
	    flag: function(widget) {
			var action = this.isFlagged() ? 'flag.metoo' : 'flag',
				prePost = action === 'flag' ? 'addCls' : 'removeCls',
				postPost = action === 'flag' ? 'removeCls' : 'addCls';
	
			if (this.activePostTos && this.activePostTos[action]) {return;}
	
			widget = widget || {};
			Ext.callback(widget[prePost], widget, ['on']);
	
			this.postTo(action, function(s) {
				if (!s) {
					Ext.callback(widget[postPost], widget, ['on']);
				}
			});
		},
	
	    favorite: function(widget) {
			var me = this,
				currentValue = this.isFavorited(),
				action = currentValue ? 'unfavorite' : 'favorite';
	
			if (me.activePostTos && me.activePostTos[action]) {return;}
	
			//We will assume it completes and then update it if it actually fails
			widget = widget || {};
			Ext.callback(widget.markAsFavorited, widget, [!currentValue]);
	
			me.postTo(action, function(s) {
				if (s) {
					//put "me" in the bookmark view?
					me.set('favoriteState', currentValue ? 'on' : 'off');
				}
				else {
					Ext.callback(widget.markAsFavorited, widget, [currentValue]);
				}
				me.set('favoriteState', s);//it doesn't matter what we pass as the value, the converter returns its own value
			}, 'favorite');
		},
	
	    like: function(widget) {
			var me = this,
				lc = this.get('LikeCount'),
				currentValue = this.isLiked(),
				action = currentValue ? 'unlike' : 'like',
				polarity = action === 'like' ? 1 : -1;
	
			if (this.activePostTos && this.activePostTos[action]) {return;}
	
			widget = widget || {};
			Ext.callback(widget.markAsLiked, widget, [!currentValue]);
			me.set('LikeCount', lc + polarity);
	
			this.postTo(action, function(s) {
				var r;
				if (!s) {
					Ext.callback(widget.markAsLiked, widget, [currentValue]);
					me.set('LikeCount', lc);
				}
				else {
					//Find the root if we are in a tree and update its recursive
					//like count
					r = me;
					while (r.parent) {r = r.parent;}
	
					if (r.getTotalLikeCount) {
						r.set('RecursiveLikeCount', (r.get('RecursiveLikeCount') || 0) + polarity);
					}
				}
				me.set('likeState', s);//it doesn't matter what we pass as the value, the converter returns its own value
			}, 'LikeCount');
		},
	
	    postTo: function(link, callback, modifiedFieldName) {
			this.activePostTos = this.activePostTos || {};
			var me = this, req,
				l = this.getLink(link);
	
			if (!l) {
				console.error('Cannot find link "' + link + ' on this model.', this);
			}
	
			if (l && !this.activePostTos[link]) {
				req = {
					url: l,
					jsonData: '',
					method: 'POST',
					scope: this,
					callback: function(r, s, response) {
						delete me.activePostTos[link];
						if (s) {
							var o = Ext.JSON.decode(response.responseText, true);
							delete o.Creator;//ignore this, we don't want to lose the Record that is potentially there.
							me.set(o);
							this.fireEvent('updated', me, modifiedFieldName);
						}
						Ext.callback(callback, null, [s]);
					}
				};
	
				this.activePostTos[link] = Ext.Ajax.request(req);
			}
			return this.activePostTos[link];
		},
	
	    isModifiable: function() {
			try {
				//This isn't necessarily true for all objects. For instance anyone's blog comments
				//can be edited or deleted by the blogs author.  I notice the field logic is correct
				//and different from this.
				return this.phantom || (this.getLink('edit') !== null && this.isMine());
			}
			catch (e) {
				console.warn('No getLink()!');
			}
			return false;
		},
	
	    isMine: function() {
			return isMe(this.get('Creator'));
		},
	
	    getFieldEditURL: function(editLink, field) {
			if (/.*\+\+fields\+\+.*/.test(editLink)) {
				//edit link is already edit link for that field
				return editLink;
			}
	
			var f = Ext.String.format('/++fields++{0}', field);
	
			return getURL(Ext.String.format('{0}{1}',
					editLink, f));
		},
	
	    /**
		 * Save a specific field off this model, optionally set a value and save it if value is sent.
		 *
		 * @param {String} fieldName - name of the field that we want to save
		 * @param {*} [value] - if undefined the field from the model will be saved.  If not undefined the field
		 *					will be set on the model prior to saving
		 * @param {Function} successCallback
		 * @param {Function} failCallback
		 * @param {String} [optionalLinkName] = provide if you want a specific link other than the edit link
		 */
		saveField: function(fieldName, value, successCallback, failCallback, optionalLinkName) {
			var editLink = this.getLink(optionalLinkName || 'edit'),
				json, me = this, req;
	
			//special case, pageInfos are not editable (no link), but can take sharedPrefs
			if (!editLink && /^PageInfo$/.test(this.get('Class')) && fieldName && fieldName === 'sharingPreference') {
				editLink = Service.getObjectURL(this.getId());
			}
	
			//check to make sure we can do this, and we have the info we need
			if (!fieldName || (!this.hasField(fieldName) && !new RegExp('.*' + fieldName + '$').test(fieldName))) {
				console.error('Cannot save field', this, arguments);
				Ext.Error.raise('Cannot save field, issues with model?');
			}
			if (!editLink) {
				console.error('Can\'t save field on uneditable object', this);
				Ext.Error.raise('Can\'t save field on uneditable object');
			}
	
			//If there's a value, set it on the model
			//Do explicit check so you can set values to 0 or ''
			if (value !== undefined) {
				this.set(fieldName, value);
			}
	
			//put together the json we want to save.
			json = Ext.JSON.encode(value === undefined ? this.get(fieldName) : value);
			req = {
				url: this.getFieldEditURL(editLink, fieldName),
				jsonData: json,
				method: 'PUT',
				headers: {
					Accept: 'application/json'
				},
				scope: me,
				callback: function() { },
				failure: function() {
					console.error('field save fail', arguments);
					Ext.callback(failCallback, this, arguments);
				},
				success: function(resp) {
					var newMe = ParseUtils.parseItems(Ext.decode(resp.responseText))[0],
						sanitizedValue = newMe && newMe.get(fieldName);
					if (!newMe) {
						console.warn('Could not parse response... %o', resp.responseText);
					} else {
						me.set(fieldName, sanitizedValue);
					}
	
					//it worked, reset the dirty flag, and reset the field
					//because the server may have sanitized it.
					this.commit();
	
					if (successCallback) {
						Ext.callback(successCallback, null, [fieldName, sanitizedValue, me, newMe]);
					}
	
					me.fireEvent('changed', me);
				}
			};
	
			Ext.Ajax.request(req);
		},
	
	    /**
		 * Calls the href and fills in the values missing.
		 */
		resolve: function() {
			console.error('still called?');
			var me = this,
				href = this.get('href'),
				req;
	
			if (!href) {
				Ext.Error.raise('No HREF!');
			}
	
			req = {
				url: getURL(href),
				async: false,
				callback: function(req, success, resp) {
					if (!success) {
						console.error('Resolving model failed');
						return;
					}
					me.set(Ext.JSON.decode(resp.responseText));
					me.enforceMutability();
					me.dirty = false;
					me.modified = {};
				}
			};
	
			Ext.Ajax.request(req);
	
	
		},
	
	    //Only seems to be called from legacy classroom stuff
		getParent: function(callback, scope) {
			var href = this.getLink('parent'), req;
	
			console.error('Still called?');
	
			if (!callback) {
				Ext.Error.raise('this method requires a callback');
			}
	
			if (!href) {
				//Ext.Error.raise('No parent HREF!');
				callback.call(scope || window, null);
				return;
			}
	
			req = {
				url: href,
				callback: function(req, success, resp) {
					if (!success) {
						console.error('Resolving parent model failed');
						return;
					}
					callback.call(scope || window, ParseUtils.parseItems(Ext.JSON.decode(resp.responseText))[0]);
				}
			};
	
			Ext.Ajax.request(req);
	
		},
	
	    equal: function(b) {
			var a = this,
				r = true;
	
			//If they aren't both models
			//they are not equal
			//type check here?
			if (!a.isModel || !b || !b.isModel) {
				return false;
			}
	
			a.fields.each(
					function(f) {
						var fa = a.get(f.name),
								fb = b.get(f.name);
	
						if (!a.isEqual(fa, fb)) {
							r = false;
							return false;//break
						}
						return true;
					}
			);
	
			return r;
		},
	
	    toJSON: function() {
			return this.asJSON();
		},
	
	    asJSON: function() {
			var data = {},
				me = this;
	
			this.fields.each(
					function(f) {
						if (!f.persist) {return;}
						var x = me.get(f.name);
						if (Ext.isDate(x)) {
							x = x.getTime() / 1000;
						}
						else if (x && x.asJSON) {
							x = x.asJSON();
						}
						else if (x && Ext.isArray(x)) {
							x = x.slice();
							Ext.each(x, function(o, i) {
								x[i] = o && o.asJSON ? o.asJSON() : o;
							});
						}
	
						data[f.name] = Ext.clone(x);
					}
			);
			return data;
		},
	
	    getRaw: function() {
			var data = {},
				me = this;
	
			this.fields.each(function(f) {
				if (!f.persist && !f.useInRaw) { return; }
	
				var x = me.get(f.name);
	
				if (Ext.isDate(x)) {
					x = x.getTime() / 1000;
				} else if (x && x.getRaw) {
					x = x.getRaw();
				} else if (x && Ext.isArray(x)) {
					x = x.slice();
	
					Ext.each(x, function(o, i) {
						x[i] = o && o.getRaw ? o.getRaw() : o;
					});
				}
	
				data[f.mapping || f.name] = Ext.clone(x);
			});
	
			return data;
		},
	
	    getRelativeTimeString: function() {
			return TimeUtils.timeDifference(Ext.Date.now(), this.get('CreatedTime'));
		},
	
	    /**
		 * @private
		 * property {Boolean} destroyDoesNotClearListeners
		 */
		destroyDoesNotClearListeners: false,
	
	    clearManagedListeners: function() {
			if (!this.destroyDoesNotClearListeners) {
				this.callParent(arguments);
			}
		},
	
	    clearListeners: function() {
			if (!this.destroyDoesNotClearListeners) {
				this.callParent(arguments);
			}
		},
	
	    fieldEvent: function(name) {
			return name + '-changed';
		},
	
	    notifyObserversOfFieldChange: function(f) {
			this.fireEvent(this.fieldEvent(f), f, this.get(f));
		},
	
	    //Fires an event signaling the given field has changed.
		//If there are dependent fields those events are also fired
		//To signal dependent fields implement a function valuesAffectedByField
		//that returns an array of dependent field names
		onFieldChanged: function(f) {
			if (!f) {
				return;
			}
	
			var dependentFunctionName = 'valuesAffectedBy' + f,
				fn = this[dependentFunctionName];
			this.notifyObserversOfFieldChange(f);
			if (Ext.isFunction(fn)) {
				Ext.each(fn.call(this), this.notifyObserversOfFieldChange, this);
			}
		},
	
	    addObserverForField: function(observer, field, fn, scope, options) {
			if (!observer) {
				return null;
			}
			options = Ext.apply(options || {},{destroyable: true});
			return observer.mon(this, this.fieldEvent(field), fn, scope, options);
		},
	
	    removeObserverForField: function(observer, field, fn, scope) {
			if (!observer) {
				return;
			}
			observer.mun(this, this.fieldEvent(field), fn, scope);
		},
	
	    afterEdit: function(fnames) {
			var me = this, updatedValue;
			//are we getting called by a child record (see converters/Items.js)
			if (fnames instanceof Ext.data.Model) {
				updatedValue = fnames;
				fnames = [];//just in case its not found
				me.fields.each(function(f) {
					var v = me.get(f.name);
					if (v === updatedValue || (Ext.isArray(v) && v.indexOf(updatedValue) >= 0)) {
						fnames = [f.name];
						return false;
					}
				});
			}
	
			try {
				me.callParent([fnames]);
			}
			finally {
				Ext.each(fnames || [], me.onFieldChanged, me);
			}
		},
	
	    /**
		 *
		 * JSG - Yanked from the Ext.data.Model#callStore() so we can patch it.
		 *
	     * @inheritDoc
	     */
		callStore: function(fn) {
			var args = Ext.Array.clone(arguments),
				stores = this.stores,
				i = 0,
				len = stores.length,
				store;
	
			args[0] = this;
			for (i; i < len; ++i) {
				store = stores[i];
				if (store && Ext.isFunction(store[fn])) {
	
					//Some of our synthetic fields trigger this call before there are groups defined...
					// the store's group updating code does not ensure a group exists before acting on it,
					// so lets fake out the store and let it think that its not groupped yet.
					if (store.isGrouped && store.isGrouped()) {
						store.isGrouped = Ext.emptyFn;
					}
	
					try {
						store[fn].apply(store, args);
					}
					finally {
						//Remove our fake out.
						if (store.isGrouped === Ext.emptyFn) {
							delete store.isGrouped;
						}
					}
				}
			}
		},
	
	    //Methods for updating all copies of an object in memory when one changes,
		//ideally we have one in memory object that is just referenced everywhere.
		//We are a bit far away from that (mostly because of how we represent threads)
		//so we brute force it by passing these calls
		//through to other in memory objects with the same ids
		maybeCallOnAllObjects: function(fname, rec, args) {
	
			//Allow a way to turn it off
			if (this.dontNotifyOtherObjects === false) {return;}
	
			var active = this.self.idsBeingGloballyUpdated[fname],
				recId = rec.getId(),
				fnHook = Ext.emptyFn;
	
	
			if (!recId) {return;}
	
			if (!active) {
				this.self.idsBeingGloballyUpdated[fname] = active = {};
			}
	
			if (active[recId]) {
				return;
			}
	
			//If we haven't already started calling fname on other in memory objects
			//set the flag and notify.  Make sure we clear it at the end
			active[recId] = true;
			//console.time('looking for objects');
			//Use the store manager to iterate all stores looking for an object
			//that has the same id.  If it isn't the exact record call the function
			//fname on it with the provided args
			Ext.data.StoreManager.each(function(s) {
				var data = s.snapshot || s.data,
					recById = data && data.getByKey && data.getByKey(recId);
	
				if (!recById) {
					return true; //keep going
				}
	
				//This record has been filtered out and may potentially throw an error if we attempt to call store group
				// functions. So, we let this record update and the store think its ungroupped while it updates.
				if (s.isGrouped() && !s.data.contains(recById)) {
					s.isGrouped = fnHook;
				}
	
				//Ok we found one and it isn't the same object
				if (rec !== recById && rec.get('MimeType') === recById.get('MimeType') && Ext.isFunction(recById[fname])) {
					try {
						recById[fname].apply(recById, args);
					}
					catch (e) {
						console.warn(e.message);
					}
				}
	
				if (s.isGrouped === fnHook) {
					delete s.isGrouped;//restore the default
				}
			});
	
			//console.timeEnd('looking for objects');
			delete active[rec.getId()];
		},
	
	    beginEdit: function() {
			this.callParent(arguments);
			this.maybeCallOnAllObjects('beginEdit', this, arguments);
		},
	
	    endEdit: function() {
			this.callParent(arguments);
			this.maybeCallOnAllObjects('endEdit', this, arguments);
		},
	
	    cancelEdit: function() {
			this.callParent(arguments);
			this.maybeCallOnAllObjects('cancelEdit', this, arguments);
		},
	
	    set: function() {
			this.callParent(arguments);
			this.maybeCallOnAllObjects('set', this, arguments);
		}
	});


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var UserRepository = __webpack_require__(5);
	var User = __webpack_require__(7);
	var B64 = __webpack_require__(69);
	var Globals = __webpack_require__(2);
	var ParseUtils = __webpack_require__(3);
	var ModelBase = __webpack_require__(6);
	var MixinsAvatar = __webpack_require__(15);
	var ModelPresenceInfo = __webpack_require__(17);
	var ConvertersPresenceInfo = __webpack_require__(11);
	
	
	/*globals B64*/
	module.exports = exports = Ext.define('NextThought.model.User', {
	    extend: 'NextThought.model.Base',
	    idProperty: 'Username',
	
	    mixins: {
			Avatar: 'NextThought.mixins.Avatar'
		},
	
	    isProfile: true,
	
	    fields: [
			{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
			{ name: 'NotificationCount', type: 'int' },
			{ name: 'Username', type: 'string' },
			{ name: 'OU4x4', type: 'string' },
			{ name: 'FirstName', type: 'string', mapping: 'NonI18NFirstName', convert: function(v, r) {
				// TODO: The mapping should normally take care of this conversion but it's doesn't seem to do it.
				var fname = r && r.raw && r.raw.NonI18NFirstName;
				if (Ext.isEmpty(v) && !Ext.isEmpty(fname)) {
					return fname;
				}
	
				return v;
			}},
			{ name: 'LastName', type: 'string', mapping: 'NonI18NLastName', convert: function(v, r) {
				var lname = r && r.raw && r.raw.NonI18NLastName;
				if (Ext.isEmpty(v) && !Ext.isEmpty(lname)) {
					return lname;
				}
	
				return v;
			}},
	
			{ name: 'Presence', type: 'PresenceInfo', persist: false },
			{ name: 'alias', type: 'string' },
			{ name: 'email', type: 'string' },
			{ name: 'realname', type: 'string' },
			{ name: 'avatarURL', type: 'AvatarURL' },
			{ name: 'backgroundURL', type: 'string'},
			{ name: 'AvatarURLChoices', type: 'AvatarURLList', persist: false },
			{ name: 'accepting', type: 'UserList' },
			{ name: 'ignoring', type: 'UserList' },
			{ name: 'status', type: 'Synthetic', persist: false, fn: function(record) {
				//The presence isn't always a PresenceInfo in testing
				try {
					var p = record.get('Presence');
					return (p && p.getDisplayText && p.getDisplayText()) || null;
				} catch (e) {
					console.warn(e.stack || e.message || e);
				}
				return null;
			}},
			{ name: 'opt_in_email_communication', type: 'boolean' },
			{ name: 'following', type: 'UserList' },
			{ name: 'Communities', type: 'UserList' },
			{ name: 'DynamicMemberships', type: 'ArrayItem'},
			{ name: 'displayName', type: 'Synthetic', persist: false, fn: function(r) {
				return r.getName();
			} },
			{ name: 'about', type: 'auto'},
			{ name: 'affiliation', type: 'string'},
			{ name: 'education', type: 'auto'},
			{ name: 'role', type: 'string'},
			{ name: 'location', type: 'string'},
			{ name: 'home_page', type: 'string'},
			{ name: 'admission_status', type: 'string', mapping: 'fmaep_admission_state', defaultValue: null, persist: false},
	
			//Social Links
			{name: 'facebook', type: 'string'},
			{name: 'twitter', type: 'string'},
			{name: 'googlePlus', type: 'string'},
			{name: 'linkedIn', type: 'string'},
	
			{name: 'interests', type: 'auto'},
			{name: 'education', type: 'auto'},
			{name: 'positions', type: 'auto'},
	
			// ui data
			{name: 'unreadMessageCount', type: 'auto', persist: false},
			{ name: 'avatarInitials', type: 'string', persist: false},
			{ name: 'avatarBGColor', type: 'string', persist: false}
		],
	
	    isUser: true,
	    summaryObject: true,
	
	    constructor: function() {
			this.callParent(arguments);
	
			this.initAvatar();
		},
	
	    equal: function(b) {
			if (Ext.isString(b) && this.getId() === b) {
				return true;
			}
			return this.callParent(arguments);
		},
	
	    getCommunities: function(excludeDFLs) {
			var r = [], u;
	
			Ext.each(this.get('Communities'), function(c) {
				var field = 'Username';
	
				if (/^everyone$/i.test(c)) {
					return;
				}
	
				//DFLs come back in communities but their usernames are ntiids.
				if (ParseUtils.isNTIID(c)) {
					field = 'NTIID';
				}
	
				u = UserRepository.store.findRecord(field, c, 0, false, true, true);
				if (u) {
					r.push(u);
				}
				else {
					console.warn('Dropping unresolvable community: ' + Ext.encode(c));
				}
	
			});
	
			if (excludeDFLs) {
				return Ext.Array.filter(r, function(i) { return i.isCommunity; });
			}
			return r;
		},
	
	    getData: function() {
			var k, v, f = this.callParent(arguments);
	
			for (k in f) {
				if (f.hasOwnProperty(k)) {
					v = f[k];
					if (v && v.isModel) {
						f[k] = v.isUser ? v.getId() : v.getData.apply(v, arguments);
					}
				}
			}
	
			return f;
		},
	
	    toString: function() {
			return this.getName();
		},
	
	    shouldBeRoot: function() {
			return true;
		},
	
	    getTitle: function() {
			return this.getName();
		},
	
	    getName: function() {
			return this.get('alias') ||
				   this.get('realname') ||
				   //because this implementation is 'borrowed', we cannot assume 'this'
				   // is anything more than A model. Not necessarily "this" model.
				   NextThought.model.User.getUsername(this.get('Username'));
		},
	
	    getURLPart: function() {
			var id = this.get('Username');
	
			if ($AppConfig.obscureUsernames) {
				id = B64.encodeURLFriendly(id);
			}
	
			return encodeURIComponent(id);
		},
	
	    getProfileUrl: function(tab) {
			if (!this.getLink('Activity')) {
				return null;
			}
	
			var id = this.get('Username');
	
			if ($AppConfig.obscureUsernames) {
				id = B64.encodeURLFriendly(id);
			}
	
			return tab ? '/user/' + id + '/' + Globals.trimRoute(tab) + '/' : '/user/' + id;
		},
	
	    getPresence: function() {
			var presence = this.get('Presence');
			return presence || NextThought.model.PresenceInfo.createFromPresenceString('Offline');
		},
	
	    hasBlog: function() {
			return Boolean(this.getLink('Blog'));
		},
	
	    getAvatarInitials: function() {
			if (this.isUnresolved()) {
				return null;
			}
			return NextThought.mixins.Avatar.getAvatarInitials(this.raw, this.get('FirstName'), this.get('LastName'), this.getName());
		},
	
	    save: function(ops) {
			var data = this.asJSON();
	
			//The avatar is saved in another place; don't try to do it here. Also custom avatar urls will cause a 422
			delete data.avatarURL;
	
			Ext.Ajax.request(Ext.apply({
			   url: this.getLink('edit'),
			   method: 'PUT',
			   jsonData: data
		   }, ops));
		},
	
	    isUnresolved: function() {
			return this.Unresolved === true;
		},
	
	    getSchema: function() {
			if (this.loadSchema) {
				return this.loadSchema;
			}
	
			var link = this.getLink('account.profile');
	
			if (link) {
				this.loadSchema = Service.request(link)
					.then(function(response) {
						return JSON.parse(response);
					});
			} else {
				this.loadSchema = Promise.reject({});
			}
	
			return this.loadSchema;
		},
	
	    getAboutData: function() {
			return {
				displayName: this.getName(),
				realname: this.get('realname'),
				about: this.get('about'),
				email: this.get('email'),
				home_page: this.get('home_page'),
				location: this.get('location'),
				education: this.get('education') || [],
				positions: this.get('positions') || [],
				interests: this.get('interests') || [],
				facebook: this.get('facebook'),
				twitter: this.get('twitter'),
				googlePlus: this.get('googlePlus'),
				linkedIn: this.get('linkedIn'),
				interests: this.get('interests') || []
			};
		},
	
	    getMemberships: function(force) {
			if (this.loadMemberships && !force) {
				return this.loadMemberships;
			}
	
			var link = this.getLink('memberships');
	
			if (link) {
				this.loadMemberships = Service.request(link)
					.then(function(response) {
						var json = JSON.parse(response);
	
						return ParseUtils.parseItems(json);
					});
			} else {
				this.loadMemberships = Promise.reject();
			}
	
			return this.loadMemberships;
		},
	
	    __filterMemberships: function(fn) {
			return this.getMemberships()
				.then(function(memberships) {
					return memberships.filter(fn);
				});
		},
	
	    getCommunityMembership: function() {
			return this.__filterMemberships(function(membership) {
				return membership instanceof NextThought.model.Community;
			});
		},
	
	    getGroupMembership: function() {
			return this.__filterMemberships(function(membership) {
				return membership instanceof NextThought.model.FriendsList;
			});
		},
	
	    statics: {
	
			BLANK_AVATAR: '/app/resources/images/icons/unresolved-user.png',
	
	
			getUnresolved: function(username) {
				username = username || 'Unknown';
				var maybeObfuscate = username !== 'Unknown',
					alias = maybeObfuscate ? this.getUsername(username) : username,
					u = new NextThought.model.User({
				   Username: username,
				   alias: alias,
				   avatarURL: this.BLANK_AVATAR,
				   affiliation: 'Unknown',
				   status: '',
				   Presence: NextThought.model.PresenceInfo.createFromPresenceString('Offline')
			   }, username);
				u.Unresolved = true;
				return u;
			},
	
	
			getUsername: function(usernameSeed) {
				var sitePattern = getString('UnresolvedUsernamePattern', 'username'),
					// negagitive numbers dont look good. So just Abs() them.  Since we're not
					// using this other than to display, shouldn't be a problem.
					hash = (usernameSeed && Math.abs(usernameSeed.hash())) || -1,
					hashPlaceholder = (/(#+)/g);
	
				if (/^username$/i.test(sitePattern)) {
					return usernameSeed;
				}
	
				return sitePattern.replace(hashPlaceholder, hash);
			},
	
	
			getProfileStateFromFragment: function(fragment) {
				var re = /^#!profile\/([^\/]+)\/?(.*)$/i, o = re.exec(fragment);
	
				function filter(u) {
					if ($AppConfig.obscureUsernames) {
						return B64.decodeURLFriendly(u) || u;
					}
					return u;
				}
	
				return o ? {
					username: filter(decodeURIComponent(o[1])),
					activeTab: o[2]
				} : null;
			},
	
			getIdFromRaw: function(raw) {
				return raw.getId ? raw.getId() : raw.Username;
			},
	
	
			getIdFromURIPart: function(part) {
				part = decodeURIComponent(part);
	
				if ($AppConfig.obscureUsernames) {
					return B64.decodeURLFriendly(part) || part;
				}
	
				return part;
			}
	
		},
	
	    hasVisibilityField: function(field) {
			return Boolean(this.raw && this.raw[field]);
		},
	
	    refresh: function() {
			var req = {
				url: getURL(this.get('href')),
				callback: function(q, s, r) {
					if (!s) {
						console.warn('could not refresh user');
						return;
					}
	
					var u = ParseUtils.parseItems(r.responseText);
					UserRepository.precacheUser(u.first());
				}
			};
	
			Ext.Ajax.request(req);
		},
	
	    getActivityItemConfig: function(type) {
			return Promise.resolve({
				name: this.getName(),
				verb: ((/circled/i).test(type) ? ' added you as a contact.' : '?')
			});
		},
	
	    sendEmailVerification: function() {
			if (!this.hasLink('RequestEmailVerification')) {
				return Promise.reject();
			}
	
			var reqLink = this.getLink('RequestEmailVerification');
			return Service.post(reqLink)
				.then(function(response) {
					return Promise.resolve();
				});
		},
	
	    isEmailVerified: function() {
			return !this.hasLink('RequestEmailVerification');
		},
	
	    verifyEmailToken: function(token) {
			if (!this.hasLink('VerifyEmailWithToken') || !token) {
				return Promise.reject();
			}
	
			var link = this.getLink('VerifyEmailWithToken'), me = this;
			return Service.post(link, {token: token})
				.then(function(response) {
					me.deleteLink('RequestEmailVerification');
					return Promise.resolve(response);
				});
		},
	
	    getSuggestContacts: function() {
			if (!isFeature('suggest-contacts') || !(this.hasLink('SuggestContacts') || this.hasLink('Classmates'))) { return Promise.reject(); }
	
			var link = this.getLink('SuggestContacts') || this.getLink('Classmates');
	
			return Service.request(link)
				.then(function(response) {
					var parent = JSON.parse(response);
					return ParseUtils.parseItems(parent.Items);
				});
		},
	
	    removeFirstTimeLoginLink: function() {
			var rel = 'first_time_logon',
				link = this.getLink(rel), me = this;
			if (!link) { return Promise.reject(); }
	
			return Service.requestDelete(link)
				.then(function(response) {
					me.deleteLink(rel);
					return Promise.resolve();
				});
		}
	}, function() {
		window.User = this;
	});


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var TimeUtils = __webpack_require__(8);
	
	
	/*globals Duration: false*/
	module.exports = exports = Ext.define('NextThought.util.Time', {
		singleton: true,
	
		DIVISORS: {
			WEEKS: 7 * 24 * 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours / 24 = days / 7 = weeks
			DAYS: 24 * 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours / 24 = days
			HOURS: 60 * 60 * 1000, //millis / 1000 = seconds / 60 = minutes / 60 = hours
			MINUTES: 60 * 1000, // millis / 1000 = seconds / 60 = minutes
			SECONDS: 1000 //millis / 1000 = seconds
		},
	
	
		getTimeGroupHeader: function(time) {
			var now = new Date(), t = time.getTime(),
				oneDayAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
				twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
				oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1 * 7);
	
			function between(start, end) {
				return start.getTime() < t && t <= end.getTime();
			}
	
			if (between(oneDayAgo, now)) {
				return 'Today';
			}
	
			if (between(twoDaysAgo, oneDayAgo)) {
				return 'Yesterday';
			}
	
			if (between(oneWeekAgo, twoDaysAgo)) {
				return Ext.Date.format(time, ' l');
			}
	
			return new Duration(Math.abs(now - time) / 1000).ago();
		},
	
		//yanked & modifed from: http://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best
		timeDifference: function(current, previous) {
	
			if (!previous) {
				previous = current;
				current = new Date();
			}
	
			var msPerMinute = 60 * 1000,
				msPerHour = msPerMinute * 60,
				msPerDay = msPerHour * 24,
				msPerMonth = msPerDay * 30,
				elapsed = current - previous,
				result;
	
			// We are interested in the time interval.
			if (elapsed < 0) {
				elapsed = Math.abs(elapsed);
			}
	
			if (elapsed < msPerMinute) {
				result = Math.round(elapsed / 1000) + ' seconds ago';
			}
	
			else if (elapsed < msPerHour) {
				result = Math.round(elapsed / msPerMinute) + ' minutes ago';
			}
	
			else if (elapsed < msPerDay) {
				result = Math.round(elapsed / msPerHour) + ' hours ago';
			}
	
			else if (elapsed < msPerMonth) {
				result = Math.round(elapsed / msPerDay) + ' days ago';
			}
	
			if (!result) {
				return Ext.Date.format(previous, 'M j, Y, g:i a');
			}
	
			if (/^1\s/.test(result)) {
				result = result.replace('s ago', ' ago');
			}
			return result;
		},
	
	
	
		getDurationText: function(started, ended) {
			var milli = ended - started,
				seconds = milli / 1000,
				minutes = seconds / 60,
				hours = minutes / 60,
				days = hours / 24,
				str = '';
	
			seconds = seconds % 60;
			minutes = minutes % 60;
			hours = hours % 24;
	
	
			if (days >= 1) {
				str = Math.floor(days) + 'd ' + Math.ceil(hours) + 'h';
			}else if (hours >= 1) {
				str = Math.floor(hours) + 'h ' + Math.ceil(minutes) + 'm';
			}else {
				str = Math.floor(minutes) + 'm ' + Math.ceil(seconds) + 's';
			}
	
			return str;
		},
	
	
		getTimer: function() {
			return new this._timer();
		},
	
	
		/**
		 * Takes two dates and returns true if they are on the same day
		 * @param  {Date}  a date to compare
		 * @param  {Date}  b the other date to compare
		 * @return {Boolean}   if they are on the same day
		 */
		isSameDay: function(a, b) {
			//clone the dates so we don't affect what we were passed
			a = new Date(a);
			b = new Date(b);
	
			//set the hours to 0 so they will both be at 12:00:00 at the start of the day
			a.setHours(0, 0, 0, 0);
			b.setHours(0, 0, 0, 0);
	
			return a.getTime() === b.getTime();
		},
	
		getDays: function(time) {
			return time / (24 * 60 * 60 * 1000); // milli / 1000 = seconds / 60  = minutes / 60 = hours / 24 = days
		},
	
		getHours: function getRemainingHours(time) {
			return (time / (60 * 60 * 1000)) % 24;//milli / 1000 = seconds, seconds / 60 = minutes, minutes / 60 = hours
		},
	
		getMinutes: function(time) {
			return (time / (60 * 1000)) % 60;//milli / 10000 = seconds, seconds / 60 = minutes
		},
	
		getSeconds: function(time) {
			return (time / 1000) % 60;//milli / 1000 = seconds
		},
	
		getMilliSeconds: function(time) {
			return time % 1000;
		},
	
		getTimePartsFromTime: function(time) {
			return {
				days: this.getDays(time),
				hours: this.getHours(time),
				minutes: this.getMinutes(time),
				seconds: this.getSeconds(time)
			};
		},
	
		/**
		 * Takes a number of milliseconds and returns a string that is more similar
		 * to how a human would say it (hopefully)
		 *
		 * ex. 2 weeks, 2 days, and 2 hours
		 *
		 * @param  {Number} millis         millis to convert
		 * @param  {Number} numberOfUnits  How many units (weeks, days, hours, etc.) to include
		 * @param  {Boolean} doNotPluralize whether or not to pluralize the units
		 * @param  {Object} overrides Strings to use instead of the defaults
		 * @return {String}                the parsed string
		 */
		getNaturalDuration: function(millis, numberOfUnits, doNotPluralize, overrides) {
			var units = [], lastItem, s,
				weeks = Math.floor(parseInt(millis, 10) / this.DIVISORS.WEEKS),
				days =  Math.floor(parseInt(millis, 10) / this.DIVISORS.DAYS % 7),
				hours =  Math.floor(parseInt(millis, 10) / this.DIVISORS.HOURS % 24),
				minutes =  Math.floor(parseInt(millis, 10) / this.DIVISORS.MINUTES % 60),
				seconds =  Math.round(parseInt(millis, 10) / this.DIVISORS.SECONDS % 60);
	
			overrides = overrides || {};
			numberOfUnits = numberOfUnits || 5;
	
			function add(unit, label) {
				units.push(doNotPluralize ? unit + ' ' + label : Ext.util.Format.plural(unit, label));
			}
	
			//if we have a unit and we haven't pushed the max number add it
			if (weeks && units.length < numberOfUnits) {
				add(weeks, overrides.week || 'week');
			}
	
			if (days && units.length < numberOfUnits) {
				add(days, overrides.day || 'day');
			} else if (weeks) {
				//if there no days but there are weeks add an empty string to the units to keep the units we show
				//from being too far about e.x. 2 weeks and 5 seconds
				units.push('');
			}
	
			if (hours && units.length < numberOfUnits) {
				add(hours, overrides.hour || 'hour');
			} else if (weeks || days) {
				units.push('');
			}
	
			if (minutes && units.length < numberOfUnits) {
				add(minutes, overrides.minute || 'minute');
			} else if (weeks || days || hours) {
				units.push('');
			}
	
			if (seconds && units.length < numberOfUnits) {
				add(seconds, overrides.second || 'second');
			}
	
			//filter out any empty strings we may have added
			units = units.filter(function(val) {
				return val;
			});
	
			if (units.length === 1) {
				s = units[0];
			} else if (units.length === 2) {
				s = units.join(' and ');
			} else if (units.length === 0){
				s = '';
			}
			else {
				lastItem = units.pop();
	
				s = units.join(', ');
	
				s += ', and ' + lastItem;
			}
	
			return s;
		},
	
		/**
		 * Takes a moment constructor config (http://momentjs.com/docs/#/parsing/) and returns an object with:
		 *
		 * day: the moment for the date passed
		 * start: the moment for the start of the current week (last Monday)
		 * end: the moment for the end of the current week (next Sunday)
		 * getNext: calls this function with a week from the date given
		 * getPrevious: calls this function with a week before the date given
		 *
		 * @param  {Date|String} date argument to pass to the moment constructor, falsy means today
		 * @return {Object}      utility for stepping through the weeks
		 */
		getWeek: function(date) {
			var m = date ? moment(date) : moment();
	
			return {
				day: m,
				start: moment(m).startOf('isoWeek'),
				end: moment(m).endOf('isoWeek'),
				getNext: this.getWeek.bind(this, moment(m).add(1, 'weeks')),
				getPrevious: this.getWeek.bind(this, moment(m).subtract(1, 'weeks'))
			};
		}
	},
	function() {
		var TimeUtils = this;
		Ext.util.Format.timeDifference = Ext.bind(this.timeDifference, this);
	
		/**
		 * A utility to do a count down or count up from a starting point until a stopping point or infinity
		 */
		this._timer = function() {
			var start, from, to, direction, duration, interval, intervalWindow, timerInterval, tickFn, alarmFn, intervalUnit;
	
			function getTimeStamp(d) {
				if (!d && d !== 0) {
					d = (new Date()).getTime();
				} else if (d instanceof Date) {
					d = d.getTime();
				}
	
				return d;
			}
	
			function updateTime() {
				var now = new Date(),
					diff, time;
	
				if (intervalUnit === 'seconds') {
					now.setMilliseconds(0);
				}
	
				now = now.getTime();
	
				diff = now - start;
				time = from + (direction * diff);
	
				if (tickFn) {
					tickFn.call(null, {
						days: TimeUtils.getDays(time),
						hours: TimeUtils.getHours(time),
						minutes: TimeUtils.getMinutes(time),
						seconds: TimeUtils.getSeconds(time),
						millisseconds: TimeUtils.getMilliSeconds(time),
						time: time,
						remaining: Math.abs(to - time)
					});
				}
	
				//if we've reached the target then call the alarm if there is one
				//set the alarmFn to null so we don't call it again
				//if the diff is with in half of the iteration of the duration
				if (alarmFn && Math.abs(diff - duration) <= intervalWindow) {
					alarmFn.call();
					alarmFn = null;
				}
			}
	
			/**
			 * Start the count down/up and update on the interval
			 * @param  {Number} i how often to update
			 * @return {Object}          this so calls can be chained
			 */
			this.start = function(i) {
				interval = i || 'seconds'; //default to a second
	
				duration = Math.abs(from - to);
	
				if (typeof interval === 'string') {
					intervalUnit = interval;
				}
	
				//if we are using seconds set the millis to 0 so we start on an
				//even second
				if (intervalUnit === 'seconds') {
					interval = 1000;
					start = new Date();
					start.setMilliseconds(0);
					start = start.getTime();
				}
	
				start = start || (new Date()).getTime();
				intervalWindow = interval / 2;
	
				timerInterval = setInterval(updateTime, interval);
	
				return this;
			};
	
			/**
			 * Set a count down from t to f
			 * @param  {Date|Number} t date or milliseconds to stop at
			 * @param  {Date|Number} f date or milliseconds to start at
			 * @return {Object}   this so calls can be chained
			 */
			this.countDown = function(t, f) {
				from = getTimeStamp(f);
	
				if (t || t === 0) {
					to = getTimeStamp(t);
				} else {
					to = Infinity;
				}
	
				direction = -1;
	
				return this;
			};
	
			/**
			 * Set a count up from t to f
			 * @param  {Date|Number} t date or milliseconds to stop at
			 * @param  {Date|Number} f date or milliseconds to start at
			 * @return {Object}   this so calls can be chained
			 */
			this.countUp = function(t, f) {
				from = getTimeStamp(f);
	
				if (t || t === 0) {
					to = getTimeStamp(t);
				} else {
					to = Infinity;
				}
	
				direction = 1;
	
				return this;
			};
	
			/**
			 * Add a callback to be called every time the interval passes
			 *
			 *	Will be called with an object containing...
			 *	{
			 *		hours: int, //number of hours left
			 *		minutes: int, //number of minutes left after hours
			 *		seconds: int, //number of seconds left after minutes
			 *		milliseconds: int, //number of milliseconds left after seconds
			 *		remaining: int, //total number of milliseconds left
			 *	}
			 *
			 * @param  {Function} fn callback to be called
			 * @return {Object}      return this so calls can be chained
			*/
			this.tick = function(fn) {
				var time = from;
	
				tickFn = fn;
	
				tickFn.call(null, {
					days: TimeUtils.getDays(time),
					hours: TimeUtils.getHours(time),
					minutes: TimeUtils.getMinutes(time),
					seconds: TimeUtils.getSeconds(time),
					milliseconds: TimeUtils.getMilliSeconds(time),
					time: time,
					remaining: Math.abs(to - from)
				});
	
				return this;
			};
	
	
			/**
			 * Clear the interval, make sure this gets called. Otherwise we will have an interval hanging around
			 * @return {Object} return this so calls can be chained
			 */
			this.stop = function() {
				clearInterval(timerInterval);
	
				return this;
			};
	
	
			/**
			 * A callback to be called when the timer reaches the destination
			 * @param  {Function} fn [description]
			 * @return {Object}      return this so calls can be chained
			 */
			this.alarm = function(fn) {
				alarmFn = fn;
	
				return this;
			};
		};
	
	});


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Toaster = __webpack_require__(9);
	
	
	module.exports = exports = new Ext.define('NextThought.common.toast.Manager', {
		requires: [
			'NextThought.common.toast.Window'
		],
	
		PADDING: 10,
	
		/** @private */
		constructor: function() {
			this.callParent(arguments);
			this.stack = [];
	
			Ext.EventManager.onWindowResize(this.adjustStack, this, null);
		},
	
		/**
		 *
		 * Pop up a toast notification.
		 *
		 * ### Example: (Chat invitation)
		 *
		 *     myToastMessage = Toaster.makeToast({
		 *         title: 'Chat Invitation...',
		 *         message: 'You\'ve been invited to chat with <span>Math Buddies</span>.',
		 *         iconCls: 'icons-chat-32',
		 *         timeout: 60,
		 *         //Buttons appear in the RTL order, so decline, here, will be the rigth-most button
		 *         buttons: [{
		 *             label: 'decline',
		 *             callback: [...],
		 *             scope: this
		 *         }, {
		 *             label: 'accept',
		 *             callback: [...],
		 *             scope: this
		 *         }],
		 *         callback: [...],
		 *         scope: this
		 *     });
		 *
		 * #### Note about callbacks:
		 *
		 * The main callback is called when the toast message is closed, eiher by acting on a button, closing it or timing
		 * out. The callback is called with the actedOn button config or false if the notification is closing without
		 * action.
		 *
		 * The individual buttons' callback's are called on the click event of that button after the main callback.
		 * You cannot stop the main callback from being called.
		 *
		 * @param {Object} bread Configuration for {@link NextThought.view.toast.Window}
		 * @return {Object} Toast component instance
		 */
		makeToast: function(bread) {
			var size = Ext.dom.Element.getViewSize(),
				toast,
				timeout = bread.timeout || false;
	
			toast = Ext.widget('toast', bread);
			this.stack.push(toast);
	
			toast.setPosition(size.width - (toast.width + 10), size.height);
			toast.on('afterRender', this.popToast, this, {single: true});
			toast.on('destroy', this.eatToast, this);
			toast.show();
	
			if (timeout && timeout > 0) {
				toast.timeoutId = Ext.defer(toast.close, timeout, toast);
			}
	
			return toast;
		},
	
		/** @private */
		measure: function(loaf) {
			var padding = this.PADDING,
				sum = 0;
			Ext.each(loaf, function(o) {sum += (o.getHeight() + padding);});
			return sum;
		},
	
		/** @private */
		eatToast: function(toast) {
			if (toast.hasOwnProperty('timeoutId')) {
				clearTimeout(toast.timeoutId);
			}
	
			var idx = Ext.Array.indexOf(this.stack, toast);
			if (idx < 0) {return;}
	
			this.stack.splice(idx, 1);
			this.adjustStack();
		},
	
	
		adjustStack: function() {
			Ext.each(this.stack, this.popToast, this);
		},
	
	
		/** @private */
		popToast: function(toast) {
	
			var vp = Ext.dom.Element.getViewSize(),
				left = vp.width - (toast.width + 10),
				top = vp.height,
				idx;
			if (this.stack.length > 0) {
				idx = Ext.Array.indexOf(this.stack, toast);
				top -= this.measure(this.stack.slice(0, idx));
			}
	
			top = Math.max(top - (toast.getHeight() + this.PADDING), 0);
	
			toast.animate({
				duration: 400,
				to: { top: top, left: left }
			});
		}
	
	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.mixins.HasLinks', {
	
		getLink: function(rel, raw) {
			var links = this.get('Links') || Ext.data.Types.LINKS.convert((this.raw && this.raw.Links) || []),
				ref = links ? links.getRelHref(rel, raw === true) : null;//raw is only ever true if and only if passing litterally "true" to the param. Not 'truthy'
			return ref ? getURL(ref) : null;
		},
	
	
		getLinkFragment: function(rel) {
			return (this.getLink(rel, true) || '').split('#')[1];
		},
	
	
		getLinkMethod: function(rel) {
			var links = this.get('Links'),
				link = links && links.getRelLink(rel);
	
			return link && link.method;
		},
	
	
		hasLink: function(rel) {
			return !!this.getLink(rel);
		},
	
	
		deleteLink: function(rel) {
			var links = this.get('Links').links || (this.raw && this.raw.Links), reqLink;
	
			Ext.Array.every(links || [], function(link) {
				if (link && link.rel === rel) {
					reqLink = link;
					return false;
				}
				return true;
			});
	
			if (reqLink) {
				Ext.Array.remove(links, reqLink);
			}
		},
	
	
		getReportLinks: function() {
			var linksObj = this.get('Links'),
				links = (linksObj && linksObj.links) || (this.raw && this.raw.Links),
				reports = [];
	
			(links || []).forEach(function(link) {
				if (link.rel.indexOf('report-') === 0) {
					reports.push(link);
				}
			});
	
			return reports;
		}
	});


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.PresenceInfo', {
	    override: 'Ext.data.Types',
	
	    PRESENCEINFO: {
			type: 'PresenceInfo',
			sortType: 'none',
			convert: function(v, record) {
				if (!v.isPresenceInfo) {
					return NextThought.model.PresenceInfo.createPresenceInfo(record.get('username'), 'unavailable');
				}
	
				return v;
			}
		}
	}, function() {
		function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }
		set(this.PRESENCEINFO);
	});


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	var ParseUtils = __webpack_require__(3);
	var ReaderBase = __webpack_require__(67);
	
	
	module.exports = exports = Ext.define('NextThought.proxy.reader.Json', {
		extend: 'NextThought.proxy.reader.Base',
		alias: 'reader.nti',
		initialConfig: {root: 'Items'},
	
		collectionTypes: {
			'application/vnd.nextthought.collection': 1,
			'application/vnd.nextthought.searchresults': 1
		},
	
		onItemRead: Ext.identityFn,
	
		readRecords: function(data) {
			var records = [], key,
				items = data.Items, item,
				mimeType = data.MimeType,
				links = data.Links,
				lastViewed = data.lastViewed,
				baseModel = this.model,
				result, i, record, modelName;
	
			if (data.request) {
				if (data.status !== 204) {
					console.warn('Unknown response?', data);
				}
				return [];
			}
	
			if (this.collectionTypes[mimeType] || (mimeType === undefined && items)) {
				for (key in items) {
					if (items.hasOwnProperty(key)) {
						item = this.onItemRead(items[key], key);
	
						if (typeof item === 'string') {
							console.warn('IGNORING: Received string item at key:', key, item);
							continue;
						}
	
						if (!ParseUtils.findModel(item)) {
							console.warn('IGNORING: Received object that does not match a model', item);
							continue;
						}
	
						records.push(item);
					}
				}
	
				data.Items = records;
			} else {
				data = [data];
			}
	
			try {
	
				result = this.callParent([data]);
				if (lastViewed) {
					result.lastViewed = Ext.Date.parse(lastViewed, 'timestamp', true);
				}
				if (links && Ext.isArray(links)) {
					result.links = {};
					Ext.each(links, function(l) {result.links[l.rel] = l.href;});
				}
	
				try {
					i = result.records.length - 1;
					for (i; i >= 0; i--) {
						record = result.records[i];
						try {
							//Stores like to have one type of model in them, but we need non-homogenous stores.
							//e.g. PageItem stores have notes, highlights, redaction, etc.  So make sure we coerce the proper model
							//here.  TODO move into NextThought.proxy.reader.Base and/or a more elegant way to do this
							if (record instanceof NextThought.model.Base && !record.homogenous) {
								modelName = record.get('Class');
								if (record.modelName.substr(-modelName.length) !== modelName) {
									result.records[i] = this.__rebuildRecordAsType(
											ParseUtils.findModel(record.raw), record.getId(), record.raw);
									delete record.raw;
								}
							}
						}
						catch (e1) {
							console.error(Globals.getError(e1), '\n\nNo model for record? : ', record);
						}
					}
				} finally {
					//put the base back
					if (this.model !== baseModel) {
						this.model = baseModel;
						this.buildExtractors(true);
					}
				}
	
				return result;
			}
			catch (e) {
				console.error(e.stack || e, records);
				return Ext.data.ResultSet.create({
					total: 0,
					count: 0,
					records: [],
					success: false
				});
			}
		},
	
		__rebuildRecordAsType: function(Model, id, data) {
			var convertedValues,
					record = new Model(undefined, id, data, convertedValues = {});
	
			if (this.model !== Model) {
				this.model = Model;
				this.buildExtractors(true);
			}
	
			record.phantom = false;
	
			this.convertRecordData(convertedValues, data, record);
	
			return record;
		}
	});


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Toaster = __webpack_require__(9);
	var ParseUtils = __webpack_require__(3);
	var CommonStateStore = __webpack_require__(14);
	var ModelRoomInfo = __webpack_require__(18);
	
	
	module.exports = exports = Ext.define('NextThought.app.chat.StateStore', {
	    extend: 'NextThought.common.StateStore',
	    availableForChat: false,
	    PRESENCE_MAP: {},
	    STATE_KEY: 'chats',
	    CHAT_WIN_MAP: {},
	    ROOM_USER_MAP: {},
	
	    getSocket: function() {
			if (!this.socket) {
				this.socket = Socket;
			}
	
			return this.socket;
		},
	
	    setMySelfOffline: function() {
			var me = this;
	
			me.didSetMySelfOffline = true;
	
			wait(5000)
				.then(function() {
					me.didSetMySelfOffline = false;
				});
		},
	
	    getPresenceOf: function(user) {
			var username = (user && user.isModel) ? user.get('Username') : user;
	
			if (!username) { return; }
	
			return this.PRESENCE_MAP[username];
		},
	
	    /**
		 * Update the presence of a user, if it is the current user and they went offline
		 * in another session, give them a chance to come back online.
		 *
		 * @param {String} username       id of the user the presence if for
		 * @param {PresenceInfo} presence       the presence
		 * @param {Function} changePresence what to call if they do set themselves online
		 */
		setPresenceOf: function(username, presence, changePresence) {
			var prevToast = this.__offlineToast,
				oldPresence;
	
			if (isMe(username)) {
				//if we are online we are available for chat
				if (presence.isOnline()) {
					this.availableForChat = true;
	
					if (prevToast) {
						prevToast.destroy();
					}
				} else {
					oldPresence = this.PRESENCE_MAP[username];
	
					//if we didn't trigger being offline and our old presence was online alert the user
					if (!this.didSetMySelfOffline && oldPresence && oldPresence.isOnline()) {
						console.log('Set offline in another session');
						this.didSetMySelfOffline = false;
	
						if (prevToast) {
							prevToast.destroy();
						}
	
						this.__offlineToast = Toaster.makeToast({
							id: 'revertToast',
							message: 'You are currently unavailable because you went offline in another session.',
							buttons: [
								{
									label: 'Okay'
								},
								{
									label: 'Set to available',
									callback: function() {
										presence.set({type: 'available', show: 'chat'});
										changePresence(presence);
									}
								}
							]
						});
					}
				}
			}
	
			this.PRESENCE_MAP[username] = presence;
	
			this.fireEvent('presence-changed', username, presence);
		},
	
	    showChatWindow: function(roomInfo) {
			this.fireEvent('show-window', roomInfo);
		},
	
	    fireGutterToggle: function() {
			// The chat gutter should always be visible except in case the viewport width is too small (i.e width < 1024)
			// In those cases, we will use this event to show and hide the gutter.
			this.fireEvent('toggle-gutter');
		},
	
	    notify: function(win, msg) {
			var creator = msg && msg.isModel ? msg.get('Creator') : msg && msg.Creator;
			if (!isMe(creator)) {
				this.fireEvent('notify', win, msg);
			}
		},
	
	    getChatWindow: function(roomInfo) {
			var me = this,
				rIsString = (typeof roomInfo === 'string'),
				w, occupantsKey;
	
			if (!rIsString && roomInfo) {
				occupantsKey = roomInfo.getOccupantsKey();
			}
			else if (rIsString) {
				occupantsKey = this.ROOM_USER_MAP[roomInfo];
			}
	
			if (occupantsKey) {
				w = this.getWindow(occupantsKey);
			}
	
			return w;
		},
	
	    replaceChatRoomInfo: function(chatWindow, newRoom) {
			var	oldRoom = chatWindow.roomInfo,
				occupantsKey = newRoom && newRoom.getOccupantsKey(),
				me = this;
	
			if (!oldRoom || !newRoom || oldRoom.getId() === newRoom.getId()) {
				return;
			}
	
			if (occupantsKey !== oldRoom.getOccupantsKey()) {
				console.warn('Chat room occupants key are not identical. New key: ',
					occupantsKey, ' and old key: ', oldRoom.getOccupantsKey());
			}
	
			// Delete the old cache
			console.debug('deleting the cache for the old room info: ', oldRoom.getId());
			me.removeSessionObject(occupantsKey);
	
			// Change the roomInfo to the new one.
			chatWindow.roomInfoChanged(newRoom);
	
			// Cache the new room to make sure the map that the store is in sync
			console.debug('caching new room info : ', newRoom.getId());
			me.CHAT_WIN_MAP[occupantsKey] = chatWindow;
			me.ROOM_USER_MAP[newRoom.getId()] = occupantsKey;
			me.putRoomInfoIntoSession(newRoom);
		},
	
	    cacheChatWindow: function(win, roomInfo) {
			var rid = roomInfo && roomInfo.isModel ? roomInfo.getId() : roomInfo,
				occupantsKey = roomInfo && roomInfo.getOccupantsKey();
	
			this.CHAT_WIN_MAP[occupantsKey] = win;
			this.ROOM_USER_MAP[rid] = occupantsKey;
			this.fireEvent('added-chat-window', win);
		},
	
	    getWindow: function(id) {
			return this.CHAT_WIN_MAP[id];
		},
	
	    getAllChatWindows: function() {
			var wins = [];
			for(var k in this.CHAT_WIN_MAP) {
				if(this.CHAT_WIN_MAP.hasOwnProperty(k)) {
					wins.push(this.CHAT_WIN_MAP[k]);
				}
			}
	
			return wins;
		},
	
	    /**
		 * Check to see if a room already exists.  A room exists when any of the following conditions are met, in this order:
		 *1) if there's a roomId sent.  there must be an existing roomId in the active rooms object.
		 *2) if no roomId is sent, then look for a room with the same constituants, that room must not be a group/class.
		 *
		 * @param {Array} users list of users
		 * @param {String} roomId roomid
		 * @param {Object} options
		 * @return {NextThought.model.RoomInfo}
		 */
		existingRoom: function(users, roomId) {
			var allUsers = Ext.Array.unique(users.slice().concat($AppConfig.userObject.get('Username'))),
				occupantsKey = Ext.Array.sort(allUsers).join('_');
	
			console.debug('Checking for existing room for occupants key: ', occupantsKey, ' and roomInfo id: ', roomId);
			return this.getRoomInfoFromSession(occupantsKey);
		},
	
	    putRoomInfoIntoSession: function(roomInfo) {
			if (!roomInfo) {
				console.error('Requires a RoomInfo object');
				return;
			}
	
			var roomData = roomInfo.getData(),
				key = roomInfo.getOccupantsKey();
	
			roomData.originalOccupants = roomInfo.getOriginalOccupants();
			console.debug('****** caching roomInfo: ', roomInfo.getId(), ' to: ', key);
	
			this.setSessionObject(roomData, key);
		},
	
	    /**
		 *
		 * @param {String} [key] Optional sub-key
		 * @return {*}
		 */
		getSessionObject: function(key) {
			var o = TemporaryStorage.get(this.STATE_KEY) || {};
			if (!Ext.isEmpty(key)) {
				return o[key];
			}
			return o;
		},
	
	    /**
		 *
		 * @param {Object} o Value to put into session storage.
		 * @param {String} [key] Optional key. If present, `o` is assumed to be the new value at the `key` instead of
		 *              the whole session object.
		 */
		setSessionObject: function(o, key) {
			var leaf = o;
			if (!Ext.isEmpty(key)) {
				o = this.getSessionObject();
				o[key] = leaf;
			}
	
			TemporaryStorage.set(this.STATE_KEY, o);
		},
	
	    removeSessionObject: function(key) {
			if (!Ext.isEmpty(key)) {
				var o = this.getSessionObject();
				delete o[key];
				this.setSessionObject(o);
				return;
			}
			TemporaryStorage.remove('chats');
		},
	
	    isPersistantRoomId: function(id) {
			return (/meetingroom/i).test(id);
		},
	
	    isOccupantsKeyAccepted: function(id) {
			return Boolean((this.getSessionObject('roomIdsAccepted') || {})[id]);
		},
	
	    setOccupantsKeyAccepted: function(roomInfo) {
			var key = 'roomIdsAccepted',
				occupantsKey = roomInfo.getOccupantsKey(),
				status = this.getSessionObject(key) || {};
	
			status[occupantsKey] = true;
			this.setSessionObject(status, key);
		},
	
	    deleteOccupantsKeyAccepted: function(roomInfo) {
			var key = 'roomIdsAccepted',
				status = this.getSessionObject(key),
				occupantsKey = roomInfo.getOccupantsKey();
	
			if (!status) {
				return;
			}
	
			delete status[occupantsKey];
			delete this.CHAT_WIN_MAP[occupantsKey];
			this.setSessionObject(status, key);
			this.fireEvent('exited-room', roomInfo.getId());
		},
	
	    getAllOccupantsKeyAccepted: function() {
			var accepted = this.getSessionObject('roomIdsAccepted') || {},
				pairs = [], key;
	
			for (key in accepted) {
				if (accepted.hasOwnProperty(key)) {
					pairs.push(key);
				}
			}
	
			return pairs;
		},
	
	    getRoomInfoFromSession: function(key, json) {
			if (!key) {
				Ext.Error.raise('Requires key to look up RoomInfo');
			}
	
			var m;
			json = json || this.getSessionObject(key);
	
			if (json) {
				try {
					m = new NextThought.model.RoomInfo(json);
					m.setOriginalOccupants(json.originalOccupants);
					return m;
				}
				catch (e) {
					console.warn('Item in session storage is not a roomInfo', json);
				}
			}
			return null; //not there
		},
	
	    getAllRoomInfosFromSession: function() {
			var roomInfos = [], ri, key, chats;
	
			chats = this.getSessionObject();
	
			for (key in chats) {
				if (chats.hasOwnProperty(key)) {
					if (key && key !== 'roomIdsAccepted') {
						ri = this.getRoomInfoFromSession(key, chats[key]);
						if (ri) {
							roomInfos.push(ri);
						}
					}
				}
			}
			return roomInfos;
		},
	
	    removeAllRoomInfosFromSession: function() {
			var chats = this.getSessionObject(),
				o = chats['roomIdsAccepted'];
	
			this.setSessionObject(this.STATE_KEY, o);
		},
	
	    updateRoomInfo: function(ri) {
			var win = this.getChatWindow(ri.getId()),
					ro = win ? win.roomInfo : this.getRoomInfoFromSession(ri.getId());
			if (ro) {
				ro.fireEvent('changed', ri);
			}
			this.putRoomInfoIntoSession(ri);
		},
	
	    buildTranscriptId: function(roomInfoId, uname, type) {
			var id = ParseUtils.parseNTIID(roomInfoId);
	
			if (!id) {
				return null;
			}
			id.specific.provider = uname;
			id.specific.type = type;
	
			return id;
		},
	
	    getTranscriptIdForRoomInfo: function(roomInfo) {
			var id = roomInfo.isModel ? roomInfo.getId() : roomInfo;
			return this.buildTranscriptId(id, $AppConfig.username.replace('-', '_'), 'Transcript');
		},
	
	    getTranscripts: function() {
			return this.__transcriptStore;
		}
	});


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.common.StateStore', {
		mixins: {
			observable: 'Ext.util.Observable'
		},
	
	
		inheritableStatics: {
			__instance: null,
	
			/**
			 * Either returns or create an instance, so that every thing that uses the
			 * state store is using the same instance.
			 *
			 * @return {Object} an instance of this state store
			 */
			getInstance: function() {
				if (!this.__instance) {
					this.__instance = this.create();
				}
	
				return this.__instance;
			}
		},
	
	
		constructor: function(config) {
			this.callParent(arguments);
	
			this.mixins.observable.constructor.call(this, config);
		},
	
	
		isLoading: function() {
			return this.loading;
		},
	
	
		hasLoaded: function() {
			return this.hasFinishedLoad;
		},
	
	
		setLoading: function() {
			this.loading = true;
		},
	
	
		setLoaded: function() {
			this.loading = false;
			this.hasFinishedLoad = true;
			this.fireEvent('loaded');
		},
	
		/**
		 * A wrapper so we don't have to repeat this everywhere
		 * make sure setLoaded is called at some point if you use this
		 * @return {Promise} fulfills once setLoaded has been called
		 */
		onceLoaded: function() {
			if (this.hasLoaded()) {
				return Promise.resolve(this);
			}
	
			var me = this;
	
			return new Promise(function(fulfill, reject) {
				me.on({
					single: true,
					'loaded': fulfill.bind(null, me)
				});
			});
		}
	});


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.mixins.Avatar', {
	
		statics: {
			BAKCGROUND_CHOICE_COUNT: 13,
	
			//http://www.materialui.co/colors 600 line
			DEFAULT_AVATAR_BG_COLORS: [
				'5E35B1',
				'3949AB',
				'1E88E5',
				'039BE5',
				'00ACC1',
				'00897B',
				'43A047',
				'7CB342',
				'C0CA33',
				'FDD835',
				'FFB300',
				'FB8C00',
				'F4511E'
			],
	
			AVATAR_CACHE: {},
	
			getValidAvatarURL: function(url) {
				if (!this.AVATAR_CACHE[url]) {
					this.AVATAR_CACHE[url] = new Promise(function(fulfill, reject) {
						var img = new Image();
	
						img.onload = fulfill.bind(null, url);
						img.onerror = fulfill.bind(null, null);
	
						img.src = url;
					});
				}
	
				return this.AVATAR_CACHE[url];
			},
	
	
			getUsernameHash: function(str) {
				var hash = 0, c, i;
	
				if (!str || str.length === 0) { return hash; }
	
				for (i = 0; i < str.length; i++) {
					c = str.charCodeAt(i);
					hash = ((hash << 5) - hash) + c;
					hash = hash & hash; // Convert to 32bit integer
				}
	
				return hash;
			},
	
	
			getDefaultBackgroundForUsername: function(username) {
				var hash = this.getUsernameHash(username),
					idx = Math.abs(hash) % this.BAKCGROUND_CHOICE_COUNT;
	
				if (idx < 10) {
					idx = '0' + idx;
				}
	
				return '/app/resources/images/profile-backgrounds/profile_bg_' + idx + '.jpg';
			},
	
	
			getBackgroundColorForUsername: function(username) {
				var hash = this.getUsernameHash(username),
					idx = Math.abs(hash) % this.DEFAULT_AVATAR_BG_COLORS.length;
	
				return this.DEFAULT_AVATAR_BG_COLORS[idx];
			},
	
	
			//This is isn't really a battle we can win given the complexity of names
			//globally, however as a default this should work.  If they don't like it
			//they can upload an image.  If we have a first and last from the server
			//take the first char of each, else take the first char of the display name.
			//As of 7/2015 this matches the mobile app. Unresolved users don't show initials
			getAvatarInitials: function(data, f, l, d) {
				//TODO should we cache this?
	
				var first = f || data.NonI18NFirstName,
				last = l || data.NonI18NLastName,
				dn = d || data.displayName;
	
				return first && last ? first[0] + last[0] : (dn && dn[0]);
			}
		},
	
		initAvatar: function() {
			var me = this;
	
			//Give the field converters a chance to run
			wait()
				.then(function() {
					return Promise.all([
						me.__getAvatar(),
						me.__getInitials(),
						me.__getBGColor()
					]);
				}).then(function(results) {
					me.set({
						avatarURL: results[0],
						avatarInitials: results[1],
						avatarBGColor: results[2]
					});
	
					// Fire a changed event. This will help update the avatarURL with the correct one,
					// when it's been temporary set to a unresolved or initials avatar while we verify if it's a valid URL.
					// Since this promise fulfills asynchronously, the view that requested
					// it could be rendered when it fulfills within the next even loop.
					me.fireEvent('avatarChanged', me);
				});
		},
	
	
		isUnresolved: function() { return true; },
	
	
		__getAvatar: function() {
			var url = this.get('avatarURL');
	
			if (!url) {
				return null;
			}
	
			//assume its a bad link until we know otherwise
			this.set('avatarURL', '');
	
			return NextThought.mixins.Avatar.getValidAvatarURL(url);
		},
	
	
		__getInitials: function() {
			if (this.isUnresolved()) {
				return null;
			} else {
				return NextThought.mixins.Avatar.getAvatarInitials(this.raw, this.get('FirstName'), this.get('LastName'), this.getName());
			}
		},
	
	
		__getBGColor: function() {
			return NextThought.mixins.Avatar.getBackgroundColorForUsername(this.get('Username'));
		},
	
	
	
		getBackgroundImage: function() {
			var background = this.get('backgroundURL'),
				username = this.get('Username');
	
			if (background) {
				return Promise.resolve(background);
			}
	
			return Promise.resolve(NextThought.mixins.Avatar.getDefaultBackgroundForUsername(username));
		}
	});


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var DelegateFactory = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Delegation/Factory\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	
	/**
	 * Enables auto-magical delegation of methods.
	 *
	 * To declare a method in a component as being delegated simply add a property to the method "delegated:true". At the
	 * bottom of this file there is a helper class that makes this easy. @see {NextThought.mixins.Delegation.Factory}
	 *
	 * To attach delegate(s) to a component set the `delegate` config property to be either 'inherit' or a selector of the
	 * component that will be delegated to. (It can also be an array if different components care about different aspects)
	 */
	module.exports = exports = Ext.define('NextThought.mixins.Delegation', function() {
		var debug = $AppConfig.debugDelegation;
	
		/** @private */
		function getInheritedDelegates(cmp) {
			var ancestor = cmp.up('[delegate]:not([delegate="inherit"])');
			return ancestor && ancestor.delegate;
		}
	
		/** @private */
		function askDelegate(cmp,fn,applyAll,args) {
			var result = null,
				found = false;
	
			function getAgent(o,fn) {
				return (o.deletgationAgent || {})[fn] || o[fn];
			}
	
			if (cmp.delegate === 'inherit') {
				cmp.delegate = getInheritedDelegates(cmp);
			}
	
			if (!Ext.isArray(cmp.delegate)) {
				cmp.delegate = [cmp.delegate];
			}
	
			try {
				Ext.each(cmp.delegate, function(v,i,a) {
					var f, c, CQ = Ext.ComponentQuery;
					if (Ext.isString(v)) {
						c = CQ.query(v, cmp.up()).first();
						if (!c) {
							console.debug('Did not find delegate as a sibling or descendant...trying global');
							c = CQ.query(v).first();
						}
						v = c || v;
					}
	
					if (!v || !v.isComponent) {
						console.debug('No component:', cmp.id, a[i], i, a);
						return;
					}
	
					if (a[i] !== v) {
						a[i] = v;//cache result
					}
	
					f = getAgent(v, fn);
					if (!Ext.isFunction(f)) {
						console.warn('The delegate', v.id, 'does not implement', fn);
					}
					else {
						if (found && !applyAll) {
							console.error('Multiple delegated functions: ', fn, v.id);
						}
						found = true;
						result = f.apply(v, args);
					}
				});
			}
			catch (e) {
				Ext.log.error(e.stack || e.message || e);
			}
	
			return result;
		}
	
		/** @private */
		function setupDelegates(cmp) {
			var k, v;
	
			function makeDelegate(k,fn,o) {
				return function() {
					if (debug) { console.debug('delegating...' + k); }
					var v = askDelegate.apply(o, [o, k, fn.applyAll, arguments]);
					if (v === DelegateFactory.PREVENT_DEFAULT) {return undefined;}
					return v || fn.apply(o, arguments);
				};
			}
	
			//I WANT all properties... so skipping !hasOwnProperty is not an option.
			/*jslint forin: true */
			for (k in cmp) {
				v = cmp[k];
				if (Ext.isFunction(v) && v.delegated) {
					if (debug) {console.debug('Rewriting...', k);}
					cmp[k] = makeDelegate(k, v, cmp);
				}
			}
		}
	
	
		return {
			initDelegation: function() {
				if (!this.delegate) { return; }
				setupDelegates(this);
			},
	
	
			registerDelegationTarget: function(delegate,targetFn) {
				var o = {};
				if (Ext.isString(delegate)) {
					o[delegate] = Ext.isString(targetFn) ? this[targetFn] : Ext.isFunction(targetFn) ? targetFn : null;
				}
				else if (Ext.isObject(delegate)) {
					Ext.Object.each(delegate, this.registerDelegationTarget, this);
				}
	
				this.deletgationAgent = Ext.apply(this.deletgationAgent || {},o);
			}
		};
	});
	
	
	/**
	 * Utility class to aid in defining delegated functions.
	 */
	module.exports = exports = Ext.define('NextThought.mixins.Delegation.Factory', {
		singleton: true,
		alternateClassName: 'DelegateFactory',
	
		/** @property This is a special value to return form a delegated function to prevent the default */
		PREVENT_DEFAULT: {},
	
		/**
		 * Makes a delegated function with a default of the passed function.
		 *
		 * @param {Function} [fn] The default behavior if there is no delegate or if the delegate does not return
		 *                      {@link #PREVENT_DEFAULT}
		 * @param {Boolean} [applyAll] If more than one delegate offer an implementation, use them all. (Obviously the
		 *						return value will be meaningless, so don't use this for functions that need to return
		 *						something)
		 *
		 * @return {Function} The delegated function.
		 */
		getDelegated: function(fn,applyAll) {
			fn = fn || function() {};
			fn.delegated = true;
			fn.applyAll = Boolean(applyAll);
			return fn;
		}
	});


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var ObjectUtils = __webpack_require__(4);
	var ModelBase = __webpack_require__(6);
	
	
	module.exports = exports = Ext.define('NextThought.model.PresenceInfo', {
		extend: 'NextThought.model.Base',
		idProperty: 'username',
		fields: [
			{ name: 'username', type: 'string'},
			{ name: 'type', type: 'string'},
			{ name: 'show', type: 'string', defaultValue: 'chat'},
			{ name: 'status', type: 'string', defaultValue: null}
		],
	
		statics: {
			createFromPresenceString: function(presence, username) {
				return Ext.create('NextThought.model.PresenceInfo', {
					'username': username,
					'type': (presence.toLowerCase() !== 'online') ? 'unavailable' : 'available'
				});
			},
	
			createPresenceInfo: function(username, type, show, status) {
				return Ext.create('NextThought.model.PresenceInfo', {
					'username': username,
					'type': (type) ? type : 'unavailable',
					'show': show,
					'status': status
				});
			}
		},
	
	
		constructor: function() {
			this.callParent(arguments);
	
			ObjectUtils.defineAttributes(this, {
				name: {
					getter: this.getName
				}
			});
		},
	
	
		isPresenceInfo: true,
	
		nameToDisplay: {
			'dnd': 'Do not disturb',
			'away': 'Away',
			'available': 'Available',
			'unavailable': '',
			'invisible': 'Invisible'
		},
	
		isOnline: function() {
			return this.get('type') !== 'unavailable';
		},
	
		toString: function() {
			return (this.isOnline()) ? 'Online' : 'Offline';
		},
	
		getDisplayText: function() {
			var status = this.get('status');
	
			if (!this.isOnline()) {
				return '';
			}
	
			if (!Ext.isEmpty(status) && status !== 'null') {
				return this.get('status');
			}
	
			return this.nameToDisplay[this.getName()];
		},
	
		getName: function() {
			var show = this.get('show');
	
			if (!this.isOnline()) {
				return 'unavailable';
			}
	
			if (show === 'chat') {
				return 'available';
			}
	
			if (show === 'xa') {
				return 'invisible';
			}
	
			return show;
		}
	
	});


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var ModelBase = __webpack_require__(6);
	
	
	module.exports = exports = Ext.define('NextThought.model.RoomInfo', {
		extend: 'NextThought.model.Base',
		mimeType: 'application/vnd.nextthought._meeting',
	
		idProperty: 'ID',
		fields: [
			{ name: 'Active', type: 'bool' },
			{ name: 'MessageCount', type: 'int' },
			{ name: 'Occupants', type: 'UserList'},
			{ name: 'Moderators', type: 'UserList'},
			{ name: 'Moderated', type: 'bool'},
			{ name: 'inReplyTo', type: 'string' },
			{ name: 'references', type: 'auto', defaultValue: [] }
		],
	
		isGroupChat: function() {
			var participants = this.getOriginalOccupants();
	
			if (Ext.isEmpty(participants, false)) {
				participants = this.get('Occupants');
			}
			return participants.length > 2;
		},
	
		getAllRoomStates: function() { return this.roomStates || {}; },
	
		getRoomState: function(user) {
			if (!this.roomStates) { return null;}
			return this.roomStates[user];
		},
	
		setRoomState: function(user, state) {
			if (!this.roomStates) { this.roomStates = {};}
			this.roomStates[user] = state;
		},
	
		getInputTypeStates: function() {
			var p = [], inputStates = ['composing', 'paused'], me = this;
			Ext.each(me.get('Occupants'), function(user) {
				var userState = me.getRoomState(user);
				if (Ext.Array.contains(inputStates, userState) && !isMe(user)) {
					p.push({user: user, state: userState});
				}
			});
			return p;
		},
	
		/*
		 *  NOTE: We want to add an additional property 'OriginalOccupants' that we will use to compare 1-1 rooms with the same occupants(to see if we can merge them.)
		 *  Because Occupants property only contain the live list of occupants and
		 *  some occupants might have left the chat before, the original occupants will help to compare chat rooms with the same occupants.
		 */
	
		setOriginalOccupants: function(occupants) {
			this._originalOccupants = occupants;
		},
	
		getOriginalOccupants: function() {
			return this._originalOccupants || [];
		},
	
	
		getOccupantsKey: function() {
			var occupants = this.getOriginalOccupants();
			if (occupants.length === 0) {
				occupants = this.get('Occupants');
			}
	
			return Ext.Array.sort(occupants).join("_");
		}
	});


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.ContentRangeDescription', {
	    override: 'Ext.data.Types',
	
	    CONTENTRANGEDESCRIPTION: {
			type: 'ContentRangeDescription',
			convert: function(v, record) {
				try {
					if (v) {
						return NextThought.model.anchorables.ContentRangeDescription.createFromObject(v);
					}
					else {
						return null;
					}
				}
				catch (e) {
					console.error('CRD: Parsing Error: ', e.message, e.stack, arguments);
					return null;
				}
			}
		}
	});


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.DCCreatorToAuthor', {
	    override: 'Ext.data.Types',
	
	    DCCREATORTOAUTHOR: {
			type: 'DCCreatorToAuthor',
			convert: function(v) {
				return v && v.join(', ');
			},
			sortType: 'none'
		}
	}, function() {
		this.DCCREATORTOAUTHOR.sortType = Ext.data.SortTypes.none;
	});


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.Date', {
	    override: 'Ext.data.Types'
	}, function() {
		Ext.data.Types.ISODATE = {
			convert: function(v) {
				//if we already have a date don't try to parse it
				if (v instanceof Date) {
					return v;
				}
	
				if (v && v[v.length - 1] === 'Z') {
					v = v.substr(0, v.length - 1);
				}
	
				var fmt = 'Y-m-d\\TH:i:sP',
				//we know most of the time the date will be a timezone-less sting... so concat the GMT zone and parse strict.
					d = Ext.Date.parse(v + '-00:00', fmt, true);
	
				//if the parse strict fails, d will be undefined, and we will parse again without the concat.
				return d || Ext.Date.parse(v, fmt, true);
			},
			type: 'ISODate',
			sortType: Ext.data.SortTypes.asDate
		};
	
		Ext.data.Types.NTIDATE = {
			convert: function(v) {
				if (Number(v) !== v) {
					v = 0;
				} else if (v % 1 !== 0) {
					v = Math.round(v * 1000);
				}
	
				return new Date(v);
			},
			type: 'NTIDate',
			sortType: Ext.data.SortTypes.asDate
		};
	});


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.Future', {
	    override: 'Ext.data.Types',
	
	    FUTURE: {
			type: 'Future',
			sortType: 'none',
			convert: function(v) {
				if (v && v.isModel) {
					return v;
				}
	
				return {
					isFuture: true
				};
			}
		}
	}, function() {
		function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }
		set(this.FUTURE);
	});


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.GroupByTime', {}, function() {
		Ext.data.Types.GROUPBYTIME = {
			type: 'groupByTime',
			sortType: Ext.data.SortTypes.asUCString,
	
			DAY: 86400,//seconds in a day
			WEEK: 604800, //seconds in a week
	
			groupForElapsedTime: function(n, v) {
				var now = new Date(n.getFullYear(), n.getMonth(), n.getDate()),
					oneDayAgo = Ext.Date.add(now, Ext.Date.DAY, -1),
					twoDaysAgo = Ext.Date.add(now, Ext.Date.DAY, -2),
					oneWeekAgo = Ext.Date.add(now, Ext.Date.DAY, -1 * 7),
					twoWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -2 * 7),
					threeWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -3 * 7),
					//fourWeeksAgo = Ext.Date.add(now, Ext.Date.DAY, -4 * 7),
					oneMonthAgo = Ext.Date.add(now, Ext.Date.MONTH, -1),
					twoMonthsAgo = Ext.Date.add(now, Ext.Date.MONTH, -2),
					oneYearAgo = Ext.Date.add(now, Ext.Date.YEAR, -1),
					weekday, nextWeekday;
	
	
				function between(date, start, end) {
					var t = date.getTime();
					return start.getTime() < t && t <= end.getTime();
				}
	
	
				v = new Date(v.getFullYear(), v.getMonth(), v.getDate());
	
				//We take inspiration from outlook here.  Despite being a terrible piece of
				//software it actually does this well.	Today, Yesterday, Wed, tue, ..., Last week,
				//two weeks ago, three weeks ago, last month, this year, last year
	
				if (between(v, oneDayAgo, now)) { return now; }//Today
	
				if (between(v, twoDaysAgo, oneDayAgo)) { return oneDayAgo; }//Yesterday
	
				if (between(v, oneWeekAgo, twoDaysAgo)) {
					nextWeekday = twoDaysAgo;
	
					do {
						weekday = nextWeekday;
						nextWeekday = Ext.Date.add(weekday, Ext.Date.DAY, -1);
						if (between(v, nextWeekday, weekday)) {
							return weekday;
						}
					} while (weekday > oneWeekAgo);
	
				}
	
				if (between(v, twoWeeksAgo, oneWeekAgo)) { return oneWeekAgo; }//Last Week
	
				if (between(v, threeWeeksAgo, twoWeeksAgo)) { return twoWeeksAgo; }// Two Weeks ago
	
				if (between(v, oneMonthAgo, threeWeeksAgo)) { return threeWeeksAgo; }// Three Weeks ago
	
				if (between(v, twoMonthsAgo, oneMonthAgo)) { return oneMonthAgo; }// Last Month
	
				if (between(v, oneYearAgo, twoMonthsAgo)) { return oneYearAgo; }// This Year
	
				return new Date(0); //Older
			},
	
			groupTitle: function(groupValue, defaultValue, forceNow) {
				var d = (forceNow || new Date()).setHours(0, 0, 0, 0), c, now = new Date(d),
					tollerance = 0.0099;
	
				function under(c, i) {
					var d = (i - c);
					d = d > 0 && d < tollerance;//account for DST shifts
					return c < i && !d;
				}
	
				if (!groupValue) {
					return defaultValue;
				}
	
				d = (d - groupValue.getTime()) / 1000;
	
				if (groupValue.getTime() === 0) { return 'Older'; }
	
				if (d <= 0) { return defaultValue; }//Today
	
				c = d / this.DAY;
				if (under(c, 2)) { return 'Yesterday'; }
				if (under(c, 7)) { return Ext.Date.format(groupValue, 'l'); }//Sunday, Monday, Tuesday, etc...
	
				c = d / this.WEEK;
	
				if (under(c, 2)) { return 'Last week'; }
				if (under(c, 3)) { return '2 weeks ago'; }
				if (under(c, 4)) { return '3 weeks ago'; }
	
				if (groupValue < Ext.Date.add(now, Ext.Date.MONTH, -2)) { return 'This year'; }
	
				return 'Last month';
			},
	
			convert: function(r, o) {
				if (!r && this.mapping) { r = o.get(this.mapping); }
	
				var now = new Date(),
					v = Ext.isDate(r) ? r : new Date(r * 1000);
				return this.type.groupForElapsedTime(now, v);
			}
		};
	});


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var ParseUtils = __webpack_require__(3);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.Items', {
	    override: 'Ext.data.Types',
	
	    /* converters for models which reference other models*/
		SINGLEITEM: {
			type: 'singleItem',
			convert: function(v, r) {
				if (v instanceof Object) {
					v = !v ? null : ParseUtils.parseItems([v])[0];
					if (v) {
						v.stores.push(r);//make store updates bubble up to this owner record.
					}
					return v;
				}
	
				if (v) { console.warn('unexpected value', v); }
				return null;
			},
			sortType: 'none'
		},
	
	    ARRAYITEM: {
			type: 'arrayItem',
			convert: function(v, r) {
				var result = null;
				if (Ext.isArray(v)) {
					result = ParseUtils.parseItems(v);
					if (this.limit !== undefined && result.length > this.limit) {
						console.warn('Limiting set of items to the (' + this.name + ') field\'s configured limit of: ' + this.limit + ', was: ' + result.length);
						result = result.slice(0, this.limit);
						result.forEach(function(a) {if (a) {a.stores.push(r);}});
					}
					return result;
				}
	
				if (v) { console.warn('unexpected value', v); }
				return null;
			},
			sortType: 'none'
		},
	
	    COLLECTIONITEM: {
			type: 'collectionItem',
			convert: function(v, r) {
				var values = [], keys = {}, key, result;
				if (v instanceof Object) {
					for (key in v) {
						if (v.hasOwnProperty(key) && v[key] instanceof Object) {
							keys[key] = values.length;
							values.push(v[key]);
							if (this.limit !== undefined && values.length > this.limit) {
								console.warn('Limiting set of items to the (' + this.name + ') field\'s configured limit of: ' + this.limit + ', was: ' + result.length);
								values.pop();
								delete keys[key];
								break;
							}
						}
					}
					result = ParseUtils.parseItems(values);
					result.forEach(function(a) {if (a) {a.stores.push(r);}});
					result.INDEX_KEYMAP = keys;
					return result;
				}
	
				if (v) { console.warn('unexpected value', v); }
				return null;
	
			},
			sortType: 'none'
		}
	}, function() {
		function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }
	
		set(this.SINGLEITEM);
		set(this.ARRAYITEM);
		set(this.COLLECTIONITEM);
	});


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.Links', {
	    override: 'Ext.data.Types',
	
	    LINKS: {
			type: 'links',
			sortType: null,
	
			convert: function(v) {
				if (v && v.getRelHref) {
					//This happens if you set the links field on one record from another.
					//e.g. calling rec1.copyFields(rec2, 'Links')
					return v;
				}
				return {
					links: v,
					asJSON: function() {return v;},
					getRelHref: function(rel, raw) {
						var c = this.getRelLink(rel);
	
						if (c) {
							c = c.href;
	
							if (c && c.split && !raw) {
								c = c.split('#');
								if (c.length > 1) {
									console.warn('There was a fragment in a rel link! rel:' + rel + ' = ', c);
								}
								c = c[0];
							} else if (raw) {
								console.warn('Returning rel link raw: ', rel, c);
							}
						}
	
						return c;
					},
					getRelLink: function(rel) {
						var i, c = this.links, len = c.length;
	
						try {
							for (i = len - 1; i >= 0; i--) {
								if (c[i].rel == rel) {
									return c[i];
								}
							}
						} catch (e) {
							console.warn('bad Links value: "', c, '" it is a ', typeof(c));
						}
	
						return null;
					},
					hasLink: function(rel) {
						return !Ext.isEmpty(this.getRelHref(rel));
					}
				};
			}
		}
	},function() {
		this.LINKS.sortType = Ext.data.SortTypes.none;
	});
	


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var ObjectUtils = __webpack_require__(4);
	var UtilObject = __webpack_require__(4);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.Synthetic', {
	    SYNTHETIC: {
			type: 'Synthetic',
			persist: false,
	
			convert: function(v, record) {
				var dataName = record.persistenceProperty,
					data = record[dataName],
					config = {},
					fn = this.fn,
					sn = this.fnSet,
					sfn = function(v) { return sn.call(record, record, v); };
	
				config[this.name] = {
					getter: function() { return fn.call(record, record);},
					setter: sn && sfn,
					configurable: true
				};
	
				delete data[this.name];
				ObjectUtils.defineAttributes(data, config);
			}
		}
	},function() {
		Ext.data.Types.SYNTHETIC = this.prototype.SYNTHETIC;
	});


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.Users', {
	    override: 'Ext.data.Types',
	
	    USERLIST: {
			type: 'UserList',
			convert: function(v, record) {
				var a = arguments,
					u = [];
				try {
					if (v) {
						Ext.each(v, function(o) {
							var p = typeof o === 'string' ? o : ((o.get && o.get('Username')) || o.Username);
							if (!p) {
								console.warn('WARNING: Could not handle Object: ', o, a);
							}
							else {
								u.push(p);
							}
						});
					}
				}
				catch (e) {
					console.error('USERLIST: Parsing Error: ', e.message, e.stack);
					u = v;
				}
	
				return u;
			},
			sortType: 'none'
		},
	
	    AVATARURL: {
			type: 'AvatarURL',
			sortType: 'asUCString',
			convert: function convert(v, rec) {
				var re = convert.re = (convert.re || /https/i), url,
					needsSecure = re.test(location.protocol) || $AppConfig.server.forceSSL;
	
				function secure(v, i, a) {
					if (!v) {
						return v;
					}
	
					v = v.replace('www.gravatar.com', 'secure.gravatar.com').replace('http:', 'https:');
	
					if (a) {
						a[i] = v;
					}
	
					return v;
				}
	
				function maybeSecure(v, i, a) {
	
					if (needsSecure) {
						v = secure(v, i, a);
					}
	
					// //preload
					// (new Image()).src = v;
					return v;
				}
	
				if (v && v === '@@avatar') {
					url = Globals.trimRoute($AppConfig.server.data).split('/');
	
					url.push('users', rec.get('Username'), '@@avatar');
					return url.join('/');
				}
	
				if (!v) {
					return null;
				}
	
				if (!Array.isArray(v)) {
					v = maybeSecure(v);
				} else {
					Ext.each(v, maybeSecure);
				}
	
				return v;
			}
		},
	
	    AVATARURLLIST: {
			type: 'AvatarURLList',
			sortType: 'asUCString',
			convert: function convert(v, rec) {
				Ext.each(v, function(o, i, a) {
					a[i] = Ext.data.Types.AVATARURL.convert(o, rec);
				});
				return v;
			}
		}
	},function() {
		function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }
	
		set(this.USERLIST);
		set(this.AVATARURL);
		set(this.AVATARURLLIST);
	});


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var ResolversVideoPosters = __webpack_require__(29);
	
	
	module.exports = exports = Ext.define('NextThought.model.converters.VideoSources', {
	    override: 'Ext.data.Types',
	
	    VIDEOSOURCES: {
			type: 'VideoSource',
			sortType: null,
	
			convert: function(v) {
				var i = v.length - 1, x,
					o, sources, types,
					newSource = [];
	
				for (i; i >= 0; i--) {
					o = v[i];
	
					if (o && o.service === 'html5') {
	
						sources = o.source;
						types = o.type;
						delete o.type;
	
						//has this already been converted?
						if (sources && sources[0] && Ext.isObject(sources[0])) {
							continue;
						}
	
						if (!types && sources && sources.length === 1) {
							o.source = [{source: sources[0]}];
							continue;
						}
	
						if (!sources || !types || sources.length !== types.length) {
							console.error('Bad Video Source!', Ext.clone(v));
							delete v[i];
							continue;
						}
	
						x = sources.length - 1;
						for (x; x >= 0; x--) {
							newSource[x] = {
								source: sources[x],
								type: types[x]
							};
						}
	
						o.source = newSource;
					}
				}
	
				//console.debug('Video Sources:',v);
				return v;
			}
		},
	
	    VIDEOPOSTER: {
			type: 'VideoPoster',
			sortType: null,
			convert: function(v, r, source) {
				var name = this.mapping || this.name, len, x, s,
					raw = r && r.raw,
					resolver = NextThought.model.resolvers.VideoPosters;
	
				if (v && Ext.isString(v)) {//if we already have a value, done.
					return v;
				}
	
				if (raw && raw.sources && !source) {//no value, try to find it on the sources (not in recursive state)
					len = raw.sources.length || 0;
					for (x = 0; !v && x < len; x++) {
						s = raw.sources[x] || {};
						v = this.convert(s[name], r, s);
					}
				}
	
				if (!v && source) { //still didn't find it, and we are recusing on a source
					v = Ext.BLANK_IMAGE_URL;//stop iteration on caller and let the async resolver replace this value as soon as it resolves.
	
					resolver.resolveForSource(source)
							.then(function(data) {
								r.set(name, data[name]);
								if (name === 'poster') {
									wait(1).then(function() {
										r.fireEvent('resolved-poster', r);
									});
								}
							});
				} else {
					wait().then(r.fireEvent.bind(r, 'resolved-poster', r));
				}
	
				return v;
			}
		}
	},function() {
		this.VIDEOSOURCES.sortType = Ext.data.SortTypes.none;
		this.VIDEOPOSTER.sortType = Ext.data.SortTypes.none;
	});
	


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var VideoservicesVimeo = __webpack_require__(30);
	var VideoservicesYoutube = __webpack_require__(31);
	
	
	/*
		TODO: Does this need to be a model?
	 */
	module.exports = exports = Ext.define('NextThought.model.resolvers.VideoPosters', {
	    statics: {
			YOUTUBE: 'youtube',
			VIMEO: 'vimeo',
	
			getResolver: function(source) {
				var service = source.service,
					cls = Ext.ClassManager.getByAlias('resolvers.videoservices.' + service);
				if (!cls) {
					console.error('No resolver for source:', source);
					return;
				}
	
				return cls.create({source: source});
			},
	
			resolveForSource: function(source) {
				var resolver = this.getResolver(source);
	
				if (!resolver) {
					return Promise.reject('No resolver');
				}
	
				return resolver.resolve();
			},
	
	
			resolvePoster: function(type, id) {
				var resolve;
	
				if (type === this.YOUTUBE) {
					resolve = NextThought.model.resolvers.videoservices.Youtube.resolvePosterForID(id);
				} else if (type === this.VIMEO) {
					resolve = NextThought.model.resolvers.videoservices.Vimeo.resolvePosterForID(id);
				} else {
					resolve = Promise.reject('Unknown video type: ', type, id);
				}
	
				return resolve;
			}
	
		}
	});


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	
	
	module.exports = exports = Ext.define('NextThought.model.resolvers.videoservices.Vimeo', {
		alias: 'resolvers.videoservices.vimeo',
	
		statics: {
			TYPE: 'vimeo',
	
			RESOLVED: {},
	
			//URL: '//vimeo.com/api/v2/video/{0}.json',
			URL: '//vimeo.com/api/oembed.json?url=http%3A//vimeo.com/{0}',
	
			resolvePosterForID: function(id) {
				var cache = this.RESOLVED, url, promise;
	
				if (cache[id]) {
					return cache[id];
				}
	
				url = Ext.String.format(this.URL, id);
	
				promise = Service.request({url: url, withCredentials: false})
					.then(Ext.decode)
					.then(function(o) { return o[0] || o;})
					.then(function(json) {
						json.poster = json.thumbnail_large || json.thumbnail_url;
						json.thumbnail = json.thumbnail_medium || json.thumbnail_url;
	
						return json;
					})
					.fail(function(reason) {
						console.log('Unable to resolve vimeo poster: ', reason);
						return {
							poster: Globals.CANVAS_BROKEN_IMAGE.src,
							thumbnail: Globals.CANVAS_BROKEN_IMAGE.src
						};
					});
	
				cache[id] = promise;
	
				return promise;
			},
	
	
			EMBED_URL: 'https://www.vimeo.com/{0}',
	
			getEmbedURL: function(url) {
				var id = this.getIdFromURL(url);
	
				return Ext.String.format(this.EMBED_URL, id);
			},
	
	
			ID_REGEX: /(?:https?:)?\/\/(?:(www|player)\.)?vimeo.com\/(?:(channels|video)\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/,
	
			//http://stackoverflow.com/questions/13286785/get-video-id-from-vimeo-url
			getIdFromURL: function(url) {
				var match = url.match(this.ID_REGEX);
	
				if (match && match[5]) {
					return match[5];
				}
	
				return null;
			},
	
			URL_MATCHES: /vimeo/,
	
			urlIsFor: function(url) {
				return this.URL_MATCHES.test(url);
			}
		},
	
	
		constructor: function(data) {
			var source = data.source;
			this.callParent(arguments);
	
			if (source.service !== 'vimeo') {
				Ext.Error.raise('Source Service Missmatch');
			}
	
			this.videoId = source.source[0];
	
			// //Vimeo sources only will have one 'source'.
			// this.source = Ext.String.format(this.URL, source.source[0]);
		},
	
	
		resolve: function() {
			return this.self.resolvePosterForID(this.videoId);
		}
	});


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.model.resolvers.videoservices.Youtube', {
		statics: {
			TYPE: 'youtube',
	
			//http://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
			POSTER_URL: '//img.youtube.com/vi/{0}/0.jpg',
	
			resolvePosterForID: function(id) {
				return Promise.resolve(Ext.String.format(this.POSTER_URL, id));
			},
	
			EMBED_URL: '//www.youtube.com/embed/{0}',
	
			getEmbedURL: function(url) {
				var id = this.getIdFromURL(url);
	
				return Ext.String.format(this.EMBED_URL, id);
			},
	
			//http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
			getIdFromURL: function(url) {
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/,
					match = url.match(regExp);
	
				if (match && match[2].length === 11) {
					return match[2];
				}
				return null;
			},
	
			URL_MATCHES: /youtu\.?be/,
	
			urlIsFor: function(url) {
				return this.URL_MATCHES.test(url);
			}
		}
	});


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var MixinsDelegation = __webpack_require__(16);
	var UtilPromise = __webpack_require__(71);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.Component', {
	    override: 'Ext.Component',
	
	    constructor: function() {
			var me = this;
	
			me.shadow = false;
	
			me.onceRendered = new Promise(function(fulfill) {
				me.afterRender = Ext.Function.createSequence(me.afterRender, fulfill);
			}.bind(me));
	
			me.callParent(arguments);
			me.initDelegation();
			me.setNTTooltip();
	
	
			me.on('afterrender', function() {
				var maybeFireVisibilityChange = Ext.Function.createBuffered(this.maybeFireVisibilityChange, 100, this);
	
				function monitorCardChange(cmp, me) {
					var next = cmp.up('{isOwnerLayout("card")}'),
						c = cmp.isOwnerLayout('card') ? cmp : next;
	
					me = me || cmp;
	
					if (c) {
						me.mon(c, {
							//beforeactivate: '',
							//beforedeactivate: '',
							activate: maybeFireVisibilityChange,
							deactivate: maybeFireVisibilityChange,
							scope: me
						});
	
						if (next) {
							monitorCardChange(next, me);
						}
					}
				}
	
				monitorCardChange(me);
			});
		},
	
	    maybeFireVisibilityChange: function() {
			var v = this.isVisible(true);
			if (v !== this.___visibility) {
				this.fireEvent('visibility-changed-' + (v ? 'visible' : 'hidden'), this);
				this.fireEvent('visibility-changed', v, this);
			}
			this.___visibility = v;
		},
	
	    setNTTooltip: function() {
			if (!this.rendered) {
				this.on('afterrender', 'setNTTooltip', this, {single: true});
				return;
			}
	
			if (this.tooltip) {
				if (!Ext.isObject(this.tooltip) && Ext.QuickTips) {
					Ext.QuickTips.register({
						target: this.getEl().id,
						text: this.tooltip
					});
				}
				this.el.set({title: undefined});
			}
		},
	
	    rtlSetLocalX: function(x) {
			var style = this.el.dom.style;
			style.left = 'auto';
			style.right = (x === null) ? 'auto' : x + 'px';
		},
	
	    isOwnerLayout: function(type) {
			var o = this.ownerLayout;
			return o && o.type === type;
		},
	
	    isLayout: function(type) {
			var o = this.layout;
			return o && o.type === type;
		}
	},function() {
		Ext.Component.mixin('delegation', NextThought.mixins.Delegation);
	});


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.EventManager', function() {
	
		var EM = Ext.EventManager,
			normalizeEventExt = EM.normalizeEvent;
	
		function makeSafe(fn) {
			return function() {
				try {
					return fn.apply(this, arguments);
				} catch (e) {
					console.warn(e.stack || e.message || e);
					return null;
				}
			};
		}
	
		Ext.apply(EM, {
			xnormalizeEvent: function(eventName, fn) {
				if (arguments.length > 2) {
					console.error('i didnt account for this');
				}
				var nomEventName = eventName;
				if (eventName === 'animationend') {
					nomEventName = Ext.supports.CSS3TransitionEnd.replace(/transitionend/, eventName);
					console.debug('listinging on animationEnd', eventName);
				}
	
				return normalizeEventExt.call(this, [nomEventName, fn]);
			},
	
			getEventCache: makeSafe(EM.getEventCache),
			getEventListenerCache: makeSafe(EM.getEventListenerCache),
			handleSingleEvent: makeSafe(EM.handleSingleEvent)
		});
	
		return {};
	});


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.Ext', {
		override: 'Ext',
	
	
		/**
		 * This will apply `cfg` to `o` recursively.  This is handy for situations like adding a username to all the
		 * component configs in your component's item array prior to them becoming instantiated by initComponent.
		 *
		 * @param {Object} o The object or array to apply to.
		 * @param {Object} cfg The values to apply to the object in the first arg.
		 * @return {*}
		 */
		applyRecursively: function applyRecursively(o, cfg) {
			if (!o) {return o;}
	
			if (Ext.isArray(o)) {
				Ext.each(o, function(v, i, a) { a[i] = applyRecursively(v, cfg); });
			}
			else if (Ext.isObject(o)) {
				Ext.Object.each(o, function(k, v) { o[k] = applyRecursively(v, cfg); });
				o = Ext.apply(o, cfg);
			}
	
			return o;
		}
	
	
	},function() {
	
		Ext.isIE11p = !Ext.isIE && /Trident/i.test(navigator.userAgent);
		Ext.isGecko = Ext.isGecko && !Ext.isIE11p;
	
	
		var EC = Ext.cache,
			removeAllEvents = Ext.EventManager.removeAll,
			Element = Ext.dom.Element,
			get = Ext.getElementById;
	
		/**
		 *  This is not to be confused with document.getElementById.  Ext has a periodic task that checks that cached
		 *  elements are still present, and if not cleans their registered event listeners and destroys the associated cache
		 *  entries.
		 *
		 *  This is all fine and desired. However, their implementation does not account for nodes accross iframe boundries.
		 *
		 *  This patch is intended to make the garbage collector see the objects in various iframes as well as the host
		 *  document.
		 *
		 *  Caveat:
		 *
		 *  This function on the Ext object is only used in two places in the entire Ext framework. 1) to determine a node's
		 *  existence for the "garbage collector" task, and 2) the "string" fallback branch of Ext.getDom().  It is very
		 *  unlikely this change will offend any existing code, nor future code. (getDom is predominately used to normalize
		 *  an input from either Ext.dom.Element or a Node and allow you to assume you are working with a raw Node)
		 *
		 *
		 *  An alternative is to reimplement their (Ext's) garbage collector function and make it inspect the node's
		 *  ownerDocument.
		 *
		 *  Notes on reimplementing Ext's GC:
		 *
		 *  clear the interval: Ext.Element.collectorThreadId
		 *  Copy function garbageCollect() from ext/src/dom/Element.js as a starting point, then restart the 30second interval.
		 */
		Ext.getElementById = function(id) {
			var el = get.apply(this, arguments);
	
			function testFrame(frame) {
				var win = frame.contentWindow || window.frames[frame.name],
					src;
				try {
					src = Globals.HOST_PREFIX_PATTERN.exec(frame.getAttribute('src'));
					if (src && (src[3] === document.domain || src[1] === 'javascript')) {
						el = win.document.getElementById(id) || false;
					}
				//for iframes where we cannot access its content(Cross Origin Content) ignore.
				} catch (e) { swallow(e); }
				return !el;
			}
	
			if (!el) {
				Ext.each(document.getElementsByTagName('iframe'), testFrame);
			}
	
			return el;
		};
	
		Ext.EventManager.removeAll = function() {
			try {
				removeAllEvents.apply(this, arguments);
			} catch (e) {
				console.warn(e.stack || e.message || e);
			}
		};
	
		//do our own GC... (mostly copied verbatim, added lint fixes and try/catch)
		function garbageCollect() {
			if (!Ext.enableGarbageCollector) {
				clearInterval(Element.collectorThreadId);
			} else {
				var eid,
					d,
					o,
					t, clean;
	
				for (eid in EC) {
					if (EC.hasOwnProperty(eid)) {
						clean = false;
						o = EC[eid];
	
						// Skip document and window elements
						if (o.skipGarbageCollection) {
							continue;
						}
	
						d = o.dom;
	
						try {
							clean = !d || (!d.parentNode || (!d.offsetParent && !Ext.getElementById(eid)));
							if (d.id !== eid) {
								//this is just an access check, if d.id throws an access denied, clean it out.
								//This should never happen...so don't put anything really long here.
								swallow();
							}
						} catch (e) {
							clean = true;
						}
	
						if (clean) {
							if (Ext.enableListenerCollection) {
								Ext.EventManager.removeAll(eid);
							}
							delete EC[eid];
						}
					}
				}
				// Cleanup IE Object leaks
				if (Ext.isIE) {
					t = {};
					for (eid in EC) {
						if (EC.hasOwnProperty(eid)) {
							t[eid] = EC[eid];
						}
					}
					EC = Ext.cache = t;
				}
			}
		}
	
		function takeOverGC() {
			if (!Element.collectorThreadId) {
				setTimeout(takeOverGC, 1000);
				return;
			}
	
			clearInterval(Element.collectorThreadId);//stop Ext's Garbage collector...
			//then do our own...
			Element.collectorThreadId = setInterval(garbageCollect, 30000);
		}
	
		takeOverGC();
	});


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.JSON', {
		override: 'Ext.JSON',
		encodeDate: function(d) {
			var t = d.getTime();
			return t / 1000;
			//return Ext.Date.format(d, 'U');
		}
	});


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var UtilGlobals = __webpack_require__(2);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.XTemplate', {
	  override: 'Ext.XTemplate'
	});
	
	Ext.override(Ext.XTemplateCompiler, {
	
	  myStringsRe: /\{{3}((?!\{\{\{|\}\}\}).+?\}?)\}{3}/g,
	
		myReplacementFn: (function() {
			//cache the regex and function so its not creating them on the fly each time
			var escapRe = /(\{|\})/gm;
	
			function escapeFn(n, c) { return '&#' + c.charCodeAt(0) + ';'; }
	
			return function(m, key) {
				var def = {},
					s = getString(key, def);
				//Its written like this to prevent executing throwaway work.
				// Only calculate the escaped key if the default token is returend.
				return s !== def ? s : m.replace(escapRe, escapeFn);
	    };
		}()),
	
		parse: function(str) {
	    var t = this.myStringsRe.exec(str);
	    if (t) {
	      str = str.replace(this.myStringsRe, this.myReplacementFn);
	    }
	    return this.callParent([str]);
	  }
	
	});


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.app.Application', {
		override: 'Ext.app.Application',
	
		init: function() {
			this.callParent(arguments);
	
			NextThought.finishedLoading = new Deferred();
		},
	
	
		registerInitializeTask: function(task) {
			var method = this.registerInitializeTask.caller;
			method = method.$previous || (method.$owner ? method : method.caller);
			method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;
	
			if (!task) {
				console.error(method + ' called registerInitializeTask without a token');
				return;
			}
	
	
			task.method = method = task.method || method;
			task.start = new Date();
	
			this.initTasks = this.initTasks || [];
	
			this.initTasks.push(task);
			task.timerId = setTimeout(function() {
				console.debug('Abandoned init task from: ' + method, task.name || task);
				Globals.removeLoaderSplash();
				task.expired = true;
				alert({
					icon: Ext.Msg.ERROR,
					title: 'Timeout',
					msg: 'There was some issue preventing us from starting.',
					closable: false,
					buttons: null
				});
			},task.timeout || 30000);
		},
	
		finishInitializeTask: function(task) {
			var method = this.finishInitializeTask.caller;
			method = method.$previous || (method.$owner ? method : method.caller);
			method = method.$owner ? (method.$owner.$className + '.' + method.$name) : method.name;
	
			if (!task) {
				console.error(method + ' called finishInitializeTask without a token');
				return;
			}
			if (task.expired) {
				Ext.MessageBox.close();
				console.debug('Recovering init task: ' + method + '... took: ' + ((new Date() - task.start) / 1000) + 's');
	
			}
			clearTimeout(task.timerId);
			Ext.Array.remove(this.initTasks, task);
			if (!this.initTasks.length) {
				this.registerInitializeTask = this.finishInitializeTask = Ext.emptyFn;
				wait(100).then(function() {
					NextThought.finishedLoading.fulfill();
				});
				this.fireEvent('finished-loading');
			}
		}
	});


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.app.Controller', {
		override: 'Ext.app.Controller',
	
		callOnAllControllersWith: function(functionName) {
			var ret,
				args = Array.prototype.slice.call(arguments, 1),
				app = this.getApplication();
	
			app.controllers.each(function(ctlr) {
				if (Ext.isFunction(ctlr[functionName])) {
					ret = ctlr[functionName].apply(ctlr, args);
					return !ret;
				}
			});
	
			return ret;
		},
	
	
		/**
		 * Much like the above function, this executes a command on each controller that implements it. Expecting
		 * the value returned by each to be a promise or a value.  When all performances are done, the pool promise
		 * will resolve or reject.
		 *
		 * @param {String} functionName
		 * @param {...} var_args Arguments to pass to the functionName
		 * @return {Promise}
		 */
		performAnd: function(functionName, var_args) {
			var app = this.getApplication(),
				args = Array.prototype.slice.call(arguments, 1);
	
			function perform(ctlr) {
				var f = ctlr[functionName];
				return (f && typeof f.apply === 'function' && f.apply(ctlr, args)) || undefined;
				//the return value should be a promise to pool on. but if not, the all() function
				// will wrap the value into a promise to meet the interface.
			}
	
			return Promise.all(app.controllers.items
					.map(perform) //make a new array of promises/values
					.filter(Ext.identityFn)); //filter out falsy entries and pass that to the all()
		}
	});


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Array', {});
	
	(function() {
	
		/** @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
		 *
		 * @param callback
		 * @param [initialValue]
		 * @return {*}
		 */
		function reduce(callback, initialValue) {
			'use strict';
			if (null === this || 'undefined' === typeof this) {
				// At the moment all modern browsers, that support strict mode, have
				// native implementation of Array.prototype.reduce. For instance, IE8
				// does not support strict mode, so this check is actually useless.
				throw new TypeError(
						'Array.prototype.reduce called on null or undefined');
			}
			if ('function' !== typeof callback) {
				throw new TypeError(callback + ' is not a function');
			}
			var index = 0, length = this.length >>> 0, value, isValueSet = false;
			if (1 < arguments.length) {
				value = initialValue;
				isValueSet = true;
			}
			for (length; length > index; ++index) {
				if (!this.hasOwnProperty(index)) { continue; }
				if (isValueSet) {
					value = callback(value, this[index], index, this);
				} else {
					value = this[index];
					isValueSet = true;
				}
			}
			if (!isValueSet) {
				throw new TypeError('Reduce of empty array with no initial value');
			}
			return value;
		}
	
	
		 function chunk(chunkSize) {
		    var r = [], i = 0, len = this.length;
		    for (i; i < len; i += chunkSize) {
		        r.push(this.slice(i, i + chunkSize));
			}
		    return r;
		}
	
	
		(function(o, a) {
			Ext.Object.each(a, function(k, v) {
				if (!o[k]) {
					o[k] = v;
					if (Object.defineProperty) {
						Object.defineProperty(o, k, {enumerable: false});
					}
				}
			});
		}(Array.prototype, {
			first: function first() { return this[0]; },
			last: function last() { return this[this.length - 1]; },
			peek: function peek() { return this[this.length - 1]; },
			reduce: reduce,
			chunk: chunk
		}));
	
	}());


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Console', function() {
	
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
					console[fns[l]] = Ext.emptyFn;//getReporter(fns[l]);
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
	
		try {
			console.getCollected = function() {
				try {
					return log;
				}
				finally {
					log = [];
				}
			};
	
			console.enable = enableLogging;
			console.disable = disableLogging;
	
			if (!$AppConfig.enableLogging) {
				console.disable();
			}
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	
		return {};
	});


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	/**
	 * Add dataset support to elements
	 * No globals, no overriding prototype with non-standard methods,
	 *   handles CamelCase properly, attempts to use standard
	 *   Object.defineProperty() (and Function bind()) methods,
	 *   falls back to native implementation when existing
	 * Inspired by http://code.eligrey.com/html5/dataset/
	 *   (via https://github.com/adalgiso/html5-dataset/blob/master/html5-dataset.js )
	 * Depends on Function.bind and Object.defineProperty/Object.getOwnPropertyDescriptor (shims below)
	 * Licensed under the X11/MIT License
	 */
	if (!Function.prototype.bind) {
		// Inspired by https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
		Function.prototype.bind = function(oThis) {
			'use strict';
			if (typeof this !== 'function') {
				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
			}
	
			var aArgs = Array.prototype.slice.call(arguments, 1),
				fToBind = this;
	
			function FNOP() {}
			function Bound() {
				return fToBind.apply(
								this instanceof FNOP && oThis ? this : oThis,
						aArgs.concat(Array.prototype.slice.call(arguments))
				);
			}
	
			FNOP.prototype = this.prototype;
			Bound.prototype = new FNOP();
	
			return Bound;
		};
	}
	
	/*
	 * Xccessors Standard: Cross-browser ECMAScript 5 accessors
	 * http://purl.eligrey.com/github/Xccessors
	 *
	 * 2010-06-21
	 *
	 * By Eli Grey, http://eligrey.com
	 *
	 * A shim that partially implements Object.defineProperty,
	 * Object.getOwnPropertyDescriptor, and Object.defineProperties in browsers that have
	 * legacy __(define|lookup)[GS]etter__ support.
	 *
	 * Licensed under the X11/MIT License
	 *   See LICENSE.md
	*/
	
	/*! @source http://purl.eligrey.com/github/Xccessors/blob/master/xccessors-standard.js*/
	(function() {
		'use strict';
		var ObjectProto = Object.prototype,
				defineGetter = ObjectProto.__defineGetter__,
				defineSetter = ObjectProto.__defineSetter__,
				lookupGetter = ObjectProto.__lookupGetter__,
				lookupSetter = ObjectProto.__lookupSetter__,
				hasOwnProp = ObjectProto.hasOwnProperty;
	
		if (defineGetter && defineSetter && lookupGetter && lookupSetter) {
	
			if (!Object.defineProperty) {
				Object.defineProperty = function(obj, prop, descriptor) {
					if (arguments.length < 3) { // all arguments required
						throw new TypeError('Arguments not optional');
					}
	
					prop += ''; // convert prop to string
	
					if (hasOwnProp.call(descriptor, 'value')) {
						if (!lookupGetter.call(obj, prop) && !lookupSetter.call(obj, prop)) {
							// data property defined and no pre-existing accessors
							obj[prop] = descriptor.value;
						}
	
						if ((hasOwnProp.call(descriptor, 'get') ||
							 hasOwnProp.call(descriptor, 'set')))
						{
							// descriptor has a value prop but accessor already exists
							throw new TypeError('Cannot specify an accessor and a value');
						}
					}
	
					// can't switch off these features in ECMAScript 3
					// so throw a TypeError if any are false
					if (!(descriptor.writable && descriptor.enumerable &&
						  descriptor.configurable))
					{
						throw new TypeError(
										'This implementation of Object.defineProperty does not support' +
										' false for configurable, enumerable, or writable.'
						);
					}
	
					if (descriptor.get) {
						defineGetter.call(obj, prop, descriptor.get);
					}
					if (descriptor.set) {
						defineSetter.call(obj, prop, descriptor.set);
					}
	
					return obj;
				};
			}
	
			if (!Object.getOwnPropertyDescriptor) {
				Object.getOwnPropertyDescriptor = function(obj, prop) {
					if (arguments.length < 2) { // all arguments required
						throw new TypeError('Arguments not optional.');
					}
	
					prop += ''; // convert prop to string
	
					var descriptor = {
								configurable: true,
								enumerable: true,
								writable: true
							},
							getter = lookupGetter.call(obj, prop),
							setter = lookupSetter.call(obj, prop);
	
					if (!hasOwnProp.call(obj, prop)) {
						// property doesn't exist or is inherited
						return descriptor;
					}
					if (!getter && !setter) { // not an accessor so return prop
						descriptor.value = obj[prop];
						return descriptor;
					}
	
					// there is an accessor, remove descriptor.writable;
					// populate descriptor.get and descriptor.set (IE's behavior)
					delete descriptor.writable;
					descriptor.get = descriptor.set = undefined;
	
					if (getter) {
						descriptor.get = getter;
					}
					if (setter) {
						descriptor.set = setter;
					}
	
					return descriptor;
				};
			}
	
			if (!Object.defineProperties) {
				Object.defineProperties = function(obj, props) {
					var prop;
					for (prop in props) {
						if (props.hasOwnProperty(prop)) {
							Object.defineProperty(obj, prop, props[prop]);
						}
					}
				};
			}
		}
	}());
	
	// Begin dataset code
	if (!document.documentElement.dataset &&
		// FF is empty while IE gives empty object
		(!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset') ||
		 !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
			) {
		var propDescriptor = {
			enumerable: true,
			get: function() {
				'use strict';
				var i,
					that = this,
					HTML5_DOMStringMap = {},
					attrVal, attrName, propName,
					attribute,
					attributes = this.attributes,
					attsLength = attributes.length;
				function toUpperCase(n0) { return n0.charAt(1).toUpperCase(); }
				function getter() { return String(this); }
				function setter(attrName, value) {
					return (typeof value !== 'undefined') ?
						   this.setAttribute(attrName, value) : this.removeAttribute(attrName); }
	
				for (i = 0; i < attsLength; i++) {
					attribute = attributes[i];
					// Fix: This test really should allow any XML Name without
					//         colons (and non-uppercase for XHTML)
					if (attribute && attribute.name &&
						(/^data-\w[\w\-]*$/).test(attribute.name)) {
						attrVal = attribute.value;
						attrName = attribute.name;
						// Change to CamelCase
						propName = attrName.substr(5).replace(/-./g, toUpperCase);
						try {
							Object.defineProperty(HTML5_DOMStringMap, propName, {
								enumerable: true,
								get: getter.bind(attrVal || ''),
								set: setter.bind(that, attrName)
							});
						}
						catch (e2) { // if accessors are not working
							HTML5_DOMStringMap[propName] = attrVal;
						}
					}
				}
				return HTML5_DOMStringMap;
			}
		};
	
		Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
	}
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Element', {});


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Error', {});
	
	
	/**
	 * Raise an error on a new call stack to not interupt anything,
	 * but will get caught by our error reporter (and send us a email)
	 *
	 * @param {String|Object} msg - message {@see Ext.Error#raise}
	 */
	Error.raiseForReport = function(msg) {
	
		var stack = new Error(msg.message || msg.msg || msg).stack;
	
		setTimeout(function() {
			if (msg instanceof Error) {throw msg.stack || msg.message;}
			Ext.Error.raise(stack);
		},1);
	};
	


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Function', function() {
	
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
		if (!Function.prototype.bind) {
			Function.prototype.bind = function(oThis) {
				if (typeof this !== 'function') {
					// closest thing possible to the ECMAScript 5
					// internal IsCallable function
					throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
				}
	
				var aArgs = Array.prototype.slice.call(arguments, 1),
						fToBind = this,
						fNOP = function() {},
						fBound = function() {
							return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
									aArgs.concat(Array.prototype.slice.call(arguments)));
						};
	
				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();
	
				return fBound;
			};
		}
	
		return {};
	});


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Node', {});
		//Patch-in features that might be missing.
	(function() {
	
		var EP = Element.prototype;
	
		Ext.applyIf(EP, {
			matches: EP.matches || EP.webkitMatchesSelector || EP.mozMatchesSelector || EP.msMatchesSelector || EP.oMatchesSelector
		});
	
		//FireFox & Safari & IE (WTH!@#??) give a different instance of Element.protoyp in their
		// event targets so our above patch is not present for those instances! LAME!!
		Element.matches = function(el, selector) {
			var m = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
			return m.call(el, selector);
		};
	
		window.Node = window.Node || function() {};
		window.NodeFilter = window.NodeFilter || {};
	
		Ext.applyIf(NodeFilter, {
			SHOW_ELEMENT: 1,
			SHOW_COMMENT: 128
		});
	
	
		Ext.applyIf(Node.prototype, {
			DOCUMENT_POSITION_DISCONNECTED: 1,
			DOCUMENT_POSITION_PRECEDING: 2,
			DOCUMENT_POSITION_FOLLOWING: 4,
			DOCUMENT_POSITION_CONTAINS: 8,
			DOCUMENT_POSITION_CONTAINED_BY: 16,
			DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
			TEXT_NODE: 3,
	
	
			getChildren: function() {
				if (this.children) {
					return this.children;
				}
				var EA = Ext.Array;
				return EA.filter(
						EA.toArray(this.childNodes, 0, this.childNodes.length),
							function(i) {
								return i && i.nodeType !== Node.TEXT_NODE;
							});
			}
		});
	
	
		NodeList.prototype.toArray = function() {
			return Array.prototype.slice.call(this);
		};
	
	
		if (!('remove' in Element.prototype)) {
			Element.prototype.remove = function() {
				if (this.parentNode) {
					this.parentNode.removeChild(this);
				}
			};
		}
	
		if (!HTMLCanvasElement.prototype.toBlob) {
			Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		  		value: function(callback, type, quality) {
					var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
						len = binStr.length,
						arr = new Uint8Array(len);
	
					for (var i = 0; i < len; i++) {
						 arr[i] = binStr.charCodeAt(i);
					}
	
					callback(new Blob([arr], {type: type || 'image/png'}));
		  		}
		 	});
		}
	}());


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Number', {});
	
	(function() {
		Ext.applyIf(Number.prototype, {
			pad: function(size) {
				if (typeof size !== 'number') {size = 2;}
				var s = String(this);
				while (s.length < size) {s = '0' + s;}
				return s;
			},
			isFloatEqual: function(b, precision) {
				precision = precision || 2;
	
				var zero = 0,
					ep = parseFloat(zero.toFixed(precision) + '1'); //produces 0.001
	
				return Math.abs(this - b) < ep;
			},
			isFloatGreaterThanOrEqual: function(b, precision) {
				return this.isFloatEqual(b, precision) || this > b;
			},
			isFloatLessThanOrEqual: function(b, precision) {
				return this.isFloatEqual(b, precision) || this < b;
			}
		});
	}());


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.RegExp', {});
	(function() {
		Ext.applyIf(RegExp, {
			escape: function me(text) {
				if (!me.Re) {
					me.Re = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
				}
				return text.replace(me.Re, '\\$&');
			}
		});
	}());


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.String', function() {
	
		function hash(str) {
			var h = 0, i, c;
			if (Ext.isEmpty(str)) {
				return h;
			}
	
			for (i = 0; i < str.length; i++) {
				c = str.charCodeAt(i);
				h = ((h << 5) - h) + c;
				h = h & h; // Convert to 32bit integer
			}
			return h;
		}
	
		String.prototype.strcmp = function(s) {
		    if (this < s) { return -1; }
		    if (this > s) { return 1; }
		    return 0;
		};
	
		function hashMe() { return hash(this); }
	
		String.prototype.concatPath = function(str) {
			var result = this;
			//ensure the base path ends in a separator...
			if (result.charAt(result.length - 1) !== '/') {
				result += '/';
			}
	
			//ensure the postfix does not start with a separator...
			if (str && str.charAt(0) === '/') {
				str = str.substr(1);
			}
	
			//join...
			return result + str;
		};
	
		String.prototype.hash = hashMe;
		String.hash = hash;
	
		String.commonPrefix = function commonPrefix(words) {
			var maxWord = words.reduce(function max(a, b) { return a > b ? a : b; }),
				prefix = words.reduce(function min(a, b) { return a > b ? b : a; });
	
			while (maxWord.indexOf(prefix) !== 0) {
				prefix = prefix.slice(0, -1);
			}
	
			return prefix;
		};
	
		return {};
	});


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.builtins.Window', {});
	
	(function() {
		function getRequestAnimationFrame() {
			var names = [
					'webkitRequestAnimationFrame',
					'mozRequestAnimationFrame',
					'msRequestAnimationFrame'
				],
				request;
	
				request = names.reduce(function(acc, name) {
					return acc || window[name];
				}, null);
	
				if (!request) {
					request = function(callback) {
						return setTimeout(callback, 1000 / 60);
					};
				}
	
				return request;
		}
	
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = getRequestAnimationFrame;
		}
	}());


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.container.Viewport', {
		override: 'Ext.container.Viewport',
	
		setSize: function() {},
	
		onRender: function() {
			Ext.container.Container.prototype.onRender.apply(this, arguments);
		}
	});

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.data.Connection', {
	    override: 'Ext.data.Connection',
	    disableCaching: Ext.isGecko === true,
	    withCredentials: true,
	    useDefaultXhrHeader: true,
	
	    newRequest: function() {
			return this.getXhrInstance();
		},
	
	    setOptions: function(options, scope) {
			var i, badParams = ['id', 'page', 'start', 'limit', 'group', 'sort'],//'_dc'
				params = options.params || {};
	    if (Ext.isGecko) {
	      badParams.shift();
	    }
			if (Ext.isFunction(params)) {
				console.warn('Params were a function!');
				options.params = (params = params.call(scope, options));
			}
	
			for (i in badParams) {
				if (badParams.hasOwnProperty(i)) {
					delete params[badParams[i]];
				}
			}
	
			return this.callParent(arguments);
		},
	
	    //We define an error as 4xx or 5xx
		//i.e. 400 <= statusCode <=599
		isHTTPErrorCode: function(statusCode) {
			return 400 <= statusCode && statusCode <= 599;
		},
	
	    //Patch Ext's open request...if I explicitly say to not include credentials, don't.
		openRequest: function(options) {
			var xhr = this.callParent(arguments);
	
			if (options && options.withCredentials === false) {
				xhr.withCredentials = false;
			}
	
			return xhr;
		}
	},function() {
		Ext.Ajax.cors = true;
		Ext.Ajax.withCredentials = true;
	
		Ext.Ajax.disableCaching = Ext.isGecko === true;
		Ext.Ajax.useDefaultXhrHeader = true;
		Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
		Ext.Ajax.defaultHeaders.Accept = 'application/json';
		Ext.Ajax.on('beforerequest', function(connection, options) {
	
			if (Ext.Ajax.logRequests) {
				console.debug('Will perform ajax request with ', arguments);
			}
	
			if (options && options.async === false) {
				var loc = null;
				try { loc.toString(); }//force an error
				catch (e) {
					loc = e.stack;
					loc = loc.toString().split('\n').slice(6).join('\n');
	
				}
				console.warn('Synchronous Call in: \n' + loc, '\nOptions: ', options);
			}
		});
	
		//Setup a 401 handler to send us back to the login page. It's not clear
		//if the MEssageBox alert infrastructure is smart enough to present a bunch
		//of these getting popped up all at once, however, since clicking ok on any
		//of them changes the pages location that is probably ok for now
		Ext.Ajax.on('requestexception', function(conn, response, options) {
			function onConfirmed() {
				//TODO better way to send the user to the login page?
				location.reload();
			}
	
			if (response && response.status === 401) {
				//We only want to do this for our stuff.  TODO better way to check this
				var redirectIf401 = options && options.url && options.url.indexOf(getURL()) >= 0;
				if (redirectIf401) {
					onConfirmed();
				}
			}
		}, this);
	});


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.data.proxy.Server', {
		override: 'Ext.data.proxy.Server',
		noCache: Ext.isGecko === true
	});


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.dd.DragDropManager', {
		override: 'Ext.dd.DragDropManager',
	
	
		getLocation: function() {
			try {
				return this.callParent(arguments);
			} catch (e) {
				return null;
			}
		},
	
	
		__startDrag: function(x, y) {
			var me = this,
				current = me.dragCurrent,
				dragEl;
	
			clearTimeout(me.clickTimeout);
			if (current) {
				current.b4StartDrag(x, y);
				current.startDrag(x, y);
				dragEl = current.getDragEl();
	
				//if (dragEl) {
				// svg elements have no css classes -- http://www.sencha.com/forum/showthread.php?261339-lt-SVGAnimatedString-gt-has-no-method-replace
				if (dragEl && dragEl.dom && dragEl.dom.className.replace) {
					Ext.fly(dragEl).addCls(me.dragCls);
				}
			}
			me.dragThreshMet = true;
		}
	});
	
	//(function() {
	//	var v = Ext.versions.extjs;
	//	if (v.major !== 4 || v.minor !== 2) {
	//		console.warn('Base version of ExtJS not expected');
	//		return {};
	//	}
	//
	//	if (v.patch > 1) {
	//		console.warn('Is this override (startDrag) still needed??');
	//	}
	//}());


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var RectUtils = __webpack_require__(72);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.dom.Element', {
		override: 'Ext.dom.Element',
	  //	requires: ['NextThought.util.Rects'],
	
		constructor: function() {
			this.callParent(arguments);
	
			if (this.dom && this.dom.addEventListener) {
				this.on({
					scope: this,
					buffer: 200,
					scroll: this._scrollStopped
				});
			} else {
				console.warn('trying to register a listener for a element with out a dom node, it will not fire scrollstop');
			}
		},
	
	
		_scrollStopped: function(e) {
			var me = this,
				d = me.dom,
				c = Ext.EventManager.getEventListenerCache(d, 'scrollstop') || [];
	
			c.forEach(function(listener) {
				listener.wrap.call(c.scope || d, e);
			});
		},
	
	
		getScrollingEl: function() {
	
			var el = this, found = 0, max = 100, flow;
	
			do {
				el = el && el.parent();
				if (el) {
					flow = el.getStyle('overflow-y');
					if (flow !== 'hidden' && el.dom.scrollHeight > el.getHeight()) {
						found = max;
					}
				}
			}while (el && found < max);
	
			return el || this;
		},
	
		needsScrollIntoView: function(containerEl) {
			var container = Ext.getDom(containerEl) || Ext.getBody().dom,
				el = this.dom,
	            offsets = this.getOffsetsTo(container),
	
	            top = offsets[1] + container.scrollTop,
	            bottom = top + el.offsetHeight,
	
	            ctClientHeight = container.clientHeight,
	            ctTop = parseInt(container.scrollTop, 10),
	            ctBottom = ctTop + ctClientHeight;
	
	    return top > ctBottom || top < ctTop || bottom < ctTop || bottom > ctBottom;
		},
	
	
		scrollCompletelyIntoView: function(container, hscroll, animate) {
			var me = this,
	            dom = me.dom,
	            offsets = me.getOffsetsTo(container = Ext.getDom(container) || Ext.getBody().dom),
	        // el's box
	            left = offsets[0] + container.scrollLeft,
	            top = offsets[1] + container.scrollTop,
	            bottom = top + dom.offsetHeight,
	            right = left + dom.offsetWidth,
	        // ct's box
	            ctClientHeight = container.clientHeight,
	            ctScrollTop = parseInt(container.scrollTop, 10),
	            ctScrollLeft = parseInt(container.scrollLeft, 10),
	            ctBottom = ctScrollTop + ctClientHeight,
	            ctRight = ctScrollLeft + container.clientWidth,
	            newPos;
	
		    if (dom.offsetHeight > ctClientHeight || top < ctScrollTop) {
		      newPos = top - this.getHeight();
		    } else if (bottom > ctBottom) {
		      newPos = (bottom - ctClientHeight) + this.getHeight();
		    }
		    if (newPos !== null) {
		      me.scrollChildFly.attach(container).scrollTo('top', newPos, animate);
		    }
	
		    if (hscroll !== false) {
		      newPos = null;
		      if (dom.offsetWidth > container.clientWidth || left < ctScrollLeft) {
		        newPos = left;
		      } else if (right > ctRight) {
		        newPos = right - container.clientWidth;
		      }
		      if (newPos !== null) {
		        me.scrollChildFly.attach(container).scrollTo('left', newPos, animate);
		      }
		    }
		    return me;
		},
	
	
		/**
		 *
		 * @param {Node} el
		 * @param {Number} [bufferZone]
		 * @return {*}
		 */
		isOnScreenRelativeTo: function(el, bufferZone) {
			var myRect = Ext.getDom(this).getBoundingClientRect(),
				parentRect = Ext.getDom(el).getBoundingClientRect();
	
			return RectUtils.contains(parentRect, myRect, bufferZone);
		},
	
	
		getAttribute: function(attr, ns) {
			var v = this.callParent(arguments);
			return v || (attr === 'class' ? this.callParent(['className', ns]) : null);
		},
	
	
		getAndRemoveAttr: function(attr) {
			var r = this.dom.getAttribute(attr);
			this.dom.removeAttribute(attr);
			return r;
		},
	
	
		allowContextMenu: function() {
			this.on('contextmenu', function(e) {e.stopPropagation();});
			return this;
		}
	});


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.grid.Panel', {
		override: 'Ext.grid.Panel',
	
		ui: 'nti',
		plain: true,
		border: false,
		frame: false,
	
		sealedColumns: true,
		enableColumnHide: false,
		enableColumnMove: false,
		enableColumnResize: false,
		columnLines: false,
		rowLines: false,
	
		columnDefaults: {
			ui: 'nt',
			plain: true,
			border: false,
			frame: false,
			defaults: {
				ui: 'nt',
				border: false,
				sortable: true,
				menuDisabled: true
			}
		},
	
		initComponent: function() {
			var headerCtCfg = this.columns;
			if (Ext.isArray(headerCtCfg)) {
				headerCtCfg = {
					items: headerCtCfg
				};
			}
			this.columns = Ext.merge({}, this.columnDefaults, headerCtCfg);
	
			this.callParent(arguments);
		}
	});


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.grid.column.Column', {
		override: 'Ext.grid.column.Column',
	
		afterRender: function() {
			this.callParent(arguments);
			if (this.sortable) {
				this.addCls('sortable');
			}
		}
	});


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.grid.plugin.BufferedRenderer', {
		override: 'Ext.grid.plugin.BufferedRenderer',
	
		/*onViewRefresh: function() {
			console.debug('BufferedRenderer: View Refresh?', arguments);
			if (this.grid && this.grid.isVisible(true)) {
				this.callParent(arguments);
			} else {
				console.debug('droped refresh, not visible');
			}
		},*/
	
	
		/*onViewResize: function() {
			console.debug('BufferedRenderer: View Resize?', arguments);
			if (this.grid && this.grid.isVisible(true)) {
				this.callParent(arguments);
			} else {
				console.debug('droped view resize, not visible');
			}
		},*/
	
	
		renderRange: function() {
			console.debug('BufferedRenderer: renderRange?', arguments);
			if (this.grid && this.grid.isVisible(true)) {
				this.callParent(arguments);
			} else {
				console.debug('BufferedRenderer: dropped renderRange, not visible');
			}
		},
	
	
		init: function(grid) {
			this.callParent(arguments);
			if (!grid.ownerCt) {
				grid.on('added', this.__monitorActivation.bind(this, grid), null, {single: true, buffer: 1});
			} else {
				this.__monitorActivation(grid);
			}
		},
	
	
		__monitorActivation: function(grid) {
			function monitorCardChange(cmp, me) {
				var c = cmp.up('{isOwnerLayout("card")}');
				me = me || cmp;
				//console.log(c && c.id, ' - ', grid.id);
				if (c) {
					me.mon(c, {
						buffer: 1,
						show: function() {
							if (grid && grid.isVisible(true)) {
								grid.updateLayout({defer: false});
							}
						}
					});
					monitorCardChange(c, me);
				}
			}
	
			monitorCardChange(grid);
		}
	});


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	const importAll = x => x.keys().forEach(x);
	
	
	importAll(__webpack_require__(74));


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.layout.container.Container', {
		override: 'Ext.layout.container.Container',
	
		manageOverflow: 2
	});


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.menu.Menu', {
		override: 'Ext.menu.Menu',
	
		ui: 'nt',
	
		plain: true,
	
		showSeparator: false,
	
		shadow: false,
	
		frame: false,
	
		hideMode: 'display'
	});


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.panel.Panel', {
		override: 'Ext.panel.Panel',
	
		render: function() {
			this.callParent(arguments);
			if (!this.enableSelect) {this.el.unselectable();}
			else {this.el.selectable();}
		}
	
	},function() {
		Ext.getBody().unselectable();
	});


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.picker.Color', {
		override: 'Ext.picker.Color',
	
		colorRe: /(?:^|\s)color-([^ ]*)(?:\s|$)/,
	
		renderTpl: [
			'<tpl for="colors">',
				'<a href="#" class="color-',
					'<tpl if="values==\'None\'">NONE</tpl>',
					'<tpl if="values!=\'None\'">{.}</tpl>',
					'" hidefocus="on">',
					'<em><span style="background:#{.}" unselectable="on">&#160;</span></em>',
				'</a>',
			'</tpl>'
		]
	}, function() {
		this.prototype.colors.push('None');
	});


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.selection.CellModel', {
		override: 'Ext.selection.CellModel',
	
		onViewRefresh: function() {
			try {
				this.callParent(arguments);
			} catch (e) {
				console.warn(e.stack || e.message || e);
			}
		}
	});


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.tab.Panel', {
		override: 'Ext.tab.Panel',
	
		stateEvents: ['tabchange'],
	
		applyState: function(state) {
			var t = (state || {}).t || 0;
	
			try {
				this.getLayout().getActiveItem();
				this.setActiveTab(t);
			}catch (e) {
				console.error(e.stack);
			}
	
		},
	
		getState: function() {
			return {t: this.items.indexOf(this.getActiveTab())};
		}
	});


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	var ObjectUtils = __webpack_require__(4);
	
	
	/**
	 * This entire file is a hack.  The ExtJS implementation aligns and positions the tip before it updates the contents of
	 * the tip. So, it is potentially offset.  This attempts to correct that by repeating alignment calculations when it
	 * detects a discrepancy.
	 *
	 * We also try to apply sane defaults.
	 */
	module.exports = exports = Ext.define('NextThought.overrides.tip.QuickTip', {
	    override: 'Ext.tip.QuickTip',
	    EDGE_PADDING: 20,
	
	    //pixals from any given edge to trigger a repositioning
	
		//Apply defaults
		constructor: function(config) {
			config = Ext.apply(config || {},{
				header: false,
				showDelay: 500,
				anchorTarget: true,
				trackMouse: false,
				shadow: false,
				componentLayout: 'auto',
				layout: 'auto',
				html: 'WWWWWWWWW',//provide a default so the initial isn't so small.
				xhooks: {
					getTargetXY: function() {
						try {
						var me = this,
							o = me.readerOffsets,
							r = me.callParent(arguments);
	
						if (r && o) {
							r[0] += o.left;
							r[1] += o.top;
						}
						return r;
						}
						catch (e) {
							Ext.defer(this.hide, 10, this);
							return [0, 0];
						}
					}
				}
			});
	
			this.onScroll = this.onScroll.bind(this);
	
			this.callParent([config]);
		},
	
	    getDockingRefItems: function(deep, items) {
			return items;
		},
	
	    onTargetOver: function(e, dom, opts) {
	        if(Ext.is.iOS){
	            return;
	        }
			delete this.readerOffsets;
			if (opts.reader) {
				this.readerOffsets = opts.reader.getAnnotationOffsets();
			}
			return this.callParent(arguments);
		},
	
	    //Override alignment and force the 'target' element to be the element with the title/tip attribute if not the
		// registered owner element. Default to a top centered position, unless screen position forces us to reposition.
		getTargetXY: function getTargetXY() {
			function getTarget(el) {
				el = Ext.get(el);
				if (!el || el.getAttribute('title') || el.getAttribute('data-qtip')) {
					return el;
				}
	
				return el.up('[title]') || el.up('[data-qtip]') || el;
			}
	
			if (getTargetXY.recursiveCall) {
				return this.callParent(arguments);
			}
	
			getTargetXY.recursiveCall = true;
	
			delete this.delegate;
			//Only update it, if activeTarget is set.
			this.anchorTarget = this.activeTarget ? Ext.getDom(getTarget(this.activeTarget.el)) : this.anchorTarget;
			this.anchor = 'bottom';
	
			var vW = Ext.dom.Element.getViewportWidth(),
				w = this.el.getWidth(),
				r;
	
			if (Ext.isEmpty(this.anchorTarget)) {
				console.warn('Tooltip anchorTarget is null. It shouldn\'t be');
				return [-1000, -1000];//don't return null... its dangerous.
			}
			try {
				r = this.callParent(arguments);
	
				if (r[1] < this.EDGE_PADDING) {
					//needs to swap down
					this.anchor = 'top';
				}
	
				if (r[0] < this.EDGE_PADDING) {
					//needs to swap left
					this.anchor = 'left';
				}
				else if ((vW - (r[0] + w)) < this.EDGE_PADDING) {
					//needs to swap right
					this.anchor = 'right';
				}
	
				if (this.anchor !== 'bottom') {
					r = this.callParent(arguments);
				}
			}
			catch (er) {
				console.warn(Globals.getError(er));
			}
			finally {
				delete getTargetXY.recursiveCall;
			}
	
			if (!r) {
				r = [-2000, -2000];
				console.error('Parent implementation return a bad value');
			}
			return r;
		},
	
	    //Hack: The contents change during show, AFTER positioning and aligning, so if we change size, redo it all.
		showAt: function(xy) {
			if (!xy) {
				return;
			}
			var size = this.el.getSize(),
				sizeAfter;
	
			try {
				this.callParent(arguments);
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
	
			sizeAfter = this.el.getSize();
	
			if (size.width !== sizeAfter.width || size.height !== sizeAfter.height) {
				//NOTE: if for some reasons, getTargetXY() returns null, return the default xy that was passed in.
				Ext.defer(this.showAt, 1, this, [this.getTargetXY() || xy]);
			}
		},
	
	    show: function() {
			var ini = this.initialConfig.html;
	
			function detectCrash() {
				if (!this.html || this.html === ini) {
					console.warn('detected tool tip crash');
					this.hide();
					this.crashCount = (this.crashCount || 0) + 1;
					if (this.crashCount > 10) {
						console.error('Too many top failures, removing them.');
						Ext.tip.QuickTipManager.destroy();
					}
				}
			}
	
			window.addEventListener('scroll', this.onScroll);
	
			Ext.defer(detectCrash, 10, this);
	
			return this.callParent(arguments);
		},
	
	    onScroll: function() {
			this.hide();
			window.removeEventListener('scroll', this.onScroll);
		},
	
	    //center the tip pointer
		//We prefer to align to the center posisitions instead of the corner positions.
		syncAnchor: function() {
	    var me = this, pos;
			me.callParent(arguments);
	    switch (me.tipAnchor.charAt(0)) {
	      case 't': pos = 'b-t'; break;
	      case 'r': pos = 'l-r'; break;
	      case 'b': pos = 't-b'; break;
	      default: pos = 'r-l'; break;
	    }
	    me.anchorEl.alignTo(me.el, pos);
	  },
	
	    //We prefer to align to the center posisitions instead of the corner positions.
		getAnchorAlign: function() {
	    switch (this.anchor) {
	      case 'top': return 't-b';
	      case 'left': return 'l-r';
	      case 'right': return 'r-l';
	      default: return 'b-t';
	    }
	  }
	});
	
	
	module.exports = exports = Ext.define('NextThought.view.tip.Tooltip', {
		extend: 'Ext.tip.ToolTip',
		alias: 'widget.nt-tooltip',
	
		cls: 'spec',
	
	
		blockLeftRightAlign: function() {
			var align = this.defaultAlign,
				anchor = this.anchor;
			ObjectUtils.defineAttributes(this, {
				defaultAlign: {
					setter: function(v) { align = v === 'r-l' ? 'tr-br' : v; },
					getter: function() { return align; }
				},
				anchor: {
					setter: function(v) { anchor = v === 'right' ? 'bottom' : v; },
					getter: function() { return anchor; }
				}
			});
	
		},
	
	
		//center the tip pointer
		//We prefer to align to the center posisitions instead of the corner positions.
		syncAnchor: function() {
	    var me = this, pos, off = [0, 0];
			me.callParent(arguments);
	    switch (me.tipAnchor.charAt(0)) {
	      case 't': pos = 'b-t'; break;
	      case 'r': pos = 'l-r'; break;
	      case 'b': pos = 't-b'; break;
	      default: pos = 'r-l'; break;
	    }
	
			if (this.defaultAlign === 'tr-br') {
				pos = 't-br';
				off = [-50, 0];
			}
	
	    me.anchorEl.alignTo(me.el, pos, off);
	  },
	
	
		//We prefer to align to the center posisitions instead of the corner positions.
		getAnchorAlign: function() {
	    switch (this.anchor) {
	      case 'top': return 't-b';
	      case 'left': return 'l-r';
	      case 'right': return 'r-l';
	      default: return 'b-t';
	    }
	  }
	
	});


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.overrides.view.Table', {
		override: 'Ext.view.Table',
	
		getRecord: function() {
			try {
			//buffered stores may throw an error if we try to access an item that has
			// been paged out... lets not blow a gasket in this senario.
				return this.callParent(arguments);
			} catch (e) {
				return null;
			}
		}
	});


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var Globals = __webpack_require__(2);
	var WriterJson = __webpack_require__(68);
	var ReaderJson = __webpack_require__(12);
	
	
	module.exports = exports = Ext.define('NextThought.proxy.Rest', {
	    extend: 'Ext.data.proxy.Rest',
	    alias: 'proxy.nti',
	    timeout: 3600000,
	
	    //hour
	
		reader: {
			type: 'nti',
			root: 'Items'
		},
	
	    writer: {
			type: 'nti'
		},
	
	    constructor: function(config) {
			this.callParent(arguments);
			this.on('exception', this.exception, this);
		},
	
	    doRequest: function(operation, callback, scope) {
			operation.retryArgs = {callback: callback, scope: scope};
			if (operation.async === false) {
				Ext.Ajax.async = false;
			}
			this.callParent(arguments);
			delete Ext.Ajax.async;
	
			if (this.headers) {
				delete this.headers;
			}
			//TODO: fire an event in case anyone cares
		},
	
	    buildUrl: function(request) {
			var action = request.operation.action,
				records = request.records,
				record = records ? records[0] : null,
				mimeType = record ? record.mimeType || record.get('MimeType') : 'application/vnd.nextthought',
				href,
				collection;
	
			this.headers = {};
	
			//making sure headers propagate
			Ext.apply(this.headers, request.headers || {});
			Ext.apply(this.headers, request.operation.headers || {});
	
			if (!record) {
				return request.operation.url || request.url || this.url;
			}
	
			Ext.apply(this.headers, { 'Content-Type': mimeType + '+json' });
	
			if (request.operation.url || request.url) {
				if ($AppConfig.debug) {
					console.debug('Using a set url. Will not look up URL from service.',
							'\n\tOperation URL:', ((this.operation && this.operation.url) || undefined),
							'\n\tRequested URL:', request.url);
				}
				return request.operation.url || request.url;
			}
	
			if (action === 'update' || action === 'destroy') {
				href = record.getLink('edit') || record.get('href');
			}
			else if (action === 'create') {
				collection = Service.getCollectionFor(mimeType, null) || {};
				if (!collection.href) {
					Ext.Error.raise('No HREF found for mimetype ' + mimeType);
				}
				href = getURL(Globals.ensureSlash(collection.href, true));
			}
			else if (action === 'read') {
				href = record.get('href');
			}
			else {
				Ext.Error.raise({
					msg: 'Unexpected action, no defined path for: "' + action + '"',
					request: request,
					action: action
				});
			}
	
	
			if (!href) {
				Ext.Error.raise({
					msg: 'The URL is undefined!',
					action: action,
					record: record,
					mimeType: mimeType
				});
			}
	
			return href;
		},
	
	    exception: function(proxy, response, operation, eOpts) {
			var code = response.status;
			if (code < 400 || code >= 500) {
				console.error('Error getting data:', arguments);
			}
	
			try {
	
				Ext.callback(operation.failed, operation.scope, [operation.records, operation, Ext.decode(response.responseText, true) || response.responseText]);
			}
			catch (e) {
				console.error(e.message, e);
			}
		}
	});


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	var UserRepository = __webpack_require__(5);
	
	
	module.exports = exports = Ext.define('NextThought.proxy.reader.Base', {
		extend: 'Ext.data.reader.Json',
		alias: 'reader.nti-base',
	
		//TODO The fact we are doing this may play into why we run into issues
		//with LastModified caching and friends lists.  Need to look into that
		fillCacheWithUserList: function(record, field) {
			var users = (record.raw || {})[field];
	
			if (!Ext.isEmpty(users)) {
				//console.debug('Need to fill cache with userlist for' , record.getId(), field, users);
				Ext.each(users, function(user) {
					if (user.isModel || Ext.isObject(user)) {
						UserRepository.precacheUser(user);
					}
				});
			}
		},
	
		precacheUserLists: function(record) {
			var me = this;
			//If we were given a model from the server go ahead and cache it
			//so we don't have to resolve it again.  Failure to do this leads to hundreds
			//of user resolutions (in accounts with lots of data) up front
			record.fields.each(function(f) {
				if (f.type === Ext.data.Types.USERLIST) {
					me.fillCacheWithUserList(record, f.name);
				}
			});
		},
	
		//Read records and do any prefilling/prefetching of user objects
		readRecords: function(data) {
			var result = this.callParent([data]),
				records = result.records;
			try {
				Ext.each(records || [], function(record) {
					this.precacheUserLists(record);
				}, this);
	
				return result;
			}
			catch (e) {
				console.error(e.stack || e, records);
				return Ext.data.ResultSet.create({
					total: 0,
					count: 0,
					records: [],
					success: false
				});
			}
		}
	});


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.proxy.writer.Json', {
		extend: 'Ext.data.writer.Json',
		alias: 'writer.nti',
	
		constructor: function() {
			this.callParent(arguments);
		},
	
		getRecordData: function(obj) {
			var defaults = this.callParent(arguments),
				output = {},
				key;
	
			function getJSON(obj) {
				var a = [];
				if (obj && Ext.isFunction(obj.asJSON)) {
					obj = obj.asJSON();
				}
				else if (Ext.isArray(obj)) {
					obj = Ext.Array.map(obj, getJSON);
				}
				return obj;
			}
	
			//filter out falsy values
			for (key in defaults) {
				if (defaults.hasOwnProperty(key) && defaults[key]) {
					output[key] = getJSON(defaults[key]);
				}
			}
	
			//remove unnecessary JSON
			delete output.Class;
			delete output.Links;
	
			//console.debug('Output:',output);
			//console.debug('Trimed Keys:',Ext.Array.difference(Ext.Object.getKeys(defaults),Ext.Object.getKeys(output)));
	
			return output;
		},
	
		writeRecords: function(request, data) {
			request = this.callParent(arguments);
	
			//Because of ExtJS bug where jsonData is sent on delete, check to see if we
			//are making a DELETE request (aka destroy) and remove jsonData.  Also check
			//to see when the bug is fixed and log it so we remove this extra step when possible.
			if (request.action === 'destroy') {
				if (!request.jsonData || request.jsonData.length === 0) {
					console.warn('SAFE TO REMOVE EXTJS BUG WORKAROUND, request to delete has no jsonData', request);
				}
				delete request.jsonData;
			}
	
			return request;
		}
	});
	


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	/**
	 * original source: http://www.webtoolkit.info/javascript-base64.html
	 *
	 * TODO: de-lint
	 */
	module.exports = exports = Ext.define('NextThought.util.Base64', {
		alternateClassName: 'B64',
		singleton: true,
	
		_isBase64Re: /^([A-Za-z0-9+\/]{4})*([A-Za-z0-9+\/]{4}|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}==)$/,
	
		// private property
		_keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
	
		_equalsRe: new RegExp('=+$'),
		_slashRe: /\//g,
		_plusRe: /\+/g,
	
		encodeURLFriendly: function(input) {
			return this.encode('!@' + input)//to allow us to quickly determine if the value as raw or encoded.
					.replace(this._plusRe, '-')
					.replace(this._slashRe, '_')
					.replace(this._equalsRe, '');
		},
	
	
		decodeURLFriendly: function(str) {
			// reverse to original encoding
			if (str.length % 4 !== 0) {
				str += ('===').slice(0, 4 - (str.length % 4));
			}
			str = str.replace(/-/g, '+').replace(/_/g, '/');
			str = this.decode(str);
			if (!/^!@/.test(str)) {//wasn't encoded by us... abort
				str = null;
			} else {
				str = str.substr(2);
			}
			return str;
		},
	
	
		// public method for encoding
		encode: function(input) {
			var output = '',
				chr1, chr2, chr3, enc1, enc2, enc3, enc4,
				i = 0;
	
			input = this._utf8_encode(input);
	
			while (i < input.length) {
	
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
	
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
	
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
	
				output = output +
						this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
						this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	
			}
	
			return output;
		},
	
		// public method for decoding
		decode: function(input) {
			var output = '',
				chr1, chr2, chr3,
				enc1, enc2, enc3, enc4,
				i = 0;
	
			input = input.replace(/[^A-Za-z0-9\+\/=]/g, '');
	
			while (i < input.length) {
	
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
	
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
	
				output = output + String.fromCharCode(chr1);
	
				if (enc3 !== 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 !== 64) {
					output = output + String.fromCharCode(chr3);
				}
	
			}
	
			output = this._utf8_decode(output);
	
			return output;
	
		},
	
		// private method for UTF-8 encoding
		_utf8_encode: function(string) {
			string = string.replace(/\r\n/g, '\n');
			var utftext = '', n, c;
	
			for (n = 0; n < string.length; n++) {
	
				c = string.charCodeAt(n);
	
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	
			}
	
			return utftext;
		},
	
		// private method for UTF-8 decoding
		_utf8_decode: function(utftext) {
			var string = '',
				i = 0, c3 = 0, c2 = 0,
				c = 0;
	
			while (i < utftext.length) {
	
				c = utftext.charCodeAt(i);
	
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
	
			}
	
			return string;
		}
	
	});


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.util.Localization', {
		singleton: true,
	
		formatRe: /\{([^\{]+)\}/g,
	
	
		getExternalizedString: function(key, defaultValue, noKey) {
			var v = (window.NTIStrings || {})[key] || defaultValue || (!noKey && key) || '';
	
			if (v instanceof Array) {
				v = v[Math.floor(Math.random() * 100) % v.length];
			}
	
			return v;
		},
	
	
		formatExternalString: function(key, values, dontUseKey) {
			var string = this.getExternalizedString(key, dontUseKey ? null : key, true);
	
			if (!values) {
				return string;
			}
	
			return string.replace(this.formatRe, function(m, i) {
				return values[i] || m;
			});
		},
	
		pluralizeString: function(count, key, noNum) {
			var forms = (window.NTIStrings.PluralForms || {})[key], i,
				s;
	
			if (!forms) {
				//console.error('Pluralizing a string we dont have forms for', key, count);
				return this.oldPlural.apply(Ext.util.Format, arguments);
			}
	
			if (forms.rule) {
				i = forms.rule(count);
			} else {
				i = forms.ranges[count];
				i = i !== undefined ? i : forms.ranges[undefined];
			}
	
			if (i === undefined) {
				console.error('No form for count', key, count);
				return key;
			}
	
			s = forms.forms[i] || key;
	
			if (noNum) {
				s = s.replace('{#}', '');
				return s.trim();
			}
	
			if (s === key) {
				return count + ' ' + s;
			}
	
			return s.replace('{#}', count);
		}
	
	}, function() {
		//TODO: figure out how to not make these globals
		window.getString = this.getExternalizedString.bind(this);
		window.getFormattedString = this.formatExternalString.bind(this);
	
		this.oldPlural = Ext.util.Format.plural;
	
		Ext.util.Format.plural = this.pluralizeString.bind(this);
	});


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	/** force our implementation for now. */
	//TODO: don't use a custom promise
	window.Promise = null;
	
	//TODO: Adapt these node.js tests to our platform so we can unit test our promise polyfill. https://github.com/promises-aplus/promises-tests
	
	//We won't use the native ones for now. (especially since we're in ES5 mode)
	//See: http://www.html5rocks.com/en/tutorials/es6/promises/
	Promise = window.Promise || (function(global) {
	
		//<editor-fold desc="Private shared methods">
		function then(onFulfilled, onRejected) {
			var promise = new Promise(WHEN_THEN),
				me = this;
	
			if (onFulfilled && onFulfilled.then) {
				Ext.Error.raise('Cannot `then` a promise with another promise this way.');
			}
	
			// initialize array
			me.cache = me.cache || [];
	
			setTimeout(function() {//async it
				me.cache.push({
					fulfill: onFulfilled,
					reject: onRejected,
					promise: promise
				});
				resolve.call(me);
			}, 1);
	
			return promise;
		}
	
		function changeState(state, value) {
			// catch changing to same state (perhaps trying to change the value)
			if (this.state === state) {
				console.error('Cannot transition to same state: ' + state);
				return;
			}
	
			// trying to change out of fulfilled or rejected
			if (this.state === State.FULFILLED || this.state === State.REJECTED) {
				console.error('cannot transition from current state: ' + state);
				return;
			}
	
			// if second argument isn't given at all (passing undefined allowed)
			if (state === State.FULFILLED && arguments.length < 2) {
				throw new Error('transition to fulfilled must have a non null value');
			}
	
			// if a null reason is passed in
			if (state === State.REJECTED && value === null) {
				throw new Error('transition to rejected must have a non null reason');
			}
	
			//change state
			this.state = state;
			this.value = value;
			resolve.call(this);
			return this.state;
		}
	
		function fulfill(value) { changeState.call(this, State.FULFILLED, value); }
		function reject(reason) { changeState.call(this, State.REJECTED, reason); }
	
		function resolve() {
			var obj, fn, value, me = this;
			// check if pending
			if (this.state === State.PENDING) {
				return;
			}
	
			function chain(obj, state) {
				return function(v) {
					changeState.call(obj.promise, state, v);
				};
			}
	
			// for each 'then'
			while (me.cache && me.cache.length) {
				obj = me.cache.shift();
	
				fn = me.state === State.FULFILLED ? obj.fulfill : obj.reject;
	
				if (typeof fn !== 'function') {
					changeState.call(obj.promise, this.state, me.value);
				} else {
					// fulfill promise with value or reject with error
					try {
						value = fn(me.value);
	
						// deal with promise returned
						if (value && typeof value.then === 'function') {
							value.then(chain(obj, State.FULFILLED), chain(obj, State.REJECTED));
							// deal with other value returned
						} else {
							changeState.call(obj.promise, State.FULFILLED, value);
						}
						// deal with error thrown
					} catch (error) {
						console.error('Exception while resolving promise:', error && (error.stack || error.message || error));
						changeState.call(obj.promise, State.REJECTED, error);
					}
				}
			}
		}
		//</editor-fold>
	
		var WHEN_THEN = {},
			nextId = 1, Promise, p, State = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };
	
		Promise = function(worker) {
			this.id = (nextId++);
			this.state = State.PENDING;
	
			if (worker && worker.call) {
				try {
					worker.call(global, fulfill.bind(this), reject.bind(this));
				} catch (e) {
					reject.call(this, e);
				}
			} else if (worker !== WHEN_THEN) {
				//The spec expects the constructor of a promise to take a callback that will do the work... our implementation was not so contained. We have more
				// of a Deferred promise model. Where we get an empty Promise object and externally fulfill/reject it.
				console.error('No callback This invocation will break with native Promises');
			}
		};
	
		p = Promise.prototype;
	
		p.then = then;
	
		return Promise;
	}(window));
	
	
	Ext.applyIf(Promise.prototype, {
		done: function(fn) { this.validateHandler(fn); return this.then(fn); },
		fail: function(fn) { this.validateHandler(fn); return this.then(undefined, fn); },
		//the proper name is 'catch', however JSLint has a problem with that (reserved word and all) so lets keep using "fail".
		//this is only here to be compliant to the api.
		'catch': function(fn) { return this.fail.apply(this, arguments); },
		always: function(fn) {this.validateHandler(fn); return this.then(fn, fn); },
		chain: function(old) {this.then(function(o) {old.fulfill(o);},function(r) {old.reject(r);});},
	
		validateHandler: function(fn) { if (typeof fn !== 'function') { throw new TypeError('Expected a function'); } }
	});
	
	
	Ext.applyIf(Promise, {
		resolve: function(v) { return v instanceof Promise ? v : new Promise(function(f) {f.call(this, v);}); },
		reject: function(v) { return new Promise(function(f, r) {r.call(this, v);}); },
		wait: function(t) { return new Promise(function(f) {setTimeout(f, t || 1);});},
		/**
		 * Given a minimum duration, return a function that when called
		 * will return a promise that fulfills with its first arg after
		 * at least the duration given has passed.
		 *
		 * @param  {Number} minWait the min time to wait
		 * @return {Function}
		 */
		minWait: function(minWait) {
			var start = new Date();
	
			return function(result) {
				var end = new Date(),
					duration = end - start;
	
				if (duration < minWait) {
					return wait(minWait - duration)
						.then(function() {
							return result;
						});
				}
	
				return Promise.resolve(wait);
			}
		}
	});
	
	wait = Promise.wait;
	
	
	/**
	 * Deferred promise.
	 * I guess there _MIGHT_ be some cases where we want this pattern. :/ I don't like it. But here you go.
	 *
	 * This will make a promise that you may or may NOT be able to keep.
	 *    -- There is no guarantee that fulfill or reject will get called.
	 *
	 * This version of the promise is no better than the callback-hell model.  Keep in mind that
	 * Deferred's do not force execution of their promise, the are not Guaranteed to resolve.
	 *
	 * I strongly recommend examining your code and your structure before commiting to using this as a final solution.
	 */
	Deferred = (function() {
	
		function apply(d, src) {
			var k;
			for (k in src) {
				if (src.hasOwnProperty(k) && d[k] === undefined) {
					d[k] = src[k];
				}
			}
			return d;
		}
	
		var Deferred = function() {
			var o = false;
			function wtf(f, r) {
				o = {
					fulfill: function(value) {f(value);},
					reject: function(reason) {r(reason);}
				};
			}
	
			this.superclass.constructor.call(this, wtf);
			if (!o) {
				throw new Error('Contract broken!');
			}
			apply(this, o);
		};
	
		Deferred.prototype.superclass = Promise.prototype;
		apply(Deferred.prototype, Promise.prototype);
	
		return Deferred;
	}());
	
	
	/**
	 *
	 * @param {Promise[]} promises
	 * @type {Function}
	 * @return {Promise}
	 */
	Promise.all = Promise.all || function(promises) {
		// get promises
		var values = [],
			toGo = promises.length, i;
	
		values.length = promises.length;
	
		return new Promise(function(fulfill, reject) {
			var state = fulfill;
	
			// whenever a promise completes
			function checkFinished() {
				// check if all the promises have returned
				if (toGo) {
					return;
				}
				// set the state with all values if all are complete
				state(values);
			}
	
			function prime(index) {
				var p = promises[index];
	
				function done(value) {
					values[index] = value;
					toGo--;
					checkFinished();
				}
	
				if (!p || !p.then) {//handle falsy/non-promise @ index
					done(p);
					return;
				}
	
				p.then(done,// on success
						function(v) {
							state = reject;
							done(v);
						});
			}
	
			checkFinished();//handle empty array.
	
			// whenever a promise finishes check to see if they're all finished
			for (i = 0; i < promises.length; i++) {
				prime(i);
			}
		});
	};
	
	
	/**
	 * Given an array of values, step through one at a time and fulfill with
	 *	1.) The value its self if its not a function
	 *	2.) The return value of the function
	 *	3.) The success of the promise the function returns
	 * if it returns a promise that fails, repeat with the next item
	 *
	 * @param  {Array} values An Array of values or functions that return value or a Promise.
	 * @return {Promise}      fulfills with the first successful value in the array or rejects if none are.
	 */
	Promise.first = Promise.first || function(values) {
		if (!Ext.isArray(values) || !values.length) {
			return Promise.reject('No promise');
		}
	
		return new Promise(function(fulfill, reject) {
			var total = values.length;
	
			function add(index) {
				if (index >= total) {
					reject('No promise in chain was successful');
					return;
				}
	
				var val = values[index];
	
				if (!Ext.isFunction(val)) {
					fulfill(val);
					return;
				}
	
				val = val.call();
	
				if (val instanceof Promise) {
					val
						.then(fulfill)
						.fail(function(reason) {
							console.error('Promise in chain failed: ', reason);
							add(index + 1);
						});
				} else {
					fulfill(val);
				}
			}
	
			add(0);
		});
	};
	
	
	module.exports = exports = Ext.define('NextThought.util.Promise', {});


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	
	/* injects from baggage-loader */
	
	var Ext = __webpack_require__(1);
	
	
	module.exports = exports = Ext.define('NextThought.util.Rects', {
		singleton: true,
	
	
		getFirstNonBoundingRect: function(ra) {
			var range = ra.nativeRange || ra,
	            bound = range.getBoundingClientRect(),
				rects = Array.prototype.slice.call(range.getClientRects()) || [],
				i = rects.length - 1, r;
	
			//trim the empty ones
			for (i; i >= 0; i--) {
				r = rects[i];
				if (!r.height || !r.width) { rects.splice(i, 1); }
			}
	
			//i === 0 now
			for (i; i < rects.length; i++) {
				r = rects[i];
				if (r && (r.top !== bound.top
				|| r.bottom !== bound.bottom
				|| r.left !== bound.left
				|| r.right !== bound.right)) {
					return r;
				}
			}
	
			return bound;
		},
	
	
		merge: function(rects,clientWidth) {
			var i = rects.length - 1,
				lineHeight,
				heights = [17, 24]; //Sane default values for small highlights
			//faster to decrement in js
			for (; i >= 0; i--) {
				if (rects[i].height > 0) {
					heights.push(rects[i].height);
				}
			}
	
			heights.sort(function(a,b) { return a - b; });
			//Take the 33rd percentile of nonzero highlights; this seems to
			//be a fairly good heuristic for the line height
			lineHeight = heights[Math.floor(heights.length / 3)];
			rects = this.trimCrazies(rects, lineHeight, clientWidth);
			var r = [], ri,
				x, xx, y, yy, w, h,
				b, bins = {};
	
			i = rects.length - 1;
	
			for (; i >= 0; i--) {
				ri = rects[i];
	
				x = ri.left || ri.x;
				y = ri.top || ri.y;
				h = ri.height || (ri.bottom - ri.top);
				w = ri.width || (ri.right - ri.left);
				xx = ri.right || (x + ri.height);
				yy = ri.bottom || (y + ri.width);
	
				var tolerance = 8;
	
				b = Math.floor((y + h / 2) / tolerance);//center line of the rect
	
				if (!bins[b] && !bins[b + 1]) {
					r.push({ left: x, top: y, right: xx, bottom: yy, width: w, height: h });
					//Each bin points to the rectangle occupying it,
					//+1 to overcome the problem of falsy values
					bins[b] = r.length;
					bins[b + 1] = r.length;
				}
				else {
	        b = r[(bins[b] || bins[b + 1]) - 1];
					b.left = b.left < x ? b.left : x;
					b.top = b.top < y ? b.top : y;
					b.right = b.right > xx ? b.right : xx;
					b.bottom = b.bottom > yy ? b.bottom : yy;
	
					b.width = b.right - b.left;
					b.height = b.bottom - b.top;
				}
	
			}
			return r;
	
		},
	
	
		trimCrazies: function(rects, lineHeight, clientWidth) {
			function flip(a,i) { return Ext.apply({},a[i]); }
	
			function notTooShort(h) {
				return !lineHeight || h >= lineHeight;
			}
			function notTooTall(h) {
				return !lineHeight || h < lineHeight * 1.9;
			}
			function isCovered(i) {
				var j = 0;
				for (; j < rects.length; j++) {
					if (rects[j].top > rects[i].top && rects[j].bottom < rects[i].bottom) {
						return true;
					}
				}
				return false;
			}
	
			var rs = Array.prototype.slice.call(rects),
					i = rs.length - 1, out = [], o, h, w,
					lh2 = lineHeight * 2;
	
			if (!i || Ext.isIE || !lineHeight) { return rects; }
	
			for (; i >= 0; i--) {
				o = flip(rs, i);
				if (o.height && o.height < lineHeight) {o.height = lineHeight;} //round up to look nice
				h = o.height;
				w = o.width;
				if (w > 0 && (w <= clientWidth || !clientWidth) && notTooShort(h) && (notTooTall(h) || !isCovered(i))) {
					out.push(o);
				}
			}
	
			return out;
		},
	
	
		contains: function(refRect, testRect, allowances) {
			var a = allowances || 0;
			if (Ext.isNumber(a)) {
				a = { top: -a, bottom: a, left: -a, right: a };
			}
	
			if (!Ext.isObject(a)) {Ext.Error.raise('Invalid allowances value');}
	
			Ext.applyIf(a, {top: 0, left: 0, right: 0, bottom: 0});
	
			return (refRect.top + a.top) <= testRect.top
				&& (refRect.bottom + a.bottom) >= testRect.bottom
				&& (refRect.left + a.left) <= testRect.left
				&& (refRect.right + a.right) >= testRect.right;
	
		},
	
	
		isZeroRect: function(rect) {
			if (!rect) {
				return true;
			}
			return rect.top === 0 && rect.left === 0 && rect.height === 0 && rect.width === 0;
		}
	
	});


/***/ },
/* 73 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/*** IMPORTS FROM imports-loader ***/
	(function() {
	
	(function(self) {
	  'use strict';
	
	  if (self.fetch) {
	    return
	  }
	
	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }
	
	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }
	
	  function Headers(headers) {
	    this.map = {}
	
	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)
	
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }
	
	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }
	
	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }
	
	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }
	
	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }
	
	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }
	
	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }
	
	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }
	
	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }
	
	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }
	
	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }
	
	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }
	
	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }
	
	  function Body() {
	    this.bodyUsed = false
	
	
	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }
	
	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        }
	      }
	    }
	
	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }
	
	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }
	
	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }
	
	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }
	
	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }
	
	    return this
	  }
	
	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
	
	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }
	
	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }
	
	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null
	
	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }
	
	  Request.prototype.clone = function() {
	    return new Request(this)
	  }
	
	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }
	
	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }
	
	  Body.call(Request.prototype)
	
	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }
	
	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }
	
	  Body.call(Response.prototype)
	
	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }
	
	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }
	
	  var redirectStatuses = [301, 302, 303, 307, 308]
	
	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }
	
	    return new Response(null, {status: status, headers: {location: url}})
	  }
	
	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;
	
	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }
	
	      var xhr = new XMLHttpRequest()
	
	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }
	
	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }
	
	        return;
	      }
	
	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }
	
	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.open(request.method, request.url, true)
	
	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }
	
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }
	
	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })
	
	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);
	
	
	/*** EXPORTS FROM exports-loader ***/
	module.exports = global.fetch;
	}.call(global));
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./Component.js": 32,
		"./EventManager.js": 33,
		"./Ext.js": 34,
		"./JSON.js": 35,
		"./XTemplate.js": 36,
		"./app/Application.js": 37,
		"./app/Controller.js": 38,
		"./builtins/Array.js": 39,
		"./builtins/Console.js": 40,
		"./builtins/Element.js": 41,
		"./builtins/Error.js": 42,
		"./builtins/Function.js": 43,
		"./builtins/Node.js": 44,
		"./builtins/Number.js": 45,
		"./builtins/RegExp.js": 46,
		"./builtins/String.js": 47,
		"./builtins/Window.js": 48,
		"./container/Viewport.js": 49,
		"./data/Connection.js": 50,
		"./data/proxy/Server.js": 51,
		"./dd/DragDropManager.js": 52,
		"./dom/Element.js": 53,
		"./grid/Panel.js": 54,
		"./grid/column/Column.js": 55,
		"./grid/plugin/BufferedRenderer.js": 56,
		"./layout/container/Container.js": 58,
		"./menu/Menu.js": 59,
		"./panel/Panel.js": 60,
		"./picker/Color.js": 61,
		"./selection/CellModel.js": 62,
		"./tab/Panel.js": 63,
		"./tip/QuickTip.js": 64,
		"./view/Table.js": 65
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 74;


/***/ }
/******/ ]);
//# sourceMappingURL=61029fa2d5656d23e623.js.map