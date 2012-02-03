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
					cb.call(scope||window);
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
		setTimeout(
			function clearMask(){
				Ext.get('loading').remove();
				Ext.get('loading-mask').fadeOut({remove:true});
				me.resizeBlocker(Ext.Element.getViewWidth());
			},
			100);

	},


	applyHooks:  function(){
		this.ensureConsole();
		this.ensureNodePrototypes();

		Ext.JSON.encodeDate = function(d){return Ext.Date.format(d, 'U');};

		Ext.Ajax.timeout=10000;//10sec timeout
		Ext.Ajax.on('beforerequest', this.beforeRequest);
		Ext.EventManager.onWindowResize(this.resizeBlocker);

		//disable selection everywhere except places we specifically enable it.
		this.disableSelection();


		this.applyInjections();
	},


	applyInjections: function(){

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


		Ext.Ajax.cors = true;
		Ext.Ajax.disableCaching = false;
		Ext.data.proxy.Server.override({noCache: false});
		Ext.data.Connection.override({
			disableCaching: false,

			setOptions: function(options, scope){
				var i, badParams = ['_dc', 'id', 'page', 'start', 'limit', 'group', 'sort'],
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
		var console = window.console;
		if(!console){
			console = {log: function(){}};
			window.console = console;
		}
		if(!console.debug){
			console.debug = Ext.Function.alias(console, 'log');
		}
		if(!console.info){
			console.info = Ext.Function.alias(console, 'log');
		}
		if(!console.warn){
			console.warn = Ext.Function.alias(console, 'log');
		}
		if(!console.error){
			console.error = Ext.Function.alias(console, 'log');
		}
	},


	beforeRequest: function(connection,options) {
		if(options&&options.async===false){
			var loc;
			try { loc = printStackTrace().splice(7); }
			catch (e) { loc = e.stack || e.stacktrace; }
			console.warn( 'Synchronous Call in: ', loc, ' Options:', options );
		}
	},


	resizeBlocker: function(w){
		var i = Boolean(w<MIN_WIDTH),
			b = Ext.getBody(),
			m = b.isMasked();

		if(i && !m) { b.mask("Your browser window is too narrow","body-mask"); }
		else if(!i && m) { b.unmask(); }
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

		function _(v){
			return (g? g(v) : v).get(key);
		}

		return function(a,b){
			var c = 0, _a = _(a), _b = _(b);

			if(_a !== _b){
				c = _a < _b? less : more;
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
	}
},
function(){
	document.head = document.head || document.getElementsByTagName('head')[0];
	window.Globals = this;
	window.guidGenerator = this.guidGenerator;
});
