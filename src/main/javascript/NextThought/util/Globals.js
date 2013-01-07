Ext.Loader.setPath('DetectZoom', 'resources/lib/detect-zoom.js');

Ext.define('NextThought.util.Globals', {
	requires: [
		'DetectZoom',
		'NextThought.overrides.app.Application',
		'NextThought.overrides.builtins.Array',
		'NextThought.overrides.builtins.Console',
		'NextThought.overrides.builtins.Node',
		'NextThought.overrides.builtins.Object',
		'NextThought.overrides.builtins.RegExp',
		'NextThought.overrides.data.proxy.Server',
		'NextThought.overrides.data.Connection',
		'NextThought.overrides.dom.Element',
		'NextThought.overrides.draw.engine.Svg',
		'NextThought.overrides.layout.container.Container',
		'NextThought.overrides.panel.Panel',
		'NextThought.overrides.picker.Color',
		'NextThought.overrides.tip.ToolTip',
		'NextThought.overrides.tip.QuickTip',
		'NextThought.overrides.Component',
		'NextThought.overrides.JSON',
		'NextThought.overrides.XTemplate'
	],
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


	//Holy mother of perl! JSLint really hates the javascript protocol. :( We have to really obfuscate that string for it not to complain.
	EMPTY_WRITABLE_IFRAME_SRC : ('javascript' + (function(){return ':';}())),

	getError: function(e){
		return e.stack || e.stacktrace || e;
	},

	stopBackspace: function(doc){
		function fn(){
			return function(e){
				var t = e.getTarget(),
					key = e.getKey(),
					notInput = (!t || (!(/input|textarea/i).test(t.tagName) && !t.getAttribute('contenteditable')));

				if( key === e.ESC || (key === e.BACKSPACE && notInput )){
					console.log('blocking key for: ',t);
					e.stopEvent();
					return false;
				}
				return true;
			};
		}

		Ext.fly(doc).on({
			keydown:fn(),
			keypress: fn()
		});
	},


	validateConfig: function(){
		var HOST_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?$/i,
			HOST_PATTERN_PROTOCOL_MATCH_GROUP = 1,
			HOST_PATTERN_DOMAIN_MATCH_GROUP = 3,
			HOST_PATTERN_PORT_MATCH_GROUP = 5;

		if(typeof $AppConfig === 'undefined' || typeof $AppConfig.server === 'undefined'){
			alert("Bad or no configuation.");
			return false;
		}

		if(typeof $AppConfig.server.login === 'undefined'){
			alert("Bad or no login configuation.");
			return false;
		}

		if(!HOST_PATTERN.test($AppConfig.server.host)){
			if ($AppConfig.server.host) {
				console.warn('Bad host config',$AppConfig.server.host,'using domain', document.domain);
			}
			$AppConfig.server.host = '//'+document.domain;
		}

		if(!/^\/.+\/$/.test($AppConfig.server.data)){
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
	loadScript: function(url, onLoad, onError, scope){
		var head, doc = document,
			script, onLoadFn, onErrorFn;

		function buildCallback(cb,scope){
			return function () {
				script.onload = null;
				script.onreadystatechange = null;
				script.onerror = null;

				if(cb && cb.call) {
					cb.call(scope||window,script);
				}
			};
		}

		if(typeof url === 'object'){
			doc = url.document;
			url = url.url;
		}

		head = typeof doc !== 'undefined' && (doc.head || doc.getElementsByTagName('head')[0]);
		script = doc.createElement('script');
		onLoadFn = buildCallback(onLoad,scope);
		onErrorFn = buildCallback(onError,scope);


		script.type = 'text/javascript';
		script.setAttribute('src',url);
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


	loadScripts: function(urls, onLoad, scope){
		var u, stack = [], errors = false;
		function tick(){
			stack.pop();
			if(stack.length === 0) {
				Ext.callback(onLoad, scope,[errors]);
			}
		}

		function fail(s){
			errors = true;
			console.error('Problem with: '+s.src);
			tick();
		}

		for(u in urls) {
			if (urls.hasOwnProperty(u)){
				stack.push(u);
				Globals.loadScript(urls[u], tick, fail, this);
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
	loadStyleSheet: function(url, onLoad, onFail, scope){
		var t,i=0, doc=document, head, link, call, check;

		if(typeof url === 'object'){
			doc = url.document;
			url = url.url;
		}

		head = typeof doc !== 'undefined' &&
				(doc.head || doc.getElementsByTagName('head')[0]);
		link = doc.createElement('link');
		call = function(cb){
			clearInterval(t);
			if(cb) {
				cb.call(scope||window,link);
			}
		};
		check = function (){
			i++;
			//30 seconds, if each interval is 10ms
			if( i>3000 ) {
				call(onFail);
			}
			else if( link.style ) {
				call(onLoad);
			}
		};

		link.rel='stylesheet';
		link.type = 'text/css';
		link.href = url;

		head.appendChild(link);

		if(onLoad || onFail) {
			t = setInterval(check,10);
		}

		return link;
	},


	handleCache: function(){
		try{
			var ac = window.applicationCache;
			if(!ac) { return; }

			ac.addEventListener('updateready', function(e) {
									if (ac.status === ac.UPDATEREADY) {
										ac.swapCache();
										Ext.MessageBox.confirm(
											'Update Available',
											'A new version of this site is available. Load it now?',
											function(btn){
												if (btn === 'yes'){ window.location.reload(); }
											}
										);
									}
									//else: Manifest didn't changed. Nothing new to do.
								}, false);
		}
		catch(error){
			console.error('Error handling html5 app cache', error);
		}
	},


	getAsynchronousTaskQueueForList: function(s){
		var list = [], i = (s.length||s)-1;
		for(i; i > 0; i--){ list.push({}); }
		return list;
	},


	removeLoaderSplash: function(){
		var me = this;
		me.removeLoaderSplash = Ext.emptyFn;
		setTimeout( function(){ Ext.get('loading-mask').fadeOut({remove:true}); }, 100);
	},


	arrayEquals: function(a, b) {
		var l = a.length;
		if (l !== b.length) {
			return false;
		}
		return Ext.Array.merge(a, b).length === l;
	},


	/**
	 *
	 * @param key
	 * @param dir
	 * @param [g] Getter function
	 */
	SortModelsBy: function(key,dir,g){
		function $(v){
			return (g? g(v) : v).get(key);
		}

		return function(a,b){
			var c = 0, $a = $(a), $b = $(b);

			if($a !== $b){
				c = $a < $b? -1 : 1;
			}

			return c;

		};
	},

	ensureSlash: function(s, atBeginning) {
		if (!s){return;}

		var index = atBeginning ? 0 : (s.length - 1),
			c = s[index];

		if (c !=='/'){
			if (atBeginning) {return '/'+s;}
			else {return s + '/';}
		}
		return s;
	},


	/**
	 * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	 */
	guidGenerator: function() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},


	isMe: function(user){
		var id = user;
		if(typeof user !== 'string' && user.getId){
			id = user.getId();
		}
		return $AppConfig.username === id;
	},


	getViewIdFromComponent: function(c) {
		return c.up('view-container').id;
	},

	buildBlocker: function(scope, blockTime){
		var me = scope,
			key = this.guidGenerator(),
			time = blockTime || 500;

		return function (){
			var block = me.hasOwnProperty(key);

			if(block){ clearTimeout(me[key]); }

			me[key] = setTimeout(
					function(){ delete me[key]; },
					time);

			if(block){
				throw 'stop';
			}
		};
	},

	getURL: function(u) {
		if (!u){u = '';}
		if(!Globals.HOST_PREFIX_PATTERN.test(u) && u.indexOf('//') !== 0){
			return $AppConfig.server.host + u;
		}
		return u;
	},

	getResourceURL: function(name){
		var url, d = document.createElement('div');
		d.setAttribute('class',name);
		document.body.appendChild(d);
		url = Ext.fly(d).getStyle('background-image');
		document.body.removeChild(d);
		try{
		return (/^url\((.*)\)$/).exec(url)[1];
		}
		catch(e){
			return null;
		}
	}

},
function(){
	var proto = '__proto__';
	window.Globals = this;
	window.guidGenerator = this.guidGenerator;
	window.isMe = this.isMe;
	window.getURL = this.getURL;
	window.swallow = function(e){};
	window.getResourceURL = this.getResourceURL;

	this.stopBackspace(document);

	this.handleCache();



	Ext.Object.each(this[proto],function(k,v,o){
		if(/_IMAGE$/.test(k) && typeof(v) === 'string'){
			o[k] = new Image();
			o[k].src = getResourceURL(v);
		}
	});
});
