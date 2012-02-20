/* DATASERVER 2 Constants*/
RECURSIVE_STREAM = 'RecursiveStream';
USER_GENERATED_DATA = 'UserGeneratedData';
USER_SEARCH_REL = 'UserSearch';
USER_GENERATED_DATA_SEARCH_REL = 'UGDSearch';

ASCENDING = {};
DESCENDING = {};

HOST_PREFIX_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?/i;
HOST_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?$/i;
HOST_PATTERN_PROTOCOL_MATCH_GROUP = 1;
HOST_PATTERN_DOMAIN_MATCH_GROUP = 3;
HOST_PATTERN_PORT_MATCH_GROUP = 5;

CENTER_WIDTH = 768;
MIN_SIDE_WIDTH = 175;
MIN_WIDTH = 768;


Ext.define('NextThought.util.Globals',
{
	requires: [
		'Ext.draw.Draw'//for fixing the path2curve function
	],
	alternateClassName: 'Globals',
	singleton: true,


	/**
	 * Loads a script into the dom
	 *
	 * @param url
	 * @param [onLoad]
	 * @param [onError]
	 * @param [scope]
	 */
	loadScript: function(url, onLoad, onError, scope){
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

		var head = typeof document !== 'undefined' && (document.head || document.getElementsByTagName('head')[0]),
			script = document.createElement('script'),
			onLoadFn = buildCallback(onLoad,scope),
			onErrorFn = buildCallback(onError,scope);


		script.type = 'text/javascript';
		script.src = Ext.urlAppend(url, Ext.String.format('_dc={0}',Ext.Date.now()));
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
				Globals.callback(onLoad, scope,[errors]);
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
		var t, i=0,
			head = typeof document !== 'undefined' &&
				(document.head || document.getElementsByTagName('head')[0]),
			link = document.createElement('link'),
			call = function(cb){
				clearInterval(t);
				if(cb) {
					cb.call(scope||window,link);
				}
			},
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


	removeLoaderSplash: function(){
		var me = this;
		me.removeLoaderSplash = Ext.emptyFn;
		setTimeout( function(){ Ext.get('loading-mask').fadeOut({remove:true}); }, 100);
	},


	applyHooks:  function(){
		this.ensureConsole();
		this.ensureNodePrototypes();

		window.alert = function(title, msg){
			Globals.removeLoaderSplash();
			if(arguments.length===1){
				msg = title;
				title = null;
			}
			Ext.MessageBox.alert(title||'Alert', msg );
		};

		Ext.JSON.encodeDate = function(d){return Ext.Date.format(d, 'U');};

		Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
		Ext.Ajax.defaultHeaders.Accept= 'application/vnd.nextthought+json';
		Ext.Ajax.timeout=10000;//10sec timeout
		Ext.Ajax.on('beforerequest', this.beforeRequest);

		//disable selection everywhere except places we specifically enable it.
		this.disableSelection();


		this.applyInjections();
	},


	applyInjections: function(){

		Ext.applyIf(Array.prototype,{
			first: function peek(){ return this[0]; },
			last: function peek(){ return this[this.length-1]; },
			peek: function peek(){ return this[this.length-1]; }
		});

		Ext.applyIf(RegExp,{
			escape:function me(text) {
				if(!me.Re){
					me.Re = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
				}
			    return text.replace(me.Re, "\\$&");
			}
		});

		//
		this.fixSvgPath2CurveMethod();

		//inject a new function into Ext.Element
		Ext.apply(Ext.Element.prototype,{

			/**
			 * @param el
			 * @returns True if the element is within view of the container, False otherwise
			 */
			isInView: function(el){
				var p = Ext.get(el) || this.parent(),
					scroll = p.getScroll(),
					size = p.getSize(),
					y1 = scroll.top,
					y2 = y1 + size.height,

					top = this.getTop()-p.getTop(),
					bottom = top+this.getHeight();

				return y1 <= top	&& top <= y2	&&
						bottom<=y2	&& bottom>=y1;

			}

		});

		Ext.apply(Ext.app.Application.prototype,{

			registerInitializeTask: function(task) {
				this.initTasks = this.initTasks || [];
				this.initTasks.push(task);
			},

			finishInitializeTask: function(task){
				Ext.Array.remove(this.initTasks,task);
				if(!this.initTasks.length) {
					this.registerInitializeTask = this.finishInitializeTask = Ext.emptyFn;
					this.fireEvent('finished-loading');
				}
			}
		});

		Ext.Ajax.cors = true;
		Ext.Ajax.disableCaching = true;
		Ext.data.proxy.Server.override({noCache: true});
		Ext.data.Connection.override({
			disableCaching: true,

			setOptions: function(options, scope){
				var i, badParams = [/*'_dc',*/ 'id', 'page', 'start', 'limit', 'group', 'sort'],
					params = options.params || {};

				if (Ext.isFunction(params)) {
					console.warn('Params were a function!');
					options.params = (params = params.call(scope, options));
				}

				for(i in badParams){
					if(badParams.hasOwnProperty(i)){
						delete params[badParams[i]];
					}
				}

				return this.callOverridden(arguments);
			}
		});
	},


	fixSvgPath2CurveMethod: function(){
		if(Ext.versions.extjs.isGreaterThan('4.0.7')) {
			return;
		}

		Ext.apply(Ext.draw.Draw,{
			/**
			 * Fix the frameworks implementation of this method.
			 * @param path
			 */
			path2curve: function (path) {
				var me = this,
					points = me.pathToAbsolute(path),
					ln = points.length,
					attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
					i, seg, segLn, point;

				for (i = 0; i < ln; i++) {
					points[i] = me.command2curve(points[i], attrs);
					if (points[i].length > 7) {
							points[i].shift();
							point = points[i];
							while (point.length) {
								Ext.Array.splice(points, i++, 0, ["C"].concat(Ext.Array.splice(point, 0, 6)));
							}
							Ext.Array.erase(points, i, 1);
							ln = points.length;
							i--;//forloop will double increment this if we don't roll it back...
						}
					seg = points[i];
					segLn = seg.length;
					attrs.x = seg[segLn - 2];
					attrs.y = seg[segLn - 1];
					attrs.bx = parseFloat(seg[segLn - 4]) || attrs.x;
					attrs.by = parseFloat(seg[segLn - 3]) || attrs.y;
				}
				return points;
			}
		});
	},


	disableSelection: function(){
		Ext.getBody().unselectable();
		Ext.panel.Panel.override({
			render: function(){
				this.callOverridden(arguments);
				if(!this.enableSelect){this.el.unselectable();}
				else{this.el.selectable();}
			}
		});
	},


	ensureNodePrototypes: function(){
		Ext.applyIf(Node.prototype, {
			DOCUMENT_POSITION_DISCONNECTED: 1,
			DOCUMENT_POSITION_PRECEDING: 2,
			DOCUMENT_POSITION_FOLLOWING: 4,
			DOCUMENT_POSITION_CONTAINS: 8,
			DOCUMENT_POSITION_CONTAINED_BY: 16,
			DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
			TEXT_NODE: 3
		});
	},


	ensureConsole: function(){
		var log;

		Ext.applyIf(window,{
			console:{
				log: function(){}
			}
		});

		log = Ext.Function.alias(console, 'log');

		Ext.applyIf(window.console,{
			debug: log,
			info: log,
			warn: log,
			error: log,
			group: Ext.emptyFn,
			groupCollapsed: Ext.emptyFn,
			groupEnd: Ext.emptyFn
		});

	},


	beforeRequest: function(connection,options) {
		if(options&&options.async===false){
			var loc;
			try { loc = printStackTrace().splice(7); }
			catch (e) { loc = e.stack || e.stacktrace; }
			console.warn( 'Synchronous Call in: ', loc, ' Options:', options );
		}
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
	 * @param g Getter function
	 */
	SortModelsBy: function(key,dir,g){
		var less = dir===ASCENDING? -1 : 1,
			more = dir===ASCENDING? 1 : -1;

		function $(v){
			return (g? g(v) : v).get(key);
		}

		return function(a,b){
			var c = 0, $a = $(a), $b = $(b);

			if($a !== $b){
				c = $a < $b? less : more;
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
	 * Call a function and return its value
	 *
	 * Will ignore non-functions.
	 *
	 * @param fn - function to call
	 * @param scope - scope of the function's invocation
	 * @param args - arguments array
	 */
	callback: function(fn, scope, args){
		if(!Ext.isFunction(fn)){
			return false;
		}

		return fn.apply(scope||window, args);
	},


	/**
	 * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	 */
	guidGenerator: function() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
},
function(){
	document.head = document.head || document.getElementsByTagName('head')[0];
	window.Globals = this;

	Ext.Loader.setPath('Ext.ux', (function(){
		var path = Ext.Loader.getPath('Ext').split('/');
		path.splice(-1, 1, 'examples/ux');
		return path.join('/');
	}()));

	this.applyHooks();

	window.guidGenerator = this.guidGenerator;
});
