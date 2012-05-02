Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Base',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.ContentAPIRegistry',
		'NextThought.providers.Location',
		'NextThought.util.QuizUtils'
	],
	mixins:{
		annotations: 'NextThought.mixins.Annotations'
	},
	cls: 'x-reader-pane',

	ui: 'reader',
	layout: 'anchor',

	initComponent: function() {
		var jsPrefix = 'javascript'; //this in var to trick jslint

		this.loadedResources = {};
		this.addEvents('loaded','finished-restore');
		this.enableBubble('loaded','finished-restore');
		this.on('afterrender',this.postRender,this);

		this.callParent(arguments);
		Ext.applyIf(this, {
			prefix: 'default',
			padding: 0
		});

		this.add({
			xtype: 'box',
			anchor: '100%',
			autoEl: {
				tag: 'iframe',
				name: guidGenerator()+'-content',
				src: jsPrefix + ':',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				scrolling: 'no',
				seamless: true,
				transparent: true,
				allowTransparency: true,
				style: 'overflow: hidden'
			},
			listeners: {
				scope: this,
				afterRender: this.resetFrame
			}
		});

		this.mixins.annotations.initAnnotations.call(this);

		this.checkFrame = Ext.bind(this.checkFrame,this);
		this.checkContentFrames = Ext.Function.createBuffered(this.checkContentFrames,100);

		this.meta = {};
		this.css = {};
//		this.nav = {};

		this.self.classEvents.on('window-drag-start',this.mask,this);
		this.self.classEvents.on('window-drag-end',this.unmask,this);
	},


	destroy: function(){
		this.self.classEvents.un('window-drag-start',this.mask,this);
		this.self.classEvents.un('window-drag-end',this.unmask,this);
		this.callParent(arguments);
	},


	mask: function(){var e=this.el;if(e){e.mask();}},
	unmask: function(){var e=this.el;if(e){e.unmask();}},

	resetFrame: function(cb){
		console.log('resetFrame');

		// must defer to wait for browser to be ready
		var me = this,
			jsPrefix = 'javascript', //this in var to trick jslint
			task = { interval : 100 },
			doc = me.getDocumentElement();

		doc.open();
		doc.close();
		doc.parentWindow.location.replace(jsPrefix+':');
		me.loadedResources = {};

		if(Ext.isIE9){
			this.getIframe().setStyle({
				'position': 'relative',
				'z-index': '1'
			});
		}


		delete this.contentDocumentElement;

		task.run = function() {
			var doc = me.getDocumentElement();
			if (doc.body || doc.readyState === 'complete') {
				Ext.TaskManager.stop(task);
				me.initContentFrame();
				if(cb){
					Globals.callback(cb,me);
				}
			}
		};
		setTimeout(function(){Ext.TaskManager.start(task);},200);
	},




	initContentFrame: function(){
		console.log('frame initialized, setting up...');
		var me = this,
			base = location.pathname.toString().replace('index.html',''),
			doc = me.getDocumentElement(),
			meta, g = Globals;

		function on(dom,event,fn){
			if(dom.addEventListener) {
				dom.addEventListener(event,fn,false);
			}
			else if(dom.attachEvent) {
				dom.attachEvent(event,fn);
			}
		}

		function addCSS(cssStr){
			var el= doc.createElement('style');

			el.type= 'text/css';
			el.media= 'screen';

			if(el.styleSheet){ el.styleSheet.cssText= cssStr; }// IE method
			else { el.appendChild(document.createTextNode(cssStr)); } // others

			doc.getElementsByTagName('head')[0].appendChild(el);
			return el;
		}

		doc.parentWindow.onerror = function(){console.log('iframe error: ',JSON.stringify(arguments));};

		doc.firstChild.setAttribute('class','x-panel-reset');
		doc.body.setAttribute('class','x-panel-body');

		meta = doc.createElement('meta');
		//<meta http-equiv="X-UA-Compatible" content="IE=edge">
		meta.setAttribute('http-equiv','X-UA-Compatible');
		meta.setAttribute('content','IE=edge');
		doc.getElementsByTagName('head')[0].appendChild(meta);

		g.loadStyleSheet({
			url: base+document.getElementById('main-stylesheet').getAttribute('href'),
			document: doc });

		//hide all sub-iframes initially.
		addCSS("iframe{display:none;}");

		//Quiz Dependencies: Load MathQuill
		g.loadStyleSheet({ url: base+'assets/lib/mathquill/mathquill.css', document: doc });
		g.loadScript({url: '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js', document: doc},
			function(){
				g.loadScript({ url: base+'assets/lib/mathquill/mathquill.min.js', document: doc }); });

		//Quiz Dependencies: Load MathJax 1.1 (2.0 buggy)
		g.loadScript(
			{ url: 'https://d3eoax9i5htok0.cloudfront.net/mathjax/1.1-latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML', document: doc },
			function(){ g.loadScript({ url: base+'assets/misc/mathjaxconfig.js', document: doc }); });


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
		if(me.syncInterval){
			clearInterval(me.syncInterval);
		}
		me.syncInterval = setInterval( me.checkFrame, Ext.isIE? 500 : 100 );
	},


	applyContentAPI: function(){
		var doc = this.getDocumentElement(),
			win = doc.parentWindow;

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

	checkContentFrames: function(){
		var me = this,
			doc = me.getDocumentElement(),
			view = me.body,
			container = doc.getElementById('NTIContent'),
			scrollTop = view.getScroll().top - 10,
			viewHeight = view.getHeight(),
			frames = doc.querySelectorAll('iframe'),
			bounds = scrollTop + viewHeight,
			display = 'display:block;',
//			contentHeight = container.clientHeight,
			w = doc.parentWindow;

		if(!w.$){
			setTimeout(function(){me.checkContentFrames();},50);
			return;
		}

		function getTop(x) {
			var curtop = 0;
			if (x.offsetParent) {
				do {
					if (x.currentStyle) {
						curtop += +parseInt(x.currentStyle['margin-top'],10);
					}
					else if (w.getComputedStyle) {
						curtop += +parseInt(doc.defaultView.getComputedStyle(x,null).getPropertyValue('margin-top'),10);
					}
					curtop += x.offsetTop;
					x = x.offsetParent;
				} while (x);
			}
			return curtop;
		}

		Ext.each(frames,function(f){
			var style = f.getAttribute('style'),
				node = f.parentNode,
				height = +f.height,
				top = getTop(node),
				bottom = top+height,
				inBounds = (top >= scrollTop && top <= bounds) || (bottom >= scrollTop && bottom <= bounds),
				outOfBounds = (top > bounds || bottom < scrollTop);

			if(f.previousSibling || f.nextSibling){
				console.log('WARNING: iframe is not the sole child element of a DIV. ', f.outerHTML);
				return;
			}

			w.$(node).height(height+10);

			//console.log('scrollTop: ',scrollTop, 'frame top: ', top, 'frame height: ',height,f);

			if(!f.originalSrc){
				f.originalSrc = f.src;
				f.src = 'about:blank';
			}

			if( style!==display && inBounds){
				f.setAttribute('style',display);
				f.src = f.originalSrc;
			}
			else if(style===display && outOfBounds){
				console.log(scrollTop, top, bottom, bounds);
				f.removeAttribute('style');
				f.src = 'about:blank';
//				height = contentHeight-container.clientHeight;
//				contentHeight = container.clientHeight;
//				if(top<scrollTop){
//					scrollTop -= height;
//					bounds -= height;
//					view.scrollTo('top',scrollTop);
//				}
			}

		});

	},

	checkFrame: function(){
		var doc = this.getDocumentElement(),
			body = Ext.get(doc.getElementById('NTIContent')),
			h;
		if (body) {
			h = body.getHeight();
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
			b = Ext.get(doc.getElementById('NTIContent')),
			i = this.getIframe();

		b = b? b.getHeight()+100: 100;

		console.log('Sync Height: '+b);
		i.setHeight(this.el.getHeight()-100);
		i.setHeight(b);

		this.fireEvent('resize');
		this.doLayout();

		this.lastFrameSync = Ext.Date.now();
	},

	getIframe: function(){
		var el = this.items.first().el,
			iframe = el.dom;
		el.win = (Ext.isIE ? iframe.contentWindow : window.frames[iframe.name]);
		return el;
	},


	/** @private */
	setContent: function(html) {
		var doc = this.getDocumentElement(),
			body = Ext.get(doc.body || doc.documentElement);
		this.getIframe().setHeight(0);

		body.update(html);
		body.setStyle('background','transparent');
		this.checkContentFrames();

		clearInterval(this.syncInterval);
		this.syncInterval = setInterval(this.checkFrame,100);
	},

	getDocumentElement: function(){
		var iframe, win, dom, doc = this.contentDocumentElement;

		if(!doc){
			iframe = this.getIframe();
			dom = iframe.dom;
			win = iframe.win;

			doc = dom.contentDocument || win.document;

			// use IE's document property name across every where for the iframe's window reference.
			// WebKit & Gecko don't natively have this, so we're populating it
			if(!doc.parentWindow){
				doc.parentWindow = win;
			}
			this.contentDocumentElement = doc;
		}

		return doc;
	},


	scrollToId: function(id) {
		var n = Ext.getCmp(id),
			m,
			offset = this.getPosition(),
			cPos,
			sTop = this.body.getScroll().top;


		if(n) {


			cPos = n.getPosition();
			console.log('cmp pos', cPos, 'offset', offset, 'scrollTop', sTop);
			this.scrollTo(cPos[1]-offset[1] - 10 + sTop);

			//this.scrollToNode(n.getEl().dom);
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
		var de = this.getDocumentElement(),
			e = de.getElementById(target) || Ext.fly(de).query('*[name='+target+']')[0];

		if(!e) {
			console.warn('scrollToTarget: no target found: ',target);
		}
		else {
			this.scrollToNode(e);
		}
	},


	/**
	 * Scroll to some element, but allow options to decide whether or not to scroll.
	 *
	 * @param n - the node you want to scroll to
	 * @param onlyIfNotVisible - pass true here if you want this function to decide if it should scroll or not,
	 *                           based on its visibility on screen
	 * @param bottomThreashold - if you want to scroll if the target is close to the bottom, specify a threashold.
	 */
	scrollToNode: function(n, onlyIfNotVisible, bottomThreashold) {
		while(n && n.nodeType === Node.TEXT_NODE) {
			n = n.parentNode;
		}

		var o = Ext.fly(n).getTop(),
			st = this.body.getScroll().top,
			h = this.body.getHeight(),
			b = st + h - (bottomThreashold || 0);

		//logic to halt scrolling if conditions mentioned in function docs are met.
		if (onlyIfNotVisible && o > st && o < b) {
			console.debug('component is already visable, not scrolling.');
			return;
		}

		this.scrollTo(o - 10);
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
			texts,
			textLength = text.length;

		texts = AnnotationUtils.getTextNodes(doc);

		Ext.each(texts, function(node) {
				var nv = node.nodeValue.toLowerCase(),
					index = nv.indexOf(text),
					r;

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
			},
			this);

		me.showRanges(ranges);
		me.scrollTo(ranges[0].getClientRects()[0].top - 150);
	},


	getContainerId: function() {
		return this.meta.NTIID;
	},


	postRender: function(){
		this.splash = this.body.insertHtml('beforeEnd','<div class="no-content-splash"></div>',true);
		this.body.on('scroll',this.checkContentFrames,this);
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
			function f(){
				me.splash.hide();
				me.setReaderContent(resp, callback);
			}

			if(Ext.isIE){
				me.resetFrame(f);
			}
			else {
				f();
			}
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
		this.meta = {};
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
		me.scrollTo(0, false);


		//apply any styles that may be on the content's bory, to the NTIContent div:
		this.applyBodyStyles(
				resp.responseText.match(/<body([^>]*)>/i),
				this.buildPath(resp.responseLocation));


		QuizUtils.setupQuiz(me.getDocumentElement());

		containerId = me.getContainerId();
		me.loadContentAnnotations(containerId, onFinishLoading);
	},


	buildPath: function(s){
		var p = s.split('/'); p.splice(-1,1,'');
		return p.join('/');
	},


	parseHTML: function(request){
		function toObj(a,k,v){
			var i=a.length-1, o = {};
			for(; i>=0; i--){ o[k.exec(a[i])[2]] = v.exec(a[i])[1]; }
			return o;
		}

		function metaObj(m){
			return toObj(m, /(name|http\-equiv)="([^"]+)"/i, /content="([^"]+)"/i);
		}

//		function navObj(m){
//			return toObj(m, /rel="([^"]+)"/i, /href="([^"]+)"/i);
//		}

		function cssObj(m){
			var i = m.length-1, k=/href="([^"]*)"/i, o, c = {};
			for(; i>=0; i--){
				o = k.test(m[i]) ? basePath + k.exec(m[i])[1] : m[i];
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
			basePath = this.buildPath(request.responseLocation),
			rc = me.loadedResources,

			c = request.responseText,
			rf= c.toLowerCase(),

			start = rf.indexOf(">", rf.indexOf("<body"))+1,
			end = rf.indexOf("</body"),

			head = c.substring(0,start).replace(/[\t\r\n\s]+/g,' '),
			body = c.substring(start, end);

		this.meta = metaObj( head.match(/<meta[^>]*>/gi) || [] );
//		this.nav = navObj( head.match( /<link[^<>]+rel="(?!stylesheet)([^"]*)"[^<>]*>/ig) || []);
		this.css = cssObj( head.match(/<link[^<>]*?href="([^"]*css)"[^<>]*>/ig) || []);

		return this.fixReferences(body,basePath);
	},


	applyBodyStyles: function(bodyTag, basePath){
		var styleMatches = bodyTag[1] ? bodyTag[1].match(/style="([^"]+)"/i) : null,
			bodyStyles = styleMatches ? styleMatches[1]: null,
			body = Ext.get(this.getDocumentElement().getElementById('NTIContent')),
			bodyStylesObj = {};

		//Create an object with our styles split out
		if (bodyStyles) {
			Ext.each(bodyStyles.split(';'), function(s){
				var keyVal = s.split(':'),
					key = keyVal[0].trim(),
					val = keyVal[1].trim(),
					url;

				//make any url adjustments:
				if (key === 'background-image') {
					val = val.replace(/['|"]/g , '').replace('"', '');
					url = val.match(/url\(([^\)]*)/i)[1];
					val = 'url(' + basePath + url + ')';
				}

				bodyStylesObj[key] = val;
			});
		}
		body.setStyle(bodyStylesObj);
	},


	fixReferences: function(string, basePath){

		function fixReferences(original,attr,url) {
			var firstChar = url.charAt(0),
				absolute = firstChar ==='/',
				anchor = firstChar === '#',
				external = me.externalUriRegex.test(url),
				host = absolute?$AppConfig.server.host:basePath;

/*
turn off html5 player
			if(/src/i.test(attr) && /youtube/i.test(url)){
				match = url.match(/youtube.com\/embed\/([^\?&#]+)/i);
				return "src=assets/wrappers/youtube.html?host=" +
						encodeURIComponent($AppConfig.server.host) +
						'&videoId='+encodeURIComponent(match[1]) +
						'&original='+encodeURIComponent(url) +
						'&_dc='+Ext.Date.now();
			}
*/
			if(/src/i.test(attr) && /youtube/i.test(url)){
				return Ext.String.format('src="{0}&wmode={1}"',url.replace(/http:/i,'https:'), 'opaque');
			}

			if(url.indexOf('http:')===0){
				console.log('WARNING: referencing external url via insecure protocol: '+url+' Assuming naive https string substitution.');
				original = original.replace(/http:/i,'https:');
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

		if (!r || whref+'#' === r) {
			return;
		}

		//pop out links that point to external resources
		if(!ParseUtils.parseNtiid(r) && m.externalUriRegex.test(r) && r.indexOf(whref) < 0 ){
			//popup a leaving platform notice here...
			window.open(r, guidGenerator());
			return;
		}

		if (newLocation.toLowerCase() === whref.toLowerCase() && target) {
			this.scrollToTarget(target);
		}
		else {
			LocationProvider.setLocation(newLocation, function(me){
				if(target) {
					me.scrollToTarget(target);
				}
			});
		}
	}

}, function(){
	var o = this.classEvents = new Ext.util.Observable(),
		timeoutMillis = 5000;

	function startTimer(){
		return function() {
			var me = this;
			o.fireEvent('window-drag-start');
			me.NTImaskRemovalTimer = setTimeout(function(){
				me.NTIEndTimer();
			},
			timeoutMillis);
		};
	}

	function postponeTimer(){
		return function(){
			var me = this;
			if (!me.NTImaskRemovalTimer){
				me.NTIstartTimer();
				return;
			}

			clearTimeout(me.NTImaskRemovalTimer);
			me.NTImaskRemovalTimer = setTimeout(function(){
				me.NTIEndTimer();
			},
			timeoutMillis);
		};
	}

	function endTimer() {
		return function(){
			clearTimeout(this.NTImaskRemovalTimer);
			delete this.NTImaskRemovalTimer;
			o.fireEvent('window-drag-end');
		};
	}

	function a(){
		return function(){
			this.NTIstartTimer();
			return this.callOverridden(arguments);
		};
	}

	function b(){
		return function(){
			this.NTIEndTimer();
			return this.callOverridden(arguments);
		};
	}

	function c() {
		return function(){
			this.NTIPostponeTimer();
			return this.callOverridden(arguments);
		};
	}

	Ext.util.ComponentDragger.override({ NTIstartTimer: startTimer(), NTIEndTimer: endTimer(), NTIPostponeTimer: postponeTimer(), onStart: a(), onEnd: b(), onDrag: c()});
	Ext.resizer.ResizeTracker.override({ NTIstartTimer: startTimer(), NTIEndTimer: endTimer(), NTIPostponeTimer: postponeTimer(), onMouseDown: a(), onEnd: b(), onDrag: c()});
});

