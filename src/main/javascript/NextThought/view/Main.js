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
	touchStartTime: -1,

	items: [
		{xtype: 'main-navigation', id: 'nav', region: 'north'},
		{xtype: 'main-views', id: 'view', region: 'center'},
		{xtype: 'box', hostTo: 'sidebar', region: 'east', weight: 30, minWidth: 260}
	],

	constructor: function () {
		this.hidden = Boolean(NextThought.phantomRender);
		this.callParent(arguments);

		if (Ext.is.iPad) {
			document.ontouchstart = this.onTouchStart;

			document.ontouchmove = this.onTouchMove;

			document.ontouchend = this.onTouchEnd;
		}
	},


	onTouchStart: function (e) {
		var touch = e.touches[0];
		if (!touch) {
			return;
		}
		this.touchStartTime = e.timeStamp;

		// Dispatch mouseenter
		var mouseEnterEvent = document.createEvent('MouseEvents');
		mouseEnterEvent.initMouseEvent('mouseenter', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseEnterEvent);

		// Dispatch mouseover
		var mouseOverEvent = document.createEvent('MouseEvents');
		mouseOverEvent.initMouseEvent('mouseover', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseOverEvent);

		// Dispatch mousedown
		var mouseDownEvent = document.createEvent('MouseEvents');
		mouseDownEvent.initMouseEvent('mousedown', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseDownEvent);
	},


	onTouchMove: function (e) {
		var touch = e.touches[0];
		if (!touch) {
			return;
		}
		// Dispatch mousemove
		var mouseMoveEvent = document.createEvent('MouseEvents');
		mouseMoveEvent.initMouseEvent('mousemove', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseMoveEvent);

		// Dispatch leave/enter events if moving onto a different element
		var changedTouch = e.changedTouches[0];
		if (changedTouch && changedTouch.target !== touch.target) {
			// Dispatch mouseleave
			var mouseLeaveEvent = document.createEvent('MouseEvents');
			mouseLeaveEvent.initMouseEvent('mouseleave', true, true, window,
				0, changedTouch.screenX, changedTouch.screenY, changedTouch.clientX, changedTouch.clientY,
				false, false, false, false, 0, null);
			changedTouch.target.dispatchEvent(mouseLeaveEvent);

			// Dispatch mouseout
			var mouseOutEvent = document.createEvent('MouseEvents');
			mouseOutEvent.initMouseEvent('mouseout', true, true, window,
				0, changedTouch.screenX, changedTouch.screenY, changedTouch.clientX, changedTouch.clientY,
				false, false, false, false, 0, null);
			changedTouch.target.dispatchEvent(mouseOutEvent);

			// Dispatch mouseenter
			var mouseEnterEvent = document.createEvent('MouseEvents');
			mouseEnterEvent.initMouseEvent('mouseenter', true, true, window,
				0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
				false, false, false, false, 0, null);
			touch.target.dispatchEvent(mouseEnterEvent);
		}
	},


	onTouchEnd: function (e) {
		var touch = e.changedTouches[0];
		if (!touch) {
			return;
		}
		// Dispatch mouseup
		var mouseUpEvent = document.createEvent('MouseEvents');
		mouseUpEvent.initMouseEvent('mouseup', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseUpEvent);

		// Dispatch mouseleave
		var mouseLeaveEvent = document.createEvent('MouseEvents');
		mouseLeaveEvent.initMouseEvent('mouseleave', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseLeaveEvent);

		// Dispatch mouseout
		var mouseOutEvent = document.createEvent('MouseEvents');
		mouseOutEvent.initMouseEvent('mouseout', true, true, window,
			0, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);
		touch.target.dispatchEvent(mouseOutEvent);

		// Dispatch click if touch lasted one second or less in duration
//		if (e.timeStamp - this.touchStartTime <= 1000) {
//			var clickEvent = document.createEvent('MouseEvents');
//			clickEvent.initMouseEvent('click', true, true, window,
//				1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
//				false, false, false, false, 0, null);
//			touch.target.dispatchEvent(clickEvent);
//		}
	},


	afterRender: function () {
		this.callParent(arguments);

		var map = {
			width: 'right',
			height: 'bottom',
			widthp: 'left',
			heightp: 'top'
		};

		Ext.Object.each(Ext.getScrollbarSize(), function (k, v) {
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

		Ext.EventManager.onWindowResize(this.detectZoom, this);
		this.detectZoom();
		this.views = this.down('main-views');

		this.sidebar = this.add({
			xtype: 'main-sidebar',
			host: this.down('[region=east][hostTo=sidebar]'),
			hidden: this.hidden
		});

		this.identity = this.sidebar.add({xtype: 'identity'});

		Ext.getDoc().on('touchmove', function (e) {
			e.preventDefault();
		});

		if (Ext.is.iPad) {
			var me = this,
				optWindow;

			/*If user rotates to portrait, display screen saying to rotate it.
			 * if they rotate back to landscape, destroy screen*/
			window.addEventListener('orientationchange', function () {
				if (optWindow) {
					optWindow.destroy();
					optWindow = null;
				}
				if (Math.abs(window.orientation) != 90) {
					optWindow = me.createPortraitOrientationScreen();
					var iframe = optWindow.el.down('iframe');
					iframe.el.dom.contentWindow.addEventListener('touchstart', function (e) {
						e.preventDefault();
					});
					optWindow.show();
				}
			}, true);

			if (Math.abs(window.orientation) != 90) {
				optWindow = this.createPortraitOrientationScreen();
				var iframe = optWindow.el.down('iframe');
				iframe.el.dom.contentWindow.addEventListener('touchstart', function (e) {
					e.preventDefault();
				});

				optWindow.show();
			}

			document.body.onorientationchange = function () {
				window.scrollTo(0, 0);
			};
		}
	},


	createPortraitOrientationScreen: function () {
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


	detectZoom: function () {
		var z = 1,
			currentBar;
		try {
			z = DetectZoom.zoom();
			console.log("Zoom:", z);
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
