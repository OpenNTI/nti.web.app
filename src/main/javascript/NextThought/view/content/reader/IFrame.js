Ext.define('NextThought.view.content.reader.IFrame', {
	alias: 'reader.iframe',
	requires: [
		'NextThought.view.content.reader.ContentAPIRegistry'
	],

	mixins: {
		observable: 'Ext.util.Observable'
	},

	getBubbleTarget: function() {
		return this.reader;
	},

	baseFrameCheckIntervalInMillis: 500,
	frameCheckRateChangeFactor: 1.5,

	constructor: function(config) {
		Ext.apply(this, config);

		var reader = this.reader;

		this.mixins.observable.constructor.apply(this);

		reader.on('destroy', 'destroy',
				  reader.relayEvents(this, [
					  'dismiss-popover',
					  'display-popover',
					  'iframe-ready',
					  'sync-height',
					  'content-updated',
					  'content-updated-with',
					  'page-previous',
					  'page-next'
				  ]));

		Ext.apply(reader, {
			getDocumentElement: Ext.bind(this.getDocumentElement, this),
			getCleanContent: Ext.bind(this.getCleanContent, this)
		});

		this.checkFrame = Ext.bind(this.checkFrame, this);

		this.iframe = this.reader.add(this.getConfig());

		this.mon(this.reader, {
			resize: function() { delete this.lastHeight; },
			scroll: 'dismissPopover'
		});
	},


	dismissPopover: function() {
		this.fireEvent('dismiss-popover');
	},


	applyContentAPI: function() {
		//TODO: can we get rid of this?
		var doc = this.getDocumentElement(),
				win = doc.parentWindow;
		Ext.Object.each(ContentAPIRegistry.getAPI(), function(f, n) {
			win[f] = n;
		});

	},


	getConfig: function() {
		var me = this;
		return {
			xtype: 'box',
			autoEl: {
				tag: 'iframe',
				name: 'iframe-' + guidGenerator() + '-content',
				src: Globals.EMPTY_WRITABLE_IFRAME_SRC,
				frameBorder: 0,
				scrolling: 'no',
				seamless: true,
				style: 'overflow: hidden; z-index: 1;'
			},
			listeners: {
				afterRender: function() {
					me.resetFrame(function() {
						var frame = me.get();
						if (frame) {
							frame.selectable();
						}
						me.reader.iframeReady = true;
						me.fireEvent('iframe-ready', me.reader.ntiidOnFrameReady);
						delete me.reader.ntiidOnFrameReady;
					});
				}
			}
		};
	},


	resetFrame: function(cb) {
		// must defer to wait for browser to be ready
		var BLANK_DOC = '<!DOCTYPE html>' + Ext.DomHelper.markup(
						{tag: 'html', lang: 'en', cn: [
							{tag: 'head', cn: {tag: 'title', html: 'Content'}},
							{tag: 'body'}
						]
						}),
				me = this,
				jsPrefix = 'javascript', //this in var to trick jslint
				task = { interval: 50 },
				doc = me.getDocumentElement();

		doc.open();
		doc.close();
		doc.parentWindow.location.replace(jsPrefix + ':');
		me.loadedResources = {};

		delete this.contentDocumentElement;

		task.run = function() {
			var doc = me.getDocumentElement();
			if (doc.body || doc.readyState === 'complete') {
				Ext.TaskManager.stop(task);
				doc.open();
				doc.write(BLANK_DOC);
				doc.close();
				delete me.contentDocumentElement;
				setTimeout(function() {
					me.initContentFrame();
					if (cb) {
						Ext.callback(cb, me);
					}
				}, 10);
			}
		};

		Ext.TaskManager.start(task);
	},


	initContentFrame: function() {
		var me = this,
				base = location.pathname.toString().replace('index.html', ''),
				doc = me.getDocumentElement(),
				con = console, tip,
				meta, g = Globals;

		ContentAPIRegistry.register('reloadCSS', Globals.reloadCSS, Globals);

		function on(dom, event, fn) {
			if (!Ext.isArray(event)) {
				event = [event];
			}
			Ext.each(event, function(event) {
				if (dom.addEventListener) {
					dom.addEventListener(event, fn, false);
				}
				else if (dom.attachEvent) {
					dom.attachEvent(event, fn);
				}
			});
		}

		function forward(name) {
			on(doc, name, function(e) {
				e = Ext.EventObject.setEvent(e || event);
				var o = me.reader.getAnnotationOffsets(),
						xy = e.getXY().slice();

				xy[0] += o.left;
				xy[1] += o.top;

				//console.debug(e.browserEvent,xy, o);
				me.reader.fireEvent('iframe-' + e.type, {
					browserEvent: e.browserEvent,
					type: e.type,
					getY: function() {
						return xy[1];
					},
					getX: function() {
						return xy[0];
					},
					getXY: function() {
						return xy;
					},
					stopEvent: function() {
						Ext.EventManager.stopPropagation(this.browserEvent);
						Ext.EventManager.preventDefault(this.browserEvent);
					}
				});
			});
		}

		me.get().win.onerror = function() {
			con.warn('iframe error: ', JSON.stringify(arguments));
		};

		//Move classes down from main body to sub-iframe body for content rendering reference:
		Ext.fly(doc.getElementsByTagName('body')[0]).addCls(this.getTopBodyStyles());

		meta = doc.createElement('meta');
		//<meta http-equiv="X-UA-Compatible" content="IE=edge">
		meta.setAttribute('http-equiv', 'X-UA-Compatible');
		meta.setAttribute('content', 'IE=edge');
		doc.getElementsByTagName('head')[0].appendChild(meta);

		g.loadStyleSheet({
							 url: base + document.getElementById('main-stylesheet').getAttribute('href'),
							 document: doc });

		on(doc, ['keypress', 'keydown', 'keyup'], function(e) {
			e = Ext.EventObject.setEvent(e || event);
			var t = e.getTarget(),
					k = e.getKey();

			if (k === e.BACKSPACE || e.getKey() === e.ESC) {
				e.stopPropagation();
				if (!t || (!(/input|textarea/i).test(t.tagName) && !t.getAttribute('contenteditable'))) {
					e.stopEvent();
					return false;
				}
			}
			else if (t && t.tagName === 'BODY') {
				if (k === e.UP) {
					me.reader.getScroll().up();
				}
				else if (k === e.DOWN) {
					me.reader.getScroll().down();
				}
				else if (k === e.LEFT || k === e.RIGHT) {
					me.fireEvent(k === e.LEFT ? 'page-previous' : 'page-next');
				}
			}
			return true;
		});

		tip = Ext.tip.QuickTipManager.getQuickTip();
		tip.mon(Ext.fly(doc.body, '__reader_body_' + me.prefix), {
			mouseover: tip.onTargetOver,
			mouseout: tip.onTargetOut,
			mousemove: tip.onMouseMove,
			scope: tip,
			reader: me.reader
		});

		on(doc, 'mousedown', function() {
			Ext.menu.Manager.hideAll();
		});

		on(doc, 'contextmenu', function(e) {
			Ext.EventObject.setEvent(e || event).stopEvent();
			return false;
		});

		on(doc, 'click', function(e) {
			var evt = Ext.EventObject.setEvent(e || event),
					target = evt.getTarget(),
					highlight = evt.target.classList.contains('application-highlight');

			//while the target is not an anchor that is not in a highlight
			while (target && (target.tagName !== 'A' || target.parentNode.classList.contains('application-highlight'))) {
				target = target.parentNode;
			}

			//if we are not in a hightlight
			if (target && !highlight) {
				me.reader.getContent().onClick(evt, target);
			}
		});

		on(doc, 'mouseup', function(e) {
			var fakeEvent = Ext.EventObject.setEvent(e || event),
					t = me.reader.getScroll().get().top,
					s = me.get().win.getSelection();

			if (!fakeEvent.getTarget('a') || !s.isCollapsed) {
				me.reader.onContextMenuHandler(
						{
							getTarget: function() {
								return fakeEvent.getTarget.apply(fakeEvent, arguments);
							},

							preventDefault: function() {
								fakeEvent.preventDefault();
							},

							stopPropagation: function() {
								fakeEvent.stopPropagation();
							},

							getXY: function() {
								var xy = fakeEvent.getXY();
								xy[1] -= t;
								return xy;
							}
						});
			}
		});

		if (!Ext.is.iPad) {
			forward(['mousedown', 'mouseup', 'mousemove', 'mouseout']);
		}
		else {
			//NOTE: Are we using these listeners for iPad?
			on(doc, 'touchstart', function(e) {
				Ext.menu.Manager.hideAll();
			});

			on(doc, 'selectionchange', function(e) {
				function selectionChange(e) {
					var fakeEvent = Ext.EventObject.setEvent(e || event),
						t = me.reader.getScroll().get().top,
						s = me.get().win.getSelection();

					if (!s.isCollapsed) {
						me.reader.onContextMenuHandler(
							{
								getTarget: function() {
									return fakeEvent.getTarget.apply(fakeEvent, arguments);
								},

								preventDefault: function() {
									fakeEvent.preventDefault();
								},

								stopPropagation: function() {
									fakeEvent.stopPropagation();
								}
							}
						);
					}
				}

				if (me.selectionTimer) { // So it doesn't continuously update during highlight-drag
					clearTimeout(me.selectionTimer);
				}
				me.selectionTimer = Ext.defer(selectionChange, 300, me, [e]);
			});
		}


		on(doc, 'mouseout', function(e) {
			var evt = Ext.EventObject.setEvent(e || event),
					target = evt.getTarget('a.footnote') || evt.getTarget('a.ntiglossaryentry');

			if (target) {
				me.dismissPopover();
			}
		});


		on(doc, 'mouseover', function(e) {
			var d = doc,
					evt = Ext.EventObject.setEvent(e || event),
					target = evt.getTarget('a.footnote') || evt.getTarget('a.ntiglossaryentry'),
					targetType, href, popContent;

			function getId(e, type) {
				if (!Ext.fly(e).hasCls(type)) {
					e = Ext.fly(e).up('.' + type);
				}
				return e.getAttribute('href');
			}

			function getPopoverContent(href) {
				var fn, clonedFn, redactedPlaceholder;
				try {
					fn = d.querySelector(href);
				}
				catch (e) {
					fn = d.getElementById(href.substring(1));
				}

				if (!fn) {
					return;
				}
				clonedFn = fn.cloneNode(true);

				Ext.each(Ext.fly(clonedFn).query('a'),
						 function(d) {
							 var href = d.getAttribute ? d.getAttribute('href') : '';
							 if (href.indexOf('#m') >= 0) {
								 clonedFn.removeChild(d);
							 }
						 }
				);

				//Strip out the redacted text.  Note we look based on class
				//here which is failry tightly coupled to annotations/Redaction.js/
				//TODO for things like this key off some generic data-nti-injected-element
				//attribute
				redactedPlaceholder = Ext.fly(clonedFn).down('.redacted-text');
				if (redactedPlaceholder) {
					redactedPlaceholder.remove();
				}

				return clonedFn;
			}

			if (!target) {
				return;
			}
			targetType = Ext.fly(target).hasCls('footnote') ? 'footnote' : 'ntiglossaryentry';
			href = getId(target, targetType);
			popContent = getPopoverContent(href);
			if (!popContent) {
				console.log('Error: Could not find popover content for id:' + href + ' from target: ' + target);
				return;
			}
			me.fireEvent('display-popover', me, href, popContent, target);
		});

		ContentAPIRegistry.on('update', me.applyContentAPI, me);
		me.applyContentAPI();
		me.reader.setSplash();
		if (me.syncInterval) {
			clearInterval(me.syncInterval);
		}
		me.syncInterval = setInterval(me.checkFrame, this.baseFrameCheckIntervalInMillis);
	},


	getTopBodyStyles: function() {
		var mainBodyStyleString = Ext.getBody().getAttribute('class') || '',
				mainBodyStyleList = mainBodyStyleString.split(' '),
				styleBlacklist = [
					'x-container',
					'x-reset',
					'x-unselectable',
					'x-border-layout-ct'
				];

		return Ext.Array.difference(mainBodyStyleList, styleBlacklist);
	},


	checkFrame: function() {
		var doc = this.getDocumentElement(), html;
		if (doc) {
			html = doc.getElementsByTagName('html');
			if (!Ext.isEmpty(html)) {
				this.syncFrame(html[0]);
			}
			if (Ext.Date.now() - this.lastSyncFrame > 1000) {
				clearInterval(this.syncInterval);
				this.syncInterval = setInterval(this.checkFrame,
												this.baseFrameCheckIntervalInMillis * this.frameCheckRateChangeFactor);
			}
		}
	},


	syncFrame: function(content) {
		var i = this.get(), h, contentHeight = 150, ii;
		//We need the buffer because otherwise the end of the doc would go offscreen

		if (!i) {
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
		h = Math.ceil(Math.max(this.reader.getEl().getHeight(), contentHeight));

		if (h === this.lastHeight) {
			return;
		}
		i.setHeight(h);
		this.reader.updateLayout();
		this.lastHeight = h;
		this.lastSyncFrame = Ext.Date.now();
		this.fireEvent('sync-height', h);
	},


	get: function() {
		var iframe, el = this.iframe.el;
		if (!el) {
			return null;
		}
		iframe = el.dom;
		el.win = iframe.contentWindow || window.frames[iframe.name];
		return el;
	},


	getDocumentElement: function() {
		var iframe, win, dom, doc = this.contentDocumentElement;

		if (!doc) {
			iframe = this.get();

			if (!iframe) {
				console.warn('The iframe is not rendered');
				return null;
			}
			dom = iframe.dom;
			win = iframe.win;

			doc = dom.contentDocument || win.document;

			// use IE's document property name across every where for the iframe's window reference.
			// WebKit & Gecko don't natively have this, so we're populating it
			if (!doc.parentWindow) {
				doc.parentWindow = win;
			}

			try {
				if (!doc.body) {
					doc.body = doc.getElementsByTagName('body')[0];
				}
				this.contentDocumentElement = doc;
			}
			catch (e) {
				console.log('body not ready');
			}
		}

		return doc;
	},


	update: function(html, metaData) {
		var doc = this.getDocumentElement(),
				body = Ext.get(doc.body),
				head = doc.getElementsByTagName('head')[0],
				metaNames = ['NTIID', 'last-modified'],
				me = this;

		Ext.select('meta[nti-injected="true"]', false, head).remove();

		//Append some tags to the head
		if (metaData) {
			Ext.each(metaNames, function(tag) {
				var meta;
				if (metaData.hasOwnProperty(tag)) {
					meta = doc.createElement('meta');
					meta.setAttribute('name', tag);
					meta.setAttribute('content', metaData[tag]);
					meta.setAttribute('nti-injected', 'true');
					head.appendChild(meta);
				}
			});
		}

		body.update(html || '');
		body.setStyle('background', 'transparent');
		doc.normalize();

		if (html !== false) {
			this.fireEvent('content-updated-with', body, doc);
			this.cleanContent = body.dom.cloneNode(true);
		}
		this.fireEvent('content-updated');

		clearInterval(this.syncInterval);
		delete this.lastHeight;
		this.syncInterval = setInterval(this.checkFrame, this.baseFrameCheckIntervalInMillis);
	},


	getCleanContent: function() {
		return this.cleanContent;
	},

	/**
	 * Makes pointer events go through the iframe so that all the
	 * interactions can be handled manually.
	 * @param should
	 */
	setClickthrough: function(should) {
		var el = this.get();
		if (!el) {
			return;
		}

		if (should) {
			el.addCls('clickthrough');
		}
		else {
			el.removeCls('clickthrough');
		}
	},

	hasClickthrough: function() {
		return this.get().hasCls('clickthrough');
	},

	/**
	 * @param x relative to the window's top left corner
	 * @param y relative to the window's top left corner
	 */
	elementAt: function(x, y) {
		var reader = this.reader,
				iFrameDoc = this.getDocumentElement(),
				outerDoc = Ext.getDoc().dom,
				hasClickthrough = this.hasClickthrough(),
				framePos = reader.getPosition(),
				scrolledY = reader.getScroll().top(),
				pickedElement,
				localX = x - framePos[0],
				localY = y - framePos[1] + scrolledY;

		function hasOverlay(element) {
			if (!element || !element.tagName) {
				return false;
			}

			if (element.getAttribute('class') === 'overlayed') {
				return true;
			}

			var types = [
						'application/vnd.nextthought.ntislidedeck',
						'application/vnd.nextthought.naquestion',
						'application/vnd.nextthought.ntivideo'
					],
					hasObjectTag = element.tagName === 'OBJECT',
					type;

			if (!hasObjectTag) {
				element = Ext.get(element).up('object');
			}
			if (!element) {
				return false;
			}

			type = element.dom ? element.dom.type : element.type;
			return Ext.Array.contains(types, type);
		}

		this.setClickthrough(false);
		if (x < 706) { // If it's in the main content area
			pickedElement = iFrameDoc.elementFromPoint(localX, localY);
		}
		else { // If it's in the gutter
			pickedElement = document.elementFromPoint(x, y);
		}

		// If it picked an object element or an object element child
		// and has an overlay outside the iFrame, use that.
		if (hasOverlay(pickedElement)) {
			pickedElement = outerDoc.elementFromPoint(x, y);
		}

		if (pickedElement) {
			console.log('picking: (' + x + ',' + y + '): ' + pickedElement.tagName);
		}

		this.setClickthrough(hasClickthrough);

		return pickedElement;
	},

	/**
	 * Positions relative to the window
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 */
	makeRangeFrom: function(x1, y1, x2, y2) {

		function rangeAtPoint(x, y) {
			var reader = me.reader,
					hasClickthrough = me.hasClickthrough(),
					framePos = reader.getPosition(),
					scrolledY = reader.getScroll().top(),
					localX = x - framePos[0],
					localY = y - framePos[1] + scrolledY,
					range;

			me.setClickthrough(false);
			range = iFrameDoc.caretRangeFromPoint(localX, localY);
			me.setClickthrough(hasClickthrough);
			return range;
		}

		var me = this,
				iFrameDoc = this.getDocumentElement(),
				startRange = rangeAtPoint(x1, y1),
				endRange = rangeAtPoint(x2, y2),
				range = iFrameDoc.createRange();
		range.setStart(startRange.startContainer, startRange.startOffset);
		range.setEnd(endRange.startContainer, endRange.endOffset);
		return range;

	}
});
