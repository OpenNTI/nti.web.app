Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.ContentAPIRegistry',
		'NextThought.providers.Location',
		'NextThought.util.QuizUtils',
		'NextThought.view.widgets.Tracker'
	],
	mixins:{
		annotations: 'NextThought.mixins.Annotations'
	},
	cls: 'x-reader-pane',

	layout: 'anchor',

	initComponent: function() {
		var me = this;
		this.loadedResources = {};
		this.addEvents('loaded','finished-restore');
		this.enableBubble('loaded','finished-restore');
		this.callParent(arguments);
		Ext.applyIf(me, {
			tracker: null,
			prefix: 'default'
		});

		this.add({
			xtype: 'box',
			anchor: '100%',
			cls:'x-panel-reset',
			margin: this.tracker === false ? 0 : '0 0 0 50px',
			autoEl: {
				tag: 'iframe',
				name: guidGenerator()+'-content',
				src: Ext.SSL_SECURE_URL,
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				transparent: true,
				scrolling: 'no',
				style: 'overflow: hidden'
			},
			listeners: {
				scope: this,
				afterRender: function(){
					// must defer to wait for browser to be ready
					var task = { interval : 10 };
					task.run = function() {
						var doc = me.getDocumentElement();
						if (doc.body || doc.readyState === 'complete') {
							Ext.TaskManager.stop(task);
							me.initContentFrame();
						}
					};
					Ext.TaskManager.start(task);
				}
			}
		});

		this.mixins.annotations.initAnnotations.call(this);

		this.checkFrame = Ext.bind(this.checkFrame,this);

		this.meta = {};
		this.css = {};
		this.nav = {};
	},



	initContentFrame: function(){
		var me = this,
			base = location.pathname,
			host = $AppConfig.server.host,
			doc = me.getDocumentElement();

		function on(dom,event,fn){
			if(dom.addEventListener) {
				dom.addEventListener(event,fn,false);
			}
			else if(dom.attachEvent) {
				dom.attachEvent(event,fn);
			}
		}

		doc.firstChild.setAttribute('class','x-panel-reset');
		doc.body.setAttribute('class','x-panel-body');

		Globals.loadStyleSheet({
			url: base+document.getElementById('main-stylesheet').getAttribute('href'),
			document: doc });

		Globals.loadScript(
			{ url: host+'/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML', document: doc },
			function(){
				Globals.loadScript({ url: base+'assets/misc/mathjaxconfig.js', document: doc });
			}
		);

		on(doc,'mousedown',function(){ Ext.menu.Manager.hideAll(); });
		on(doc,'contextmenu',function(e){
			e = Ext.EventObject.setEvent(e||event);
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		on(doc,'click',function(e){
			var evt = Ext.EventObject.setEvent(e||event), target = evt.getTarget();
			while(target && target.tagName !== 'A'){ target = target.parentNode; }
			if(target){ me.onClick(evt, target); }
		});
		on(doc,'mouseup',function(e){
			var fakeEvent = Ext.EventObject.setEvent(e||event),
				t = me.body.getScroll().top;
			me.onContextMenuHandler({
				getTarget: function(){ return fakeEvent.getTarget(); },
				preventDefault: function(){ fakeEvent.preventDefault(); },
				stopPropagation: function(){ fakeEvent.stopPropagation(); },
				getXY: function(){
					var xy = fakeEvent.getXY();
					xy[1] -= t;
					return xy;
				}
			});
		});

		ContentAPIRegistry.on('update',me.applyContentAPI,me);
		me.applyContentAPI();
		me.setSplash();
		me.syncInterval = setInterval( me.checkFrame, 50 );
	},


	applyContentAPI: function(){
		var doc = this.getDocumentElement(),
			win = doc.ownerWindow;

		Ext.Object.each(ContentAPIRegistry.getAPI(),function(f,n){
			win[f] = n;
		});

	},


	getAnnotationOffsets: function(){
		return {
			top: this.getIframe().getTop(),
			left: this.getIframe().getMargin('l')
		};
	},

	onContextMenuHandler: function(){
		return this.mixins.annotations.onContextMenuHandler.apply(this,arguments);
	},


	checkFrame: function(){
		var doc = this.getDocumentElement(),
			body = doc.body, h;
		if (body) {
			h = Ext.get(body).getHeight();
			if(h !== this.lastHeight){
				this.lastHeight = h;
				this.syncFrame();
			}
			if(Ext.Date.now()-this.lastFrameSync > 500){
				clearInterval(this.syncInterval);
				this.syncInterval = setInterval(this.checkFrame,500);
			}
		}
	},

	syncFrame: function(){
		var doc = this.getDocumentElement(),
			b = Ext.get(doc.body || doc.documentElement),
			i = this.getIframe();

		i.setHeight(this.el.getHeight()-100);
		i.setHeight(b.getHeight()+100);

		this.fireEvent('resize');
		this.doLayout();

		this.lastFrameSync = Ext.Date.now();
	},

	getIframe: function(){
		return this.items.first().el;
	},


	/** @private */
	setContent: function(html) {
		var doc = this.getDocumentElement();
		this.getIframe().setHeight(0);
		Ext.get(doc.body || doc.documentElement).update(html);
		clearInterval(this.syncInterval);
		this.syncInterval = setInterval(this.checkFrame,50);
	},

	getDocumentElement: function(){
		var iframe, win, doc = this.contentDocumentElement;

		if(!doc){
			iframe = this.getIframe().dom;
			win = (Ext.isIE ? iframe.contentWindow : window.frames[iframe.name]);
			doc = (!Ext.isIE && iframe.contentDocument) || win.document;
			doc.ownerWindow = win;

			this.contentDocumentElement = doc;
		}

		return doc;
	},


	scrollToId: function(id) {
		var n = Ext.getCmp(id), m;

		if(n) {
			this.scrollToNode(n.getEl().dom);
			if (n.getMenu) {
				m = n.getMenu();
				if (m && m.items.getCount() === 1) {
					//a single menu item, might as well click it for them
					m.items.first().handler.call(window);
				}
			}
		}
		else {
			console.error('Could not find Component with id: ',id);
		}
	},


	scrollToTarget: function(target){
		var e = this.el.query('*[name='+target+']');
		if(!e || !e.length) {
			console.warn('scrollToTarget: no target found: ',target);
		}
		else {
			this.scrollToNode(e[0]);
		}
	},


	scrollToNode: function(n) {
		while(n && n.nodeType === Node.TEXT_NODE) {
			n = n.parentNode;
		}
		var c = Ext.get('readerPanel-body');
		var o = (Ext.get(n).getOffsetsTo(c)[1]);
		this.scrollTo( c.dom.scrollTop + o - 10);
	},


	scrollTo: function(top, animate) {
		this.body.scrollTo('top', top, animate!==false);
	},


	scrollToText: function(text) {
		if (!text) {
			return;
		}

		text = text.toLowerCase();

		var me = this,
			doc = me.getDocumentElement(),
			ranges = [],
			created = {},
			texts, node, nv, r, index,
			textLength = text.length;

		texts = doc.evaluate('.//text()', doc,
				null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,
				null);

		while(!!(node = texts.iterateNext())){
			nv = node.nodeValue.toLowerCase();

			index = nv.indexOf(text);
			while(index >= 0) {
				r = doc.createRange();
				r.setStart(node, index);
				r.setEnd(node, index + textLength);

				if (!created[nv] || !created[nv][index]) {
					created[nv] = created[nv] || {} ;
					created[nv][index] = true;
					ranges.push(r);
				}
				index = nv.indexOf(text, index + 1);
			}
		}

		me.showRanges(ranges);
		me.scrollTo(ranges[0].getClientRects()[0].top - 150);
	},


	getContainerId: function() {
		return this.meta.NTIID;
	},


	render: function(){
		this.callParent(arguments);
		this.splash = this.body.insertHtml('beforeEnd','<div class="no-content-splash"></div>',true);

		if (this.tracker !== false) {
			if(this.tracker){
				this.tracker.destroy();
				delete this.tracker;
				console.log('clearing old tracker...');
			}

			this.tracker = Ext.widget('tracker', this, this.getIframe().dom);
		}
	},

	loadPage: function(ntiid, callback) {
		var me = this,
			service = $AppConfig.service;

		if(ntiid === me.getContainerId()){
			Globals.callback(callback,null,[me]);
			return false;
		}

		me.clearAnnotations();

		function success(resp){
			me.splash.hide();
			me.setReaderContent(resp, callback);
		}

		function failure(q,r){
			console.error(arguments);
			Globals.callback(callback,null,[{req:q,error:r}]);
			if(r && r.responseText){
				me.splash.hide();
				me.setContent(r.responseText);
			}
			me.relayout();
		}

		if(ntiid) {
			me.request = service.getObjectRaw(ntiid, success, failure, me);
		}
		else {
			this.setSplash();
			this.relayout();
			Globals.callback(callback,null,[me]);
		}

		return true;
	},


	setSplash: function(){
		this.scrollTo(0, false);
		this.setContent('');
		this.splash.dom.parentNode.appendChild(this.splash.dom);
		this.splash.show();
	},


	setReaderContent: function(resp, callback){
		var me = this,
			c = me.parseHTML(resp),
			containerId;

		function onFinishLoading() {
			me.relayout();
			Globals.callback(callback,null,[me]);
			me.fireEvent('loaded', containerId);
		}

		me.setContent('<div id="NTIContent">'+c+'</div>');
		me.containerId = null;
		me.scrollTo(0, false);

		containerId = me.getContainerId();

		me.loadContentAnnotations(containerId, onFinishLoading);
	},


	parseHTML: function(request){
		function path(s){
			var p = s.split('/'); p.splice(-1,1,'');
			return p.join('/');
		}

		function toObj(a,k,v){
			var i=a.length-1, o = {};
			for(; i>=0; i--){ o[k.exec(a[i])[2]] = v.exec(a[i])[1]; }
			return o;
		}

		function metaObj(m){
			return toObj(m, /(name|http\-equiv)="([^"]+)"/i, /content="([^"]+)"/i);
		}

		function navObj(m){
			return toObj(m, /rel="([^"]+)"/i, /href="([^"]+)"/i);
		}

		function cssObj(m){
			var i = m.length-1, k=/href="([^"]*)"/i, o, c = {};
			for(; i>=0; i--){
				o = basePath + k.exec(m[i])[1];
				c[o] = {};
				if(!rc[o]) {
					rc[o] = c[o] = Globals.loadStyleSheet({
						url:o,
						document: me.getDocumentElement()
					});
				}
			}
			//remove resources not used anymore...
			Ext.Object.each(rc,function(k,v,o){
				if(!c[k]){
					Ext.fly(v).remove();
					delete o[k];
				}
			});
			return c;
		}

		var me = this,
			basePath = path(request.responseLocation),
			rc = me.loadedResources,

			c = request.responseText,
			rf= c.toLowerCase(),

			start = rf.indexOf(">", rf.indexOf("<body"))+1,
			end = rf.indexOf("</body"),

			head = c.substring(0,start).replace(/[\t\r\n\s]+/g,' '),
			body = c.substring(start, end);

		this.meta = metaObj( head.match(/<meta[^>]*>/gi) || [] );
		this.nav = navObj( head.match( /<link[^<>]+rel="(?!stylesheet)([^"]*)"[^<>]*>/ig) || []);
		this.css = cssObj( head.match(/<link[^<>]*?href="([^"]*css)"[^<>]*>/ig) || []);

		return this.fixReferences(body,basePath);
	},



	fixReferences: function(string, basePath){

		function fixReferences(original,attr,url) {
			var firstChar = url.charAt(0),
				absolute = firstChar ==='/',
				anchor = firstChar === '#',
				external = me.externalUriRegex.test(url),
				host = absolute?$AppConfig.server.host:basePath,
				match;

			if(/src/i.test(attr) && /youtube/i.test(url)){
				match = url.match(/youtube.com\/embed\/([^\?&#]+)/i);
				return "src=assets/wrappers/youtube.html?host=" +
						encodeURIComponent($AppConfig.server.host) +
						'&videoId='+encodeURIComponent(match[1]) +
						'&original='+encodeURIComponent(url) +
						'&_dc='+Ext.Date.now();
			}

			//inline
			return (anchor || external || /^data:/i.test(url)) ?
					original : attr+'="'+host+url+'"';
		}

		var me = this;

		return string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
	},


	externalUriRegex : /^([a-z][a-z0-9\+\-\.]*):/i,


	onClick: function(e, el){
		e.stopPropagation();
		e.preventDefault();
		var m = this,
			r = el.href,
			hash = r.split('#'),
			newLocation = hash[0],
			target = hash[1],
			whref = window.location.href.split('#')[0];

		if (whref+'#' === r) {
			return;
		}

		//pop out links that point to external resources
		if(!/tag:nextthought\.com/i.test(r) && m.externalUriRegex.test(r)){
			//popup a leaving platform notice here...
			window.open(r, guidGenerator());
			return;
		}

		LocationProvider.setLocation(newLocation, function(me){
			if(target) {
				me.scrollToTarget(target);
			}
		});
	}

});

