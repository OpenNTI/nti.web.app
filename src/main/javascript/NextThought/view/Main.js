Ext.define('NextThought.view.Main', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
		'Ext.layout.container.Border',
		'NextThought.view.account.Identity',
		'NextThought.view.MessageBox',
		'NextThought.view.Navigation',
		'NextThought.view.SideBar',
		'NextThought.view.Views',
		'NextThought.view.MessageBar'
	],

	border: false,
	frame: false,
	defaults: { border: false, frame: false },
	layout: 'border',
	id: 'viewport',
	ui: 'nextthought',
	minWidth: 1024,

	items: [
		{xtype: 'main-navigation', id: 'nav', region: 'north'},
		{xtype: 'main-views', id: 'view', region: 'center'},
		{xtype: 'box', hostTo: 'sidebar', region: 'east', weight: 30, minWidth: 260}
	],


	initComponent: function() {
		this.callParent();
		this.el = Ext.DomHelper.insertFirst(Ext.getBody(), { cls: 'viewport' }, true);
		this.renderTo = this.el;
	},


	constructor: function() {
		this.hidden = Boolean(NextThought.phantomRender);
		this.callParent(arguments);

		if (Ext.is.iOS) {
			Ext.getBody().on({
				touchstart: this.onTouchStart,
				touchmove: this.onTouchMove,
				touchend: this.onTouchEnd
			});
		}
	},


	onTouchStart: function(e) {
		var touch = e.browserEvent.touches[0],
			mouseEnterEvent,
			mouseOverEvent,
			mouseDownEvent;

		if (!touch) {
			return;
		}

		// Dispatch mouseenter
		mouseEnterEvent = document.createEvent('MouseEvents');
		mouseEnterEvent.initMouseEvent('mouseenter', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseEnterEvent);

		// Dispatch mouseover
		mouseOverEvent = document.createEvent('MouseEvents');
		mouseOverEvent.initMouseEvent('mouseover', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseOverEvent);

		// Dispatch mousedown
		mouseDownEvent = document.createEvent('MouseEvents');
		mouseDownEvent.initMouseEvent('mousedown', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseDownEvent);
	},


	onTouchMove: function(e) {
		var touch = e.browserEvent.touches[0],
			changedTouch = e.browserEvent.changedTouches[0],
			scrollable = e.getTarget('.scrollable'),
			mouseMoveEvent,
			mouseLeaveEvent,
			mouseOutEvent,
			mouseEnterEvent;

		if (!touch) {
			return;
		}

		// If the event target wasn't a scrollable element, then we don't want scrolling
		if (!scrollable) {
			e.preventDefault();
		}

		// Dispatch mousemove
		mouseMoveEvent = document.createEvent('MouseEvents');
		mouseMoveEvent.initMouseEvent('mousemove', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseMoveEvent);

		// Dispatch leave/enter events if moving onto a different element
		if (changedTouch && changedTouch.target !== touch.target) {
			// Dispatch mouseleave
			mouseLeaveEvent = document.createEvent('MouseEvents');
			mouseLeaveEvent.initMouseEvent('mouseleave', true, true, window,
				0, changedTouch.screenX, changedTouch.screenY, changedTouch.clientX, changedTouch.clientY,
				false, false, false, false, 0, null);
			changedTouch.target.dispatchEvent(mouseLeaveEvent);

			// Dispatch mouseout
			mouseOutEvent = document.createEvent('MouseEvents');
			mouseOutEvent.initMouseEvent('mouseout', true, true, window,
				0, changedTouch.screenX, changedTouch.screenY, changedTouch.clientX, changedTouch.clientY,
				false, false, false, false, 0, null);
			changedTouch.target.dispatchEvent(mouseOutEvent);

			// Dispatch mouseenter
			mouseEnterEvent = document.createEvent('MouseEvents');
			mouseEnterEvent.initMouseEvent('mouseenter', true, true, window,
				0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
				false, false, false, false, 0, null);
			touch.target.dispatchEvent(mouseEnterEvent);
		}
	},


	onTouchEnd: function(e) {
		var touch = e.browserEvent.changedTouches[0],
			mouseUpEvent,
			mouseLeaveEvent,
			mouseOutEvent;

		if (!touch) {
			return;
		}
		// Dispatch mouseup
		mouseUpEvent = document.createEvent('MouseEvents');
		mouseUpEvent.initMouseEvent('mouseup', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseUpEvent);

		// Dispatch mouseleave
		mouseLeaveEvent = document.createEvent('MouseEvents');
		mouseLeaveEvent.initMouseEvent('mouseleave', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseLeaveEvent);

		// Dispatch mouseout
		mouseOutEvent = document.createEvent('MouseEvents');
		mouseOutEvent.initMouseEvent('mouseout', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseOutEvent);
	},


	afterRender: function() {
		this.callParent(arguments);
		var me = this, map = {
			width: 'right',
			height: 'bottom',
			widthp: 'left',
			heightp: 'top'
		};

		Ext.Object.each(Ext.getScrollbarSize(), function(k, v) {
			if (v) {
				Ext.getBody().addCls('detected-scrollbars');

				var style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = [
					'.scroll-pos-' + map[k] + ' { ' + map[k + 'p'] + ':-' + v + 'px !important; } ',
					'.scroll-margin-' + map[k] + ' { margin-' + map[k] + ':' + v + 'px !important; } ',
					'.scroll-padding-' + map[k] + ' { padding-' + map[k] + ':' + v + 'px !important; } '
				].join(' \r\n ');

				document.getElementsByTagName('head')[0].appendChild(style);

			}
		});

		Ext.EventManager.onWindowResize(this.onWindowResize, this);
		this.onWindowResize();
		this.views = this.down('main-views');

		this.sidebar = this.add({
			xtype: 'main-sidebar',
			host: this.down('[region=east][hostTo=sidebar]'),
			hidden: this.hidden,
			listeners: {
				afterRender: function() {
					//don't force a render by setting renderTo ...bad things happen. Just move the node after render.
					me.el.appendChild(me.sidebar.el);
				}
			}
		});

		this.identity = this.sidebar.add({
			xtype: 'identity',
			listeners: {
				afterRender: function() {
					//don't force a render by setting renderTo ...bad things happen. Just move the node after render
					me.el.appendChild(me.identity.el);
				}
			}
		});

		if (Ext.is.iOS) {
            //			this.setupTablet();
			Ext.getDoc().swallowEvent('gesturestart', true);
			this.lockOrientation();

            //keep element under body from shrinking. Can cause the screen to go white
            Ext.defer(function() {
                me.el.setStyle('min-height', me.el.getHeight() + 'px');
            },1000);

            //assume that after a blurred input or contentEditable div, that the
            //keyboard is being dismissed. Make sure window is at (0,0) and not misaligned.
            document.addEventListener('focusout', function(e) {
                if(e.target.tagName == "INPUT" || e.target.isContentEditable){
                    window.scrollTo(0,0);
                }
            });

		}
	},


	setupTablet: function() {
		var me = this,
			o = { height: '100%', width: '100%', overflow: 'hidden', webkitOverflowScrolling: 'none' },
			cache = {};

		function touchEnd(e) {
			touchHandler.lastEvent = null;
			scrollLock(e);
		}

		function touchHandler(e) {
			var t = e.getTarget('.scrollable'),
				el, xy, lastXY = touchHandler.lastEvent,
				styles;

			function testRange(e, direction, positionName, maxName) {
				var scroll = 'scroll' + (maxName || 'Height'),
					max = 'client' + (maxName || 'Height'),
					pos = 'scroll' + (positionName || 'Top');
				// The user is scrolling up, and the element is already scrolled to top
				// OR
				// The user is scrolling down, and the element is already scrolled to bottom
				if ((direction > 0 && t[pos] <= 0) || (direction < 0 && t[pos] >= (t[scroll] - t[max]))) {
					e.preventDefault();
				}
			}

			if (t) {
				e.stopPropagation();
				xy = e.getXY();
				el = Ext.get(t);
				if (!cache[el.id]) {
					cache[el.id] = el.getStyle(['overflow-x', 'overflow-y']);
				}

				styles = cache[el.id];
				if (styles['overflow-x'] === 'hidden') {
					t.scrollLeft = 0;
					testRange(e, xy[1] - lastXY[1], 'Top', 'Height');
				}

				if (styles['overflow-y'] === 'hidden') {
					t.scrollTop = 0;
					testRange(e, xy[0] - lastXY[0], 'Left', 'Width');
				}

				touchHandler.lastEvent = e.getXY();
			}
			else {
				//e.stopEvent();
				delete touchHandler.lastEvent;
			}
		}


		function scrollLock(e) {
			var el, styles, t = e.getTarget('.scrollable');
			if (!t) {
				return;
			}

			el = Ext.get(t);
			if (!cache[el.id]) {
				cache[el.id] = el.getStyle(['overflow-x', 'overflow-y']);
			}
			styles = cache[el.id];
			if (styles['overflow-x'] === 'hidden') {
				t.scrollLeft = 0;
			}

			if (styles['overflow-y'] === 'hidden') {
				t.scrollTop = 0;
			}

		}


		function touchStart(e) {
			var t = e.getTarget('.scrollable');
			if (!t) {
				return;
			}

			touchHandler.lastEvent = e.getXY();

			if (t.scrollTop === 0) {
				t.scrollTop = 1;
			} else if (t.scrollHeight === t.scrollTop + t.offsetHeight) {
				t.scrollTop -= 1;
			}
		}

		Ext.getDoc().first('html').setStyle(o);
		Ext.getBody().setStyle(o);


		// Prevent two-finger panning
		Ext.getDoc().swallowEvent('gesturestart', true)
			.swallowEvent('touchmove', true);

		// based on http://stackoverflow.com/a/14244680/823158 and http://stackoverflow.com/a/9417931/823158
		Ext.getBody().on({
			touchmove: touchHandler,
			touchend: touchEnd,
			touchcancel: touchEnd,
			touchstart: touchStart
		});

		window.onscroll = function() {window.scrollTo(0, window.scrollY);};
		window.onresize = function() {
			Ext.getBody().setWidth(window.innerWidth).setHeight(window.innerHeight);
		};

		this.lockOrientation();
	},


	lockOrientation: function() {
		var optWindow, iframe;

		/*If user rotates to portrait, display screen saying to rotate it.
		 * if they rotate back to landscape, destroy screen*/
		window.addEventListener('orientationchange', function() {
			var iframe;

			if (optWindow) {
				optWindow.destroy();
				optWindow = null;
			}
			if (Math.abs(window.orientation) !== 90) {
				optWindow = me.createPortraitOrientationScreen();
				iframe = optWindow.el.down('iframe');
				iframe.el.dom.contentWindow.addEventListener('touchstart', function(e) {
					e.preventDefault();
				});
				optWindow.show();
			}
		}, true);

		if (Math.abs(window.orientation) !== 90) {
			optWindow = this.createPortraitOrientationScreen();
			iframe = optWindow.el.down('iframe');
			iframe.el.dom.contentWindow.addEventListener('touchstart', function(e) {
				e.preventDefault();
			});

			optWindow.show();
		}

		document.body.onorientationchange = function() {
			window.scrollTo(0, 0);
		};
	},


	createPortraitOrientationScreen: function() {
		var optWindow = Ext.widget('nti-window', {
			title: 'Portrait mode unavailabe',
			closeAction: 'hide',
			width: '100%',
			height: '100%',
			layout: 'fit',
			modal: true,
			closable: false,
			draggable: false,
			resizeable: false,
			hideParent: true,
			renderTo: Ext.getBody(),
			items: {
				xtype: 'component',
				cls: 'clickthrough',
				autoEl: {
					tag: 'iframe',
					src: 'resources/portraitOrientation.html',
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0,
					seamless: true,
					transparent: true,
					allowTransparency: true,
					style: 'overflow-x: hidden; overflow-y:auto'
				}
			}
		});
		return optWindow;
	},


	onWindowResize: function onWindowResize() {
		var z = 1,
			bodyEl = Ext.getBody(),
			body = Ext.getDom(bodyEl),
			fn = onWindowResize,
			currentBar;
		try {
			clearTimeout(fn.repaintTimer);
			if (body.scrollWidth !== body.offsetWidth || body.scrollHeight !== body.offsetHeight) {
				//fix body scrollbars
				fn.repaintTimer = Ext.defer(bodyEl.repaint, 100, bodyEl);
			}

			z = DetectZoom.zoom();
			console.log('Zoom:', z);
		}
		catch (e) {
			console.error('Detect Zoom failed to load');
		}

		//IEs returns jacked up coordinates when zoom is applied.  Scold if they are in
		//IE and a zoom level other than 1
		if (Ext.isIE) {
			if (z !== 1) {
				Ext.widget('message-bar', {
					renderTo: Ext.getBody(),
					messageType: 'zoom',
					message: 'Your browser\'s current zoom setting is not fully supported. Please reset it to the default zoom.'
				});
			}
			else {
				//todo: Find another way to do this: (probably move it into the bar itself)
				currentBar = Ext.ComponentQuery.query('message-bar');
				if (!Ext.isEmpty(currentBar)) {
					currentBar[0].destroy();
				}
			}
		}
	}
});
