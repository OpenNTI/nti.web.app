Ext.define('NextThought.view.content.reader.IFrame',{
	requires: [
		'NextThought.ContentAPIRegistry'
	],

	constructor: function(){
		this.checkFrame = Ext.bind(this.checkFrame,this);
		this.checkContentFrames = Ext.Function.createBuffered(this.checkContentFrames,100);
		if(this.add){
			this.add(this.getIFrameConfig());
		}
		return this;
	},


	applyContentAPI: function(){
		var doc = this.getDocumentElement(),
			win = doc.parentWindow;

		Ext.Object.each(ContentAPIRegistry.getAPI(),function(f,n){
			win[f] = n;
		});

	},


	getIFrameConfig: function(){
		var secureProtocol = 'javascript';
		return {
			xtype: 'box',
//			anchor: '100%',
			width: 700,
			autoEl: {
				width: 700,
				tag: 'iframe',
				name: 'iframe-' + guidGenerator() + '-content',
				src: secureProtocol + ':',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				scrolling: 'no',
				seamless: true,
				transparent: true,
				allowTransparency: true,
				style: 'overflow: hidden; z-index: 2;'
			},
			listeners: {
				scope: this,
				afterRender: function(){
					this.resetFrame();
					this.body.on('scroll',this.checkContentFrames,this);
				}
			}
		};
	},


	resetFrame: function(cb){
		// must defer to wait for browser to be ready
		var me = this,
			jsPrefix = 'javascript', //this in var to trick jslint
			task = { interval : 100 },
			doc = me.getDocumentElement();

		doc.open();
		doc.close();
		doc.parentWindow.location.replace(jsPrefix+':');
		me.loadedResources = {};

		delete this.contentDocumentElement;

		task.run = function() {
			var doc = me.getDocumentElement();
			if (doc.body || doc.readyState === 'complete') {
				Ext.TaskManager.stop(task);
				me.initContentFrame();
				if(cb){
					Ext.callback(cb,me);
				}
			}
		};
		setTimeout(function(){Ext.TaskManager.start(task);},200);
	},


	initContentFrame: function(){
		var me = this,
			base = location.pathname.toString().replace('index.html',''),
			doc = me.getDocumentElement(),
			meta, g = Globals;

		function on(dom,event,fn){
			if(!Ext.isArray(event)){
				event = [event];
			}
			Ext.each(event,function(event){
				if(dom.addEventListener) { dom.addEventListener(event,fn,false); }
				else if(dom.attachEvent) { dom.attachEvent(event,fn); }
			});
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

//		doc.body.setAttribute('contenteditable','true');

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
		g.loadStyleSheet({ url: base+'resources/lib/mathquill/mathquill.css', document: doc });
		g.loadScript({url: '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js', document: doc},
			function(){
				g.loadScript({ url: base+'resources/lib/mathquill/mathquill.min.js', document: doc }); });

		//Quiz Dependencies: Load MathJax 1.1 (2.0 buggy)
		g.loadScript(
			{ url: 'https://c328740.ssl.cf1.rackcdn.com/mathjax/1.1-latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML', document: doc },
			function(){ g.loadScript({ url: base+'resources/misc/mathjaxconfig.js', document: doc }); });


		on(doc,['keypress','keydown','keyup'],function(e){
			e = Ext.EventObject.setEvent(e||event);
			if(e.getKey() === e.BACKSPACE){
				var t = e.getTarget();
				e.stopPropagation();
				if(!t || !(/input|textarea/i).test(t.tagName)){
					console.log('stopped backspace: ',t);
					e.stopEvent();
				return false;
				}
			}
		});
		on(doc,['mouseover','mousemove'],function(e){
			e = Ext.EventObject.setEvent(e||event);
			if(e.getX() < 80){ me.setGutterClickThrough(); }
		});
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


	setGutterClickThrough: function setGutterClickThrough(){
		var fn = setGutterClickThrough,
			me = this;

		clearTimeout(fn.timoutout);
		fn.timeout = setTimeout(function(){
			me.getIframe().setStyle({pointerEvents: ''});
		},1000);
		me.getIframe().setStyle({pointerEvents: 'none'});
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
//				console.log(scrollTop, top, bottom, bounds);
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
			body = Ext.get(doc.getElementById('NTIContent'));
		if (body) {
			this.syncFrame(body);
			if(Ext.Date.now()-this.lastFrameSync > 500){
				clearInterval(this.syncInterval);
				this.syncInterval = setInterval(this.checkFrame,500);
			}
		}
	},


	syncFrame: function(body){
		var i = this.getIframe(),
			h = body.getHeight()+100;

		if(h === this.lastHeight && i.getHeight() !== 0 ){
			return;
		}

//		console.log('Syncing Frame Height: content:', h, ' view:', this.getEl().getHeight());

		body.hide().show();
		h = Math.max(h, this.getEl().getHeight());
		i.setHeight(h);

		this.fireEvent('resize');
		this.doLayout();

		this.lastHeight = h;
		this.lastFrameSync = Ext.Date.now();
		this.fireEvent('sync-height',h);
	},


	getIframe: function(){
		var el = this.items.first().el,
			iframe = el.dom;
		el.win = iframe.contentWindow || window.frames[iframe.name];
		return el;
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

			try {
				if(!doc.body){
					doc.body = doc.getElementsByTagName('body')[0];
				}
				this.contentDocumentElement = doc;
			}
			catch(e){
				console.log('body not ready');
			}
		}

		return doc;
	},


	updateContent: function(html) {
		var doc = this.getDocumentElement(),
			body = Ext.get(doc.body),
			head = doc.getElementsByTagName('head')[0],
			me = this;
		this.getIframe().setHeight(0);

		body.update(html);
		body.setStyle('background','transparent');
		doc.normalize();

		this.insertRelatedLinks(body.query('#NTIContent .chapter.title')[0],doc);
		this.fireEvent('content-updated');

		//TODO: solidify our story about content scripts (reset the iframe after navigating to a page that has scripts?)
		Ext.each(body.query('script'),function(s){
			s.parentNode.removeChild(s);
			var e = doc.createElement('script'); e.src = s.src;
			head.appendChild(e);
		});

		setTimeout(function(){
			me.checkContentFrames();
		},10);

		clearInterval(this.syncInterval);
		this.syncInterval = setInterval(this.checkFrame,100);
	}
});
