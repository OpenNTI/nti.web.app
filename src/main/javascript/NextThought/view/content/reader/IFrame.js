Ext.define('NextThought.view.content.reader.IFrame',{
	requires: [
		'NextThought.ContentAPIRegistry'
	],

	baseFrameCheckIntervalInMillis: 500,
	frameCheckRateChangeFactor: 1.5,

	constructor: function(){
		this.checkFrame = Ext.bind(this.checkFrame,this);
		if(this.add){
			this.add(this.getIFrameConfig());
		}

		this.on('resize',function(){delete this.lastHeight;},this);
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
		var me = this;
		return {
			xtype: 'box',
			width: 780,
			autoEl: {
				width: 780,
				tag: 'iframe',
				name: 'iframe-' + guidGenerator() + '-content',
				src: Globals.EMPTY_WRITABLE_IFRAME_SRC,
				frameBorder: 0,
                scrolling: 'no',
				seamless: true,
				style: 'overflow: hidden; z-index: 1;'
			},
			listeners: {
				scope: this,
				afterRender: function(){
					this.resetFrame(function(){
						me.iframeReady = true;
						me.fireEvent('iframe-ready');
					});
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
				doc.open();
				doc.write('<!DOCTYPE html><html lang="en"><head></head><body></body></html>');
				doc.close();
				delete me.contentDocumentElement;
				setTimeout(function(){
					me.initContentFrame();
					if(cb){
						Ext.callback(cb,me);
					}
				},10);
			}
		};
		setTimeout(function(){Ext.TaskManager.start(task);},200);
	},


	initContentFrame: function(){
		var me = this,
			base = location.pathname.toString().replace('index.html',''),
			doc = me.getDocumentElement(),
			con = console, tip,
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

		me.getIframe().win.onerror = function(){con.warn('iframe error: ',JSON.stringify(arguments));};

		//Move classes down from main body to sub-iframe body for content rendering reference:
		Ext.fly(doc.getElementsByTagName('body')[0]).addCls(this.getTopBodyStyles());

		meta = doc.createElement('meta');
		//<meta http-equiv="X-UA-Compatible" content="IE=edge">
		meta.setAttribute('http-equiv','X-UA-Compatible');
		meta.setAttribute('content','IE=edge');
		doc.getElementsByTagName('head')[0].appendChild(meta);

		g.loadStyleSheet({
			url: base+document.getElementById('main-stylesheet').getAttribute('href'),
			document: doc });
		g.loadStyleSheet({
			url: 'https://fonts.googleapis.com/css?family=Droid+Serif:400,700,700italic,400italic|Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800',
			document: doc });

		on(doc,['keypress','keydown','keyup'],function(e){
			e = Ext.EventObject.setEvent(e||event);
			if(e.getKey() === e.BACKSPACE || e.getKey() === e.ESC){
				var t = e.getTarget();
				e.stopPropagation();

				if(!t || (!(/input|textarea/i).test(t.tagName) && !t.getAttribute('contenteditable'))){
					e.stopEvent();
					return false;
				}
			}
			return true;
		});

		tip = Ext.tip.QuickTipManager.getQuickTip();
		tip.mon(Ext.fly(doc.body,'__reader_body_'+me.prefix), {
            mouseover: tip.onTargetOver,
            mouseout: tip.onTargetOut,
            mousemove: tip.onMouseMove,
            scope: tip,
			reader: me
        });

		on(doc,'mousedown',function(){ Ext.menu.Manager.hideAll(); });
		on(doc,'contextmenu',function(e){
			Ext.EventObject.setEvent(e||event).stopEvent();
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

			if(!fakeEvent.getTarget('a')){
				me.onContextMenuHandler({
					getTarget: function(){ return fakeEvent.getTarget.apply(fakeEvent,arguments); },
					preventDefault: function(){ fakeEvent.preventDefault(); },
					stopPropagation: function(){ fakeEvent.stopPropagation(); },
					getXY: function(){
						var xy = fakeEvent.getXY();
						xy[1] -= t;
						return xy;
					}
				});
			}
		});


        function shouldDismissPopover(){
	        me.fireEvent('dismiss-popover');
        }
        on(doc, 'mouseout', function(e){
            var evt = Ext.EventObject.setEvent(e||event),
                target = evt.getTarget('a.footnote') || evt.getTarget('a.ntiglossaryentry');

               if(target){
                   shouldDismissPopover();
               }
        });
        me.registerScrollHandler(shouldDismissPopover);


        on(doc, 'mouseover', function(e){
            var d = doc,
                evt = Ext.EventObject.setEvent(e||event),
                target = evt.getTarget('a.footnote') || evt.getTarget('a.ntiglossaryentry'),
	            targetType, href, popContent;

            function getId(e, type){
                if(!Ext.fly(e).hasCls(type)){
                    e = Ext.fly(e).up('.'+type);
                }
                return e.getAttribute('href');
            }

            function getPopoverContent(href){
                var fn, clonedFn, redactedPlaceholder;
                try{fn = d.querySelector(href);}
                catch (e){fn = d.getElementById(href.substring(1));}

	            if(!fn){ return; }
				clonedFn = fn.cloneNode(true);

                Ext.each(Ext.fly(clonedFn).query('a'),
                    function(d){
                        var href = d.getAttribute ? d.getAttribute('href') : '';
                        if(href.indexOf('#m') >= 0){
                            clonedFn.removeChild(d);
                        }
                    }
                );

				//Strip out the redacted text.  Note we look based on class
				//here which is failry tightly coupled to annotations/Redaction.js/
				//TODO for things like this key off some generic data-nti-injected-element
				//attribute
				redactedPlaceholder = Ext.fly(clonedFn).down('.redacted-text');
				if(redactedPlaceholder){
					redactedPlaceholder.remove();
				}

                return clonedFn;
            }

            if (!target){return;}
			targetType = Ext.fly(target).hasCls('footnote') ? 'footnote' : 'ntiglossaryentry';
            href = getId(target, targetType);
	        popContent = getPopoverContent(href);
	        if(!popContent){
		        console.log('Error: Could not find popover content for id:'+href+ ' from target: '+target);
		        return;
	        }
            me.fireEvent('display-popover', me, href, popContent, target);
        });

		ContentAPIRegistry.on('update',me.applyContentAPI,me);
		me.applyContentAPI();
		me.setSplash();
		if(me.syncInterval){
			clearInterval(me.syncInterval);
		}
		me.syncInterval = setInterval( me.checkFrame, this.baseFrameCheckIntervalInMillis );
	},


	getTopBodyStyles: function(){
		var mainBodyStyleString = Ext.getBody().getAttribute('class')||'',
			mainBodyStyleList = mainBodyStyleString.split(' '),
			styleBlacklist = [
				'x-container',
				'x-reset',
				'x-unselectable',
				'x-border-layout-ct'
			];

		return Ext.Array.difference(mainBodyStyleList, styleBlacklist);
	},


	checkFrame: function(){
		var doc = this.getDocumentElement();
		if (doc) {
			this.syncFrame(doc.getElementsByTagName('html')[0]);
			if(Ext.Date.now()-this.lastSyncFrame > 1000){
				clearInterval(this.syncInterval);
				this.syncInterval = setInterval(this.checkFrame,
						this.baseFrameCheckIntervalInMillis*this.frameCheckRateChangeFactor);
			}
		}
	},


	syncFrame: function(content){
		var i = this.getIframe(), h, contentHeight = 150, ii;
			//We need the buffer because otherwise the end of the doc would go offscreen

		if(!i){
			console.warn('Cannot syncFrame, the iFrame is not ready');
			return;
		}

		if (Ext.isIE) { //This still seems wonky in IE10.  Make it just check IE so we can scroll the content
			contentHeight = 150;
			for (ii = 0; ii < content.childNodes.length; ii++) {
				contentHeight += content.childNodes[ii].offsetHeight;
			}
		}
		else {
			contentHeight = content.getBoundingClientRect().height;
		}
		h = Math.ceil(Math.max(this.getEl().getHeight(),contentHeight));

		if(h === this.lastHeight){
			return;
		}
		i.setHeight(h);
		this.doLayout();
		this.lastHeight = h;
		this.lastSyncFrame = Ext.Date.now();
		this.fireEvent('sync-height',h);
	},


	getIframe: function(){
		var iframe, el = this.items.first().el;
		if(!el){ return null; }
		iframe = el.dom;
		el.win = iframe.contentWindow || window.frames[iframe.name];
		return el;
	},


	getDocumentElement: function(){
		var iframe, win, dom, doc = this.contentDocumentElement;

		if(!doc){
			iframe = this.getIframe();

			if(!iframe){
				console.warn('The iframe is not rendered');
				return null;
			}
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
			metaNames = ['NTIID', 'last-modified'],
			me = this;

		Ext.select('meta[nti-injected="true"]', false, head).remove();

		//Append some tags to the head
		if(me.meta){
			Ext.each(metaNames, function(tag){
				var meta;
				if(me.meta.hasOwnProperty(tag)){
					meta = doc.createElement('meta');
					meta.setAttribute('name',tag);
					meta.setAttribute('content', me.meta[tag]);
					meta.setAttribute('nti-injected', true);
					head.appendChild(meta);
				}
			});
		}

		body.update(html||'');
		body.setStyle('background','transparent');
		doc.normalize();

		if(html!==false){
			this.insertRelatedLinks(body.query('#NTIContent .chapter.title')[0],doc);
            this.cleanContent = body.dom.cloneNode(true);
        }
		this.fireEvent('content-updated');


		//TODO: solidify our story about content scripts (reset the iframe after navigating to a page that has scripts?)
//		Ext.each(body.query('script'),function(s){
//			s.parentNode.removeChild(s);
//			var e = doc.createElement('script'); e.src = s.src;
//			head.appendChild(e);
//		});

		clearInterval(this.syncInterval);
		delete this.lastHeight;
		this.syncInterval = setInterval(this.checkFrame,this.baseFrameCheckIntervalInMillis);
	},


    getCleanContent: function(){
        return this.cleanContent;
    }
});
