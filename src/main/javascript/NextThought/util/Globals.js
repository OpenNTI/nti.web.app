Ext.define('NextThought.util.Globals', {
	singleton: true,


	/* DATASERVER 2 Constants*/
	RECURSIVE_STREAM: 'RecursiveStream',
	RECURSIVE_USER_GENERATED_DATA: 'RecursiveUserGeneratedData',
	USER_GENERATED_DATA: 'UserGeneratedData',
	USER_SEARCH_REL: 'UserSearch',
	USER_RESOLVE_REL: 'ResolveUser',
	USER_GENERATED_DATA_SEARCH_REL: 'UGDSearch',
	USER_UNIFIED_SEARCH_REL: 'UnifiedSearch',
	CONTENT_ROOT: 'tag:nextthought.com,2011-10:Root',

	HOST_PREFIX_PATTERN: /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?/i,
	INVALID_CHARACTERS_PATTERN: /^[^\/\\";=?<>#%'\{\}\|\^\[\]\-]+$/,


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

	getError: function(e) {
		return e.stack || e.stacktrace || e;
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
			$AppConfig.server.host = '//' + document.domain;
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
	 * @param url
	 * @param [onLoad]
	 * @param [onError]
	 * @param [scope]
	 */
	loadScript: function(url, onLoad, onError, scope, bustCache) {
		var head, doc = document,
			script, onLoadFn, onErrorFn;

		function buildCallback(cb,scope) {
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

		head = typeof doc !== 'undefined' && (doc.head || doc.getElementsByTagName('head')[0]);
		script = doc.createElement('script');
		onLoadFn = buildCallback(onLoad, scope);
		onErrorFn = buildCallback(onError, scope);

		if (bustCache === true) {
			url += (url.indexOf('?') < 0 ? '?' : '&') + '_dc=' + (new Date().getTime());
		}

		script.type = 'text/javascript';
		script.setAttribute('src', url);
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


	/**
	 * Load a stylesheet file (.css) into the DOM.
	 *
	 * @param url
	 * @param [onLoad]
	 * @param [onFail]
	 * @param [scope] Context object to execute the onLoad/onFail callbacks
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
		setTimeout(function() { Ext.get('loading-mask').fadeOut({remove: true}); }, 100);
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
	    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
	        sre = /(^[ ]*|[ ]*$)/g,
	        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
	        hre = /^0x[0-9a-f]+$/i,
	        ore = /^0/,
	        i = function(s) { return naturalSort.insensitive && ('' + s).toLowerCase() || '' + s };,
	        // convert all to strings strip whitespace
	        x = i(a).replace(sre, '') || '',
	        y = i(b).replace(sre, '') || '',
	        // chunk/tokenize
	        xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
	        yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
	        // numeric, hex or date detection
	        xD = parseInt(x.match(hre), 10) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
	        yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null,
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
		return function(a,b) {
			var sa = a.get(field), sb = b.get(field);
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
	SortModelsBy: function(key,dir,g,natural) {
		function $(v) {
			return (g ? g(v) : v).get(key);
		}

		var n = Globals.naturalSortComparator;

		return function(a,b) {
			var c = 0, $a = $(a), $b = $(b);

			if ($a !== $b) {
				c = natural && Ext.isString($a)
						? n($a, $b)
						: $a < $b ? -1 : 1;

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
		if (typeof user !== 'string' && user.getId) {
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

	getURL: function(u,root) {
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
		document.body.appendChild(d);
		url = Ext.fly(d).getStyle('background-image');
		document.body.removeChild(d);
		try {
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


	getExternalizedString: function(key, defaultValue) {
		var v = (window.NTIStrings || {})[key] || defaultValue || key || '';

		if (v instanceof Array) {
			v = v[Math.floor(Math.random() * 100) % v.length];
		}

		return v;
	}

},
function() {
	var proto = '__proto__';
	window.Globals = this;
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
		Globals[prop] = new Image();
		Globals[prop].src = getResourceURL(src);
	}
	makeImage('CANVAS_URL_SHAPE_BROKEN_IMAGE');
	makeImage('CANVAS_BROKEN_IMAGE');

	window.getString = this.getExternalizedString;
});
