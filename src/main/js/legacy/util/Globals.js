/*global ActiveXObject*/
/*eslint no-control-regex:0*/

const Ext = require('@nti/extjs');
const { isNTIID } = require('@nti/lib-ntiids');

const HOST_PREFIX_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?/i;

global.Globals =
	module.exports =
	exports =
		Ext.define('NextThought.util.Globals', {
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

			ROOT_URL_PATTERN: /^\//, //starts with a slash
			HOST_PREFIX_PATTERN: HOST_PREFIX_PATTERN,
			FILE_EXTENSION_PATTERN: /\..+$/,
			INVALID_CHARACTERS_PATTERN: /^[^/\\";=?<>#%'{}|^[\]-]+$/,
			ESCAPE_REGEX_PATTERN: /[-[\]/{}()*+?.\\^$|]/g,

			CANVAS_URL_SHAPE_BROKEN_IMAGE: 'whiteboard-error-image',
			CANVAS_BROKEN_IMAGE: 'whiteboard-broken-image',

			CANVAS_GOLDEN_RATIO: 1.618, //http://en.wikipedia.org/wiki/Golden_ratio

			SAD_FACE: Ext.DomHelper.markup({
				style: {
					color: '#bbb',
					font: "normal 400 10em 'Helvetica Neue', Helvetica, Arial, sans-serif",
					'-webkit-transform': 'rotate(90deg)',
					'-moz-transform': 'rotate(90deg)',
					'-ms-transform': 'rotate(90deg)',
					'-o-transform': 'rotate(90deg)',
					transform: 'rotate(90deg)',
					display: 'inline-block',
					position: 'absolute',
					left: '50%',
					'letter-spacing': '0.1em;',
				},
				html: ':(',
			}),

			//Holy mother of perl! JSLint really hates the javascript protocol. :( We have to really obfuscate that string for it not to complain.
			EMPTY_WRITABLE_IFRAME_SRC:
				'javascript' +
				(function () {
					return ':';
				})(),

			ANIMATE_NO_FLASH: {
				listeners: {
					afteranimate: Ext.emptyFn,
				},
			},

			WAIT_TIMES: {
				SHORT: 300,
				LONG: 5000,
			},

			INTERNAL_MIMETYPES: {
				'application/pdf': true,
				'application/x-pdf': true,
			},

			escapeForRegex: function (str) {
				return str.replace(this.ESCAPE_REGEX_PATTERN, '\\$&');
			},

			//A utility wrapper around JSON.parse to catch errors
			parseJSON: function (s, safe) {
				try {
					return JSON.parse(s);
				} catch (e) {
					if (safe) {
						return null;
					}

					throw e;
				}
			},

			parseError: function (response) {
				let error;
				const { status, responseText } = response;

				if (status === 422) {
					error = this.parseJSON(responseText, true);
				}

				return error;
			},

			//Remove leading and trailing /'s from a route
			trimRoute: function (route) {
				route = route || '';
				//get rid of any leading slash
				route = route.replace(/^\//, '');
				//get rid of any trailing slash
				route = route.replace(/\/$/, '');

				return route;
			},

			getContainerLoadingMask: function () {
				return {
					xtype: 'box',
					autoEl: {
						cls: 'loading-mask container-loading-mask',
						cn: { cls: 'load-text', html: 'Loading...' },
					},
				};
			},

			/**
			 * Should the given ntiid, url, and targetMimeType be opened in the app
			 * or in another window.
			 *
			 * @param  {string} ntiid		   the ntiid of the thing
			 * @param  {Srring} url			   the url to the thing
			 * @param  {string} basePath		the pathname the app is hosted at.
			 * @param  {string} targetMimeType the mimeType of the thing to open
			 * @returns {boolean}			   if we can show this in the app
			 */
			shouldOpenInApp: function (ntiid, url, basePath, targetMimeType) {
				const isTargetAnNTIID = isNTIID(url);
				const canHandleTypeInternally =
					this.INTERNAL_MIMETYPES[targetMimeType] ||
					/\.pdf$/i.test((url || '').split('?')[0]);
				const parts = this.getURLParts(url);
				const { location } = global;
				let internal = true;

				if ($AppConfig.openExternalPDFsInNewWindow) {
					internal =
						(!parts.protocol ||
							parts.protocol === location.protocol) &&
						(!parts.hostname ||
							parts.hostname === location.hostname);
				}

				return (
					isTargetAnNTIID ||
					(ntiid && canHandleTypeInternally && internal)
				);
			},

			/**
			 * Search the navigator for a  mimeType
			 *
			 * @param  {string} type mimeType to search for
			 * @returns {MimeType}	 the mimeType if we find it or null
			 */
			getNavigatorMimeType: function (type) {
				let mimeType;

				for (let key of Object.keys(navigator.mimeTypes)) {
					mimeType = navigator.mimeTypes[key];

					if (mimeType && mimeType.type === type) {
						return mimeType;
					}
				}
			},

			swallow: function (/*e*/) {},

			/**
			 * Search the navigator for a plugin
			 *
			 * @param  {string} name name of the plugin
			 * @returns {Plugin}		 the plugin if we find it or null
			 */
			getNavigatorPlugin: function (name) {
				for (let key of Object.keys(navigator.plugins)) {
					const plugin = navigator.plugins[key];

					if (plugin && plugin.name === name) {
						return plugin;
					}
				}
			},

			/**
			 * Attempt to create an active x object
			 *
			 * @param  {string} name name of the application providing the object
			 * @returns {Object}		 the active x object or null if we couldn't create one
			 */
			getActiveXObject: function (name) {
				try {
					return new ActiveXObject(name);
				} catch (e) {
					this.swallow(e);
				}
			},

			flatten: function (a) {
				if (!a.reduce) {
					return a;
				}

				return a.reduce(function (acc, x) {
					if (Array.isArray(x)) {
						acc = acc.concat(x);
					} else {
						acc.push(x);
					}

					return acc;
				}, []);
			},

			getError: function (e) {
				return e.stack || e;
			},

			stopBackspace: function (doc) {
				function fn() {
					return function (e) {
						var t = e.getTarget(),
							key = e.getKey(),
							notInput =
								!t ||
								(!/input|textarea/i.test(t.tagName) &&
									!t.getAttribute('contenteditable')),
							notDialog = !e.getTarget('dialog');

						if (
							notDialog &&
							notInput &&
							(key === e.ESC || key === e.BACKSPACE)
						) {
							console.log('blocking key for: ', t);
							e.stopEvent();
							return false;
						}
						return true;
					};
				}

				Ext.fly(doc).on({
					keydown: fn(),
					keypress: fn(),
				});
			},

			validateConfig: function () {
				// const HOST_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?$/i;
				// const HOST_PATTERN_PROTOCOL_MATCH_GROUP = 1;
				// const HOST_PATTERN_DOMAIN_MATCH_GROUP = 3;
				// const HOST_PATTERN_PORT_MATCH_GROUP = 5;
				const { location, $AppConfig } = global;

				if (
					$AppConfig === undefined ||
					$AppConfig.server === undefined
				) {
					alert('Bad or no configuration.');
					return false;
				}

				// Allow these properties to be drooped from the config. `.server` is the only config.
				Object.assign($AppConfig, {
					'server-host':
						location.protocol +
						'//' +
						location.host.replace(/:((0.*)|80|443)$/, ''),
					'server-path': new URL(
						$AppConfig.server || '',
						'file:///dataserver2/'
					).pathname,
				});

				if (!/^\/.+\/$/.test($AppConfig['server-path'])) {
					alert(
						'Bad Server Config, your data path does not validate the pattern: /.+/'
					);
					return false;
				}

				if ($AppConfig.jsonp === undefined) {
					$AppConfig.jsonp = Ext.isIE && !Ext.isIE10p;
				}

				return true;
			},

			/**
			 * Loads a script into the dom
			 *
			 * @param {string} url --
			 * @param {Function} [onLoad] --
			 * @param {Function} [onError] --
			 * @param {Object} [scope] --
			 * @param {boolean} [bustCache] --
			 * @returns {Script} the script element
			 */
			loadScript: function (url, onLoad, onError, scope, bustCache) {
				var head,
					doc = document,
					script,
					onLoadFn,
					onErrorFn;

				function buildCallback(cb, callScope) {
					return function () {
						script.onload = null;
						script.onreadystatechange = null;
						script.onerror = null;

						if (cb && cb.call) {
							cb.call(callScope || window, script);
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
					url +=
						(url.indexOf('?') < 0 ? '?' : '&') +
						'_dc=' +
						new Date().getTime();
				}

				script.type = 'text/javascript';
				script.setAttribute('src', url);
				script.setAttribute('async', true);
				script.async = true;
				script.src = url;
				script.onload = onLoadFn;
				script.onerror = onErrorFn;

				script.onreadystatechange = function () {
					if (
						this.readyState === 'loaded' ||
						this.readyState === 'complete'
					) {
						onLoadFn();
					}
				};

				head.appendChild(script);

				return script;
			},

			loadScripts: function (urls, onLoad, scope, bustCache) {
				var u,
					stack = [],
					errors = false;
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
						this.loadScript(urls[u], tick, fail, this, bustCache);
					}
				}
			},

			handleCache: function () {
				try {
					var ac = window.applicationCache;
					if (!ac) {
						return;
					}

					ac.addEventListener(
						'updateready',
						(/*e*/) => {
							if (ac.status === ac.UPDATEREADY) {
								ac.swapCache();
								Ext.MessageBox.confirm(
									'Update Available',
									'A new version of this site is available. Load it now?',
									function (btn) {
										if (btn === 'yes') {
											window.location.reload();
										}
									}
								);
							}
							//else: Manifest didn't changed. Nothing new to do.
						},
						false
					);
				} catch (error) {
					console.error('Error handling html5 app cache', error);
				}
			},

			getAsynchronousTaskQueueForList: function (s) {
				var list = [],
					i = (s && (s.length || s) - 1) || 0;
				for (i; i > 0; i--) {
					list.push({});
				}
				return list;
			},

			removeLoaderSplash: function () {
				var me = this;
				me.removeLoaderSplash = Ext.emptyFn;
				setTimeout(function () {
					var mask = Ext.get('loading-mask');

					if (mask) {
						mask.fadeOut({ remove: true });
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
			 * @param [fn] - an equality function.	If this is ommited === is used on each elment
			 */
			arrayEquals: function (a, b, fn) {
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

				var re = (naturalSort.re =
						naturalSort.re ||
						/(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi),
					sre = (naturalSort.sre =
						naturalSort.sre || /(^[ ]*|[ ]*$)/g),
					dre = (naturalSort.dre =
						naturalSort.dre ||
						/(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[/-]\d{1,4}[/-]\d{1,4}|^\w+, \w+ \d+, \d{4})/),
					hre = (naturalSort.hre =
						naturalSort.hre || /^0x[0-9a-f]+$/i),
					ore = (naturalSort.ore = naturalSort.ore || /^0/),
					// convert all to strings strip whitespace
					x = i(a).replace(sre, '') || '',
					y = i(b).replace(sre, '') || '',
					// chunk/tokenize
					xN = x
						.replace(re, '\u0000$1\u0000')
						.replace(/\u0000$/, '')
						.replace(/^\u0000/, '')
						.split('\u0000'),
					yN = y
						.replace(re, '\u0000$1\u0000')
						.replace(/\u0000$/, '')
						.replace(/^\u0000/, '')
						.split('\u0000'),
					// numeric, hex or date detection
					xD =
						parseInt(x.match(hre), 10) ||
						(xN.length !== 1 && x.match(dre) && Date.parse(x)),
					yD =
						parseInt(y.match(hre), 10) ||
						(xD && y.match(dre) && Date.parse(y)) ||
						null,
					oFxNcL,
					oFyNcL,
					cLoc,
					numS;

				// first try and sort Hex codes or Dates
				if (yD) {
					if (xD < yD) {
						return -1;
					}
					if (xD > yD) {
						return 1;
					}
				}
				// natural sorting through split numeric strings and default strings
				for (
					cLoc = 0, numS = Math.max(xN.length, yN.length);
					cLoc < numS;
					cLoc++
				) {
					// find floats not starting with '0', string or 0 if not defined (Clint Priest)
					oFxNcL =
						(!(xN[cLoc] || '').match(ore) &&
							parseFloat(xN[cLoc])) ||
						xN[cLoc] ||
						0;
					oFyNcL =
						(!(yN[cLoc] || '').match(ore) &&
							parseFloat(yN[cLoc])) ||
						yN[cLoc] ||
						0;
					// handle numeric vs string comparison - number < string - (Kyle Adams)
					if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
						return isNaN(oFxNcL) ? 1 : -1;
					}
					// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
					if (typeof oFxNcL !== typeof oFyNcL) {
						oFxNcL += '';
						oFyNcL += '';
					}
					if (oFxNcL < oFyNcL) {
						return -1;
					}
					if (oFxNcL > oFyNcL) {
						return 1;
					}
				}
				return 0;
			},

			getNaturalSorter: function (field) {
				return function (a, b) {
					var sa = a.get(field),
						sb = b.get(field);
					return this.naturalSortComparator(sa, sb);
				};
			},

			getCaseInsensitiveNaturalSorter: function (field) {
				return function (a, b) {
					var sa = String(a.get(field)).toLowerCase(),
						sb = String(b.get(field)).toLowerCase();
					return this.naturalSortComparator(sa, sb);
				};
			},

			/**
			 * Returns a sorter function for the Array/Ext.Array sort method.
			 *
			 * @param {string} key - name of the field to compare.
			 * @param {string} [dir] - Direction "ASC" or "DESC" defaults to "DESC"
			 * @param {Function} [g] - Getter function, where the value in the array is passed, and the getter returns the comparable.
			 * @param {boolean} [natural] - Sort strings naturally (1 2...10 vs 1 10 2 20 ...etc)
			 * @returns {Function} A comparator function
			 */
			SortModelsBy: function (key, dir, g, natural) {
				function $(v) {
					return (g ? g(v) : v).get(key);
				}

				var n = this.naturalSortComparator;

				return function (a, b) {
					var c = 0,
						$a = $(a),
						$b = $(b);

					if ($a !== $b) {
						c =
							natural && Ext.isString($a)
								? n($a, $b)
								: $a < $b
								? -1
								: 1;

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

			ensureSlash: function (s, atBeginning) {
				if (!s) {
					return;
				}

				var index = atBeginning ? 0 : s.length - 1,
					c = s[index];

				if (c !== '/') {
					if (atBeginning) {
						return '/' + s;
					} else {
						return s + '/';
					}
				}
				return s;
			},

			/*
			 * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
			 */
			guidGenerator: function () {
				function S4() {
					return (((1 + Math.random()) * 0x10000) | 0)
						.toString(16)
						.substring(1);
				}
				return (
					S4() +
					S4() +
					'-' +
					S4() +
					'-' +
					S4() +
					'-' +
					S4() +
					'-' +
					S4() +
					S4() +
					S4()
				);
			},

			isMe: function (user) {
				const { username = '' } = global.$AppConfig || {};
				var id = user;
				if (typeof user !== 'string' && user && user.getId) {
					id = user.getId();
				}
				return username === id;
			},

			getViewIdFromComponent: function (c) {
				return c.up('view-container').id;
			},

			buildBlocker: function (scope, blockTime) {
				var me = scope,
					key = this.guidGenerator(),
					time = blockTime || 500;

				return function () {
					var block = me.hasOwnProperty(key);

					if (block) {
						clearTimeout(me[key]);
					}

					me[key] = setTimeout(function () {
						delete me[key];
					}, time);

					if (block) {
						throw new Error('stop');
					}
				};
			},

			getURLObject: function () {
				var url;

				if (window.URL && window.URL.createObjectURL) {
					url = window.URL;
				} else if (
					window.webkitURL &&
					window.webkitURL.createObjectURL
				) {
					url = window.webkitURL;
				}

				return url;
			},

			getURLParts: function (url) {
				const parsed = new URL(url, global.location.origin);

				return {
					protocol: parsed.protocol,
					pathname: parsed.pathname,
					query: parsed.search
						? parsed.search.replace(/^\?/, '')
						: undefined,
					search: parsed.search,
					hash: parsed.hash,
				};
			},

			getURLRooted: function (url, root) {
				if (!url) {
					return '';
				}

				if (
					this.HOST_PREFIX_PATTERN.test(url) ||
					url.indexOf('/') === 0
				) {
					return url;
				}

				url = this.trimRoute(url);

				if (root) {
					return this.getURLRooted(
						this.trimRoute(root) + '/' + url + '/'
					);
				}

				var host = $AppConfig['server-host'].replace(/\/$/, '');

				url = host + '/' + url;

				if (!this.FILE_EXTENSION_PATTERN.test(url)) {
					url += '/';
				}

				return url;
			},

			getURL: function getU(u, root) {
				if (!u) {
					return '';
				}
				if (!HOST_PREFIX_PATTERN.test(u) && u.indexOf('//') !== 0) {
					if (!Ext.isEmpty(root)) {
						u = root + u;
						return getU(u);
					}
					return $AppConfig['server-host'] + u;
				}
				return u;
			},

			getResourceURL: function (name) {
				var url,
					d = document.createElement('div');
				d.setAttribute('class', name);
				try {
					document.body.appendChild(d);
					url = Ext.fly(d).getStyle('background-image');
					document.body.removeChild(d);
					return /^url\("?([^")]+)"?\)$/.exec(url)[1];
				} catch (e) {
					return null;
				}
			},

			reloadCSS: function (doc) {
				doc = doc || document;
				console.log('Document Title:', doc.title);
				var cb = '_dc=',
					nodes = doc.querySelectorAll('link[rel=stylesheet]'),
					href,
					i = nodes.length - 1,
					v;

				for (i; i > 0; i--) {
					v = nodes[i];
					href = v.getAttribute('href');
					if (href.indexOf(cb) < 0) {
						href +=
							(href.indexOf('?') < 0 ? '?' : '&') +
							cb +
							Ext.Date.now();
					} else {
						href = href.replace(
							new RegExp(RegExp.escape(cb) + '\\d+', 'g'),
							cb + Ext.Date.now()
						);
					}

					v.href = href;
					console.debug(v.getAttribute('href'));
				}
			},

			//taken from the login app
			EMAIL_REGEX:
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

			isEmail: function (email) {
				return this.EMAIL_REGEX.test(email);
			},

			sendEmailTo: function (to, subject, body, cc, bcc) {
				var href = 'mailto:';

				to = (Ext.isArray(to) ? to : [to]).map(x =>
					x.replace(/^mailto:/i, '')
				);
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
				href +=
					'?subject=' +
					subject +
					'&body=' +
					body +
					'&cc=' +
					cc +
					'&bcc=' +
					bcc;

				console.debug('Opening email', href);
				window.location.href = href;
			},
		}).create();

//TODO: figure out how to fix this globals

// global.getURL = exports.getURL.bind(exports);
global.isMe = exports.isMe.bind(exports); //Used in xtemplates >.<

if (typeof document !== 'undefined') {
	exports.stopBackspace(document);
}

exports.handleCache();

function makeImage(prop) {
	var src = exports[prop];

	src = exports.getResourceURL(src);

	if (!src) {
		// console.warn('No Image for: ' + prop);
		return;
	}

	exports[prop] = new Image();
	exports[prop].src = src;
}

makeImage('CANVAS_URL_SHAPE_BROKEN_IMAGE');
makeImage('CANVAS_BROKEN_IMAGE');
