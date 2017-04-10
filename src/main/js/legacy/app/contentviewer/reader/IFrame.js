var Ext = require('extjs');
var ContentAPIRegistry = require('./ContentAPIRegistry');
var Globals = require('../../../util/Globals');
var {guidGenerator} = Globals;
var ReaderContentAPIRegistry = require('./ContentAPIRegistry');
var ComponentsSimplePopoverWidget = require('../components/SimplePopoverWidget');


module.exports = exports = Ext.define('NextThought.app.contentviewer.reader.IFrame', {
	alias: 'reader.iframe',

	mixins: {
		observable: 'Ext.util.Observable'
	},

	getBubbleTarget: function () {
		return this.reader;
	},

	baseFrameCheckIntervalInMillis: 500,
	frameCheckRateChangeFactor: 1.5,

	constructor: function (config) {
		Ext.apply(this, config);

		var me = this,
			scroll = me.dismissPopover.bind(me),
			reader = me.reader;

		me.mixins.observable.constructor.apply(me);

		reader.on('destroy', 'destroy',
				  reader.relayEvents(me, [
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
			getDocumentElement: me.getDocumentElement.bind(me),
			getCleanContent: me.getCleanContent.bind(me),
			onceSettled: me.onceSettled.bind(me)
		});

		me.checkFrame = me.checkFrame.bind(me);

		me.iframe = me.reader.add(me.getConfig());

		me.mon(me.reader, {
			destroy: function () {
				window.removeEventListener('scroll', scroll);
				Ext.EventManager.removeResizeListener(me.onWindowResize, me);
				clearInterval(me.syncInterval);
			},
			resize: function () { delete me.lastHeight; }
		});

		window.addEventListener('scroll', scroll);
		this.initClipboardListener();

		Ext.EventManager.onWindowResize(me.onWindowResize, me);
	},

	/*
	 * Listens for the user copying to clipboard and sets the text/html
	 * clipboard data to an appropriate value. This is necessary to work
	 * around Webkit's implementation of ClipboardEvent.clipboardData:
	 * https://bugs.webkit.org/show_bug.cgi?id=19893
	 * According to the spec, the default behavior of setting clipboardData
	 * does not happen until after the event listener is called, so we
	 * cannot detect its existence beforehand and cannot easily detect
	 * whether this is necessary or not without resorting to UA sniffing,
	 * so the listener is added unconditionally.
	 */
	initClipboardListener: function () {
		const getSelectionHtml = (doc) => {
			let html;

			if (window.getSelection().rangeCount) {
				const container = doc.createElement('div');
				for (let i = 0; i < window.getSelection().rangeCount; i++) {
					container.appendChild(window.getSelection().getRangeAt(i).cloneContents());
				}
				html = container.innerHTML;
			}

			return html;
		};

		window.addEventListener('copy', e => {
			e.clipboardData.setData('text/plain', window.getSelection().toString());
			e.clipboardData.setData('text/html', getSelectionHtml(this.getDocumentElement()));
			e.preventDefault();
		});
	},

	onWindowResize: function () {
		if (this.iframe && this.iframe.el) {
			this.iframe.el.repaint();
		}
	},

	displayPopover: function (href, html, node) {
		var me = this,
			nibHeight = 10,
			offsets = me.reader.getAnnotationOffsets(),
			readerLeft = offsets.rect.left,
			readerRight = offsets.rect.left + offsets.width,
			scrollOffSet = Ext.getBody().getScroll().top,
			viewHeight = Ext.Element.getViewportHeight(),
			x, y,
			nodeRect = node.getBoundingClientRect(),
			midpoint = nodeRect.width / 2;

		//start out positioned centered, relative to the window
		x = offsets.rect.left + nodeRect.left + midpoint;
		//start out positioned at the bpttom, relative to the window
		y = offsets.rect.top + nodeRect.top + nodeRect.height;

		function adjustPosition (x, y) {
			var horizontalSpaceNeeded = me.popoverWidget.getWidth() / 2,
				width = me.popoverWidget.getWidth(),
				height = me.popoverWidget.getHeight();

			//if the top + the height of the popover is more than the view height
			//position the popover on top
			if ((y + height) > viewHeight) {
				//move it up the height of the popover, node, and the nib
				y = y - height - nodeRect.height - nibHeight;
				me.popoverWidget.addCls('bottom');
			} else {
				y += nibHeight;
				me.popoverWidget.addCls('top');
			}

			//if the right of the popover widget is past the right side of the reader
			//make it 10 px from the right of the reader
			if ((x + horizontalSpaceNeeded) > readerRight) {
				x = (readerRight - 10) - width;
				me.popoverWidget.addCls('right');
			//if the left of the popover widget is before the left side of the reader
			//make it 10 px from the left of the reader
			} else if (x - horizontalSpaceNeeded < readerLeft) {
				x = readerLeft + 10;
				me.popoverWidget.addCls('left');
			//else center it
			} else {
				x -= horizontalSpaceNeeded;
			}

			//Don't know why we need this here... Ext is trying to transition the x,y and messing everything up...
			y += scrollOffSet;

			return [x, y];
		}

		if (me.popoverWidget) {
			me.popoverWidget.destroy();
			delete me.popoverWidget;
		}

		Ext.fly(html).select('a[href]', true).set({target: '_blank'});

		me.popoverWidget = Ext.widget('simple-popover-widget', {reader: this.reader, text: html.innerHTML});
		me.popoverWidget.showAt(adjustPosition(x, y));
	},

	dismissPopover: function () {
		if (this.popoverWidget) {
			this.popoverWidget.startCloseTimer();
		}
	},

	applyContentAPI: function () {
		//TODO: can we get rid of this?
		var doc = this.getDocumentElement(),
			win = doc.parentWindow;
		Ext.Object.each(ContentAPIRegistry.getAPI(), function (f, n) {
			win[f] = n;
		});

	},

	getConfig: function () {
		var me = this;
		return {
			xtype: 'box',
			autoEl: {
				tag: 'iframe',
				name: 'iframe-' + guidGenerator() + '-content',
				src: (Ext.isIE || Ext.isIE11p) ?
					 Ext.SSL_SECURE_URL :
					 Globals.EMPTY_WRITABLE_IFRAME_SRC,
				frameBorder: 0,
				scrolling: 'no',
				seamless: true,
				style: 'overflow: hidden; z-index: 1;'
			},
			listeners: {
				afterRender: function () {
					me.resetFrame(function () {
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

	resetFrame: function (cb) {
		var BLANK_DOC = '<!DOCTYPE html>' +
				Ext.DomHelper.markup({tag: 'html', lang: 'en', cn: [
					{tag: 'head'},{tag: 'body'}]}),
			me = this,
			task = { interval: 50 }, doc;

		me.loadedResources = {};

		delete this.contentDocumentElement;

		task.run = function () {
			var doc = me.getDocumentElement();
			if (!me.reader || me.reader.isDestroyed) {
				Ext.TaskManager.stop(task);
			}
			if (doc && me.get()) {
				Ext.TaskManager.stop(task);
				doc.open();
				doc.write(BLANK_DOC);
				doc.close();
				delete me.contentDocumentElement;
				setTimeout(function () {
					me.initContentFrame();
					if (cb) {
						Ext.callback(cb, me);
					}
				}, 10);
			}
		};

		Ext.TaskManager.start(task);
		me.reader.on('destroy', function () {
			Ext.TaskManager.stop(task);
		});
	},

	initContentFrame: function () {
		var me = this,
			base = (function () {
				var d = window.location; return d.protocol + '//' + d.host;} ()),
			doc = me.getDocumentElement(),
			con = console, tip,
			meta, g = Globals;

		if (me.reader.isDestroyed) {return;}

		function on (dom, event, fn) {
			if (!Ext.isArray(event)) {
				event = [event];
			}
			Ext.each(event, function (event) {
				if (dom.addEventListener) {
					dom.addEventListener(event, fn, false);
				}
				else if (dom.attachEvent) {
					dom.attachEvent(event, fn);
				}
			});
		}

		function forward (name) {
			on(doc, name, function (e) {
				e = Ext.EventObject.setEvent(e || event);
				var o = me.reader.getAnnotationOffsets(),
					xy = e.getXY().slice();

				xy[0] += o.left;
				xy[1] += o.top;

				//console.debug(e.browserEvent,xy, o);
				me.reader.fireEvent('iframe-' + e.type, {
					browserEvent: e.browserEvent,
					type: e.type,
					getY: function () {
						return xy[1];
					},
					getX: function () {
						return xy[0];
					},
					getXY: function () {
						return xy;
					},
					stopEvent: function () {
						Ext.EventManager.stopPropagation(this.browserEvent);
						Ext.EventManager.preventDefault(this.browserEvent);
					}
				});
			});
		}

		me.get().win.onerror = function () {
			(con || console).warn('iframe error: ', JSON.stringify(arguments));
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

		on(doc, ['keypress', 'keydown', 'keyup'], function (e) {
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

		on(doc, 'mousedown', function () {
			Ext.menu.Manager.hideAll();
		});

		on(doc, 'click', function (e) {
			var evt = Ext.EventObject.setEvent(e || event),
				target = evt.getTarget(),
				anchor = evt.getTarget('A');

			if (anchor && !Element.matches(target, '.application-highlight,.application-highlight ' + target.tagName)) {
				me.reader.getContent().onClick(evt, anchor);
				return;
			}

			evt.stopEvent();
		});

		on(doc, 'touchend', function () {
			//if open notepad editor, close it if touch on reader
			var notepad = Ext.query('.inline-editor.x-component-notepad-item')[0];
			if (notepad) {
				notepad = Ext.get(notepad).down('.body');
				if (notepad) {
					notepad.blur();
				}
			}
		});

		on(doc, 'mouseup', function (e) {
			var fakeEvent = Ext.EventObject.setEvent(e || event),
				t = Ext.getBody().getScroll().top,
				s = me.get().win.getSelection();

			if (!fakeEvent.getTarget('a') || !s.isCollapsed) {
				me.reader.onContextMenuHandler(
					{
						getTarget: function () {
								return fakeEvent.getTarget.apply(fakeEvent, arguments);
							},

						preventDefault: function () {
								fakeEvent.preventDefault();
							},

						stopPropagation: function () {
								fakeEvent.stopPropagation();
							},

						getXY: function () {
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
			on(doc, 'touchstart', function () {
				Ext.menu.Manager.hideAll();
			});

			on(doc, 'selectionchange', function (e) {
				function selectionChange (e) {
					var fakeEvent = Ext.EventObject.setEvent(e || event),
						r = me.get().win.getSelection().getRangeAt(0);

					function showMenu () {
						me.reader.onContextMenuHandler({
							getTarget: function () { return fakeEvent.getTarget.apply(fakeEvent, arguments); },
							preventDefault: function () { fakeEvent.preventDefault(); },
							stopPropagation: function () { fakeEvent.stopPropagation(); }
						});
					}

					if (r) {
						var df = r.cloneContents(),
							n = df.firstChild;

						if (!n) {
							clearInterval(this.showMenuTimer);
						}
						else if (!df.querySelector('.application-highlight')) {
							this.showMenuTimer = setTimeout(showMenu, 250);
						}
						else {
							clearInterval(this.showMenuTimer);
						}

					}
					else {
						clearInterval(this.showMenuTimer);
					}
				}

				if (me.selectionTimer) { // So it doesn't continuously update during highlight-drag
					clearTimeout(me.selectionTimer);
				}
				me.selectionTimer = Ext.defer(selectionChange, 300, me, [e]);
			});
		}


		on(doc, 'mouseout', function (e) {
			var evt = Ext.EventObject.setEvent(e || event),
				target = evt.getTarget('a.footnote') || evt.getTarget('a.ntiglossaryentry');

			if (target) {
				me.dismissPopover();
			}
		});


		on(doc, 'mouseover', function (e) {
			var evt = Ext.EventObject.setEvent(e || event),
				target = evt.getTarget('a.footnote') || evt.getTarget('a.ntiglossaryentry'),
				targetType, href, popContent;

			function getId (e, type) {
				if (!Ext.fly(e).hasCls(type)) {
					e = Ext.fly(e).up('.' + type);
				}
				return e.getAttribute('href');
			}

			function getPopoverContent (href) {
				var fn, clonedFn, redactedPlaceholder;
				try {
					fn = doc.querySelector(href);
				}
				catch (e) {
					fn = doc.getElementById(href.substring(1));
				}

				if (!fn) {
					return;
				}
				clonedFn = fn.cloneNode(true);

				Ext.each(Ext.fly(clonedFn).query('a'),
						 function (d) {
							 var href = d.getAttribute ? d.getAttribute('href') : '';
							 if (href && href.indexOf('#m') >= 0) {
								 clonedFn.removeChild(d);
							 }
						 }
				);

				//Strip out the redacted text.	Note we look based on class
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

			me.displayPopover(href, popContent, target);
		});

		ContentAPIRegistry.on('update', me.applyContentAPI, me);
		me.applyContentAPI();
		me.reader.setSplash();
		if (me.syncInterval) {
			clearInterval(me.syncInterval);
		}
		me.syncInterval = setInterval(me.checkFrame, this.baseFrameCheckIntervalInMillis);
	},

	getTopBodyStyles: function () {
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

	onceSettled: function () {
		var me = this, fn,
			p = me.settledPromise || new Promise(function (fulfill, reject) {
				fn = Ext.Function.createBuffered(function () {
					fn = Ext.emptyFn;
					Ext.destroy(fire);
					fire = null;
					fulfill(me);
				}, 500);
				var fire = me.on({
					destroyable: true,
					'sync-height': fn
				});

				wait(1000).then(fn);
			});

		me.settledPromise = p;
		return p;
	},

	checkFrame: function () {
		if (this.reader.isDestroyed) {clearInterval(this.syncInterval); return;}
		var doc = this.getDocumentElement(), html;

		if (doc) {
			try {
				html = doc.getElementsByTagName('html');
				if (!Ext.isEmpty(html)) {
					this.syncFrame(html[0]);
				}
				if (Ext.Date.now() - this.lastSyncFrame > 1000) {
					clearInterval(this.syncInterval);
					if (!this.reader.isDestroyed) {
						this.syncInterval = setInterval(this.checkFrame,
							this.baseFrameCheckIntervalInMillis * this.frameCheckRateChangeFactor);
					}
				}
			} catch (er) {
				clearInterval(this.syncInterval);
				if (!this.reader.isDestroyed) {
					/*alert({
						icon: Ext.Msg.WARNING,
						title: 'Alert',
						msg: 'A fatal error has occured.',
						closable: false,
						buttons: null
					});*/
					throw er; //re-raise
				}
			}
		}
	},

	syncFrame: function (content) {
		var i = this.get(), h, contentHeight = 150, ii;
		//We need the buffer because otherwise the end of the doc would go offscreen

		if (this.reader.isDestroyed) {clearInterval(this.syncInterval); return;}

		if (!i) {
			console.warn('Cannot syncFrame, the iFrame is not ready');
			return;
		}

		if (Ext.isIE) { //This still seems wonky in IE10.  Make it just check IE so we can scroll the content
			contentHeight = 150;

			content = content.getElementsByTagName('body')[0];

			if (content) {
				for (ii = 0; ii < content.childNodes.length; ii++) {
					contentHeight += content.childNodes[ii].offsetHeight;
				}
			}
		}
		else {
			contentHeight = content.getBoundingClientRect().height;
		}
		h = Math.ceil(contentHeight);

		if (h === this.lastHeight) {
			return;
		}

		i.setHeight(h);
		this.reader.updateLayout();
		this.lastHeight = h;
		this.lastSyncFrame = Ext.Date.now();
		this.fireEvent('sync-height', h);
	},

	get: function () {
		var iframe, el = this.iframe && this.iframe.el;
		if (!el) {
			return null;
		}
		iframe = el.dom;
		el.win = iframe.contentWindow || window.frames[iframe.name];
		return el;
	},

	getDocumentElement: function () {
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

	update: function (html, metaData) {
		var doc = this.getDocumentElement(),
			body = Ext.get(doc.body || doc.getElementsByName('body')[0]),
			head = doc.getElementsByTagName('head')[0],
			div = document.createElement('div'),
			fallback = document.createElement('div'),
			metaNames = ['NTIID', 'last-modified'];

		Ext.select('meta[nti-injected="true"]', false, head).remove();

		div.innerHTML = html || '';

		Ext.each(div.querySelectorAll('object object'), function (object) {
			object.appendChild(fallback.cloneNode(true));
		});

		html = div.innerHTML;

		//Append some tags to the head
		if (metaData) {
			Ext.each(metaNames, function (tag) {
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

		if (body) {
			body.update(html || '');
			body.setStyle('background', 'transparent');
			doc.normalize();
		} else if (html) {
			console.error('We attempted to set the content of the IFrame and there was no BODY element to write to!');
		}

		if (html !== false) {
			this.fireEvent('content-updated-with', body, doc);
			this.cleanContent = body && body.dom.cloneNode(true);
		}
		delete this.settledPromise;
		this.fireEvent('content-updated');

		clearInterval(this.syncInterval);
		delete this.lastHeight;
		this.syncInterval = setInterval(this.checkFrame, this.baseFrameCheckIntervalInMillis);
	},

	getCleanContent: function () {
		return this.cleanContent;
	},

	/**
	 * Makes pointer events go through the iframe so that all the
	 * interactions can be handled manually.
	 * @param {Boolean} should
	 */
	setClickthrough: function (should) {
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

	hasClickthrough: function () {
		return this.get().hasCls('clickthrough');
	},

	/**
	 * @param {Number} x relative to the window's top left corner
	 * @param {Number} y relative to the window's top left corner
	 */
	elementAt: function (x, y) {
		var reader = this.reader,
			iFrameDoc = this.getDocumentElement(),
			outerDoc = Ext.getDoc().dom,
			hasClickthrough = this.hasClickthrough(),
			framePos = reader.getPosition(),
			scrolledY = reader.getScroll().top(),
			pickedElement,
			localX = x - framePos[0],
			localY = y - framePos[1] + scrolledY;

		function hasOverlay (element) {
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
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 */
	makeRangeFrom: function (x1, y1, x2, y2) {

		function rangeAtPoint (x, y) {
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
