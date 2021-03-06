const Ext = require('@nti/extjs');
const Commons = require('@nti/web-commons');

const ChatOverrides = require('nti-web-chat-overrides');
const DiscussionOverrides = require('nti-web-discussion-overrides');
const { IEAlert } = require('nti-web-react-components');

require('./MessageBox');
require('./MessageBar');
require('./navigation/Index');
require('./navigation/MessageBar');
require('./Body');
require('./windows/Index');
require('./chat/Index');
require('./prompt/Index');
require('../layout/container/None');

ChatOverrides.setupOverrides();
DiscussionOverrides.setupOverrides();

Commons.Layouts.Responsive.setWebappContext();

Commons.Prompt.Manager.setAllowedExternalFocus(target => {
	const el = target && Ext.get(target);

	return (
		el &&
		(el.findParent('.window-container') ||
			el.findParent('.search-field') ||
			el.findParent('.prompt-container') ||
			el.findParent('.recovery-email-view'))
	);
});

module.exports = exports = Ext.define('NextThought.app.Index', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',
	border: false,
	frame: false,
	defaults: { border: false, frame: false },
	layout: 'none',
	id: 'viewport',
	ui: 'nextthought',
	cls: 'main-viewport',
	minWidth: 1024,
	touchStartTime: -1,

	items: [],

	get DetectZoom() {
		// lazy require ... blows up if run on node
		return (
			this._detectZoomInstance ||
			(this._detectZoomInstance = require('detect-zoom'))
		);
	},

	initComponent: function () {
		this.callParent();

		this.body = this.add({ xtype: 'main-views', id: 'view' });
		this.add({ xtype: 'main-navigation', id: 'nav' });
		this.add({
			xtype: 'chats-view',
			id: 'chat-window',
			navigateToObject: obj => this.body.attemptToNavigateToObject(obj),
		});

		this.el = Ext.DomHelper.insertFirst(
			Ext.getBody(),
			{ cls: 'viewport' },
			true
		);
		this.renderTo = this.el;

		Ext.createByAlias('widget.windows-view', {
			xtype: 'windows-view',
			id: 'window',
			renderTo: Ext.getBody(),
		});
		Ext.createByAlias('widget.prompt-view', {
			xtype: 'prompt-view',
			id: 'prompt',
			renderTo: Ext.getBody(),
		});

		window['nti-sticky-top-offset'] = () => {
			return document.documentElement.className.indexOf('msg-bar-open') >=
				0
				? 110
				: 70;
		};

		IEAlert.maybeShow();
	},

	constructor: function () {
		//This variable is set by phantomjs environment?
		//eslint-disable-next-line no-undef
		this.hidden = Boolean(NextThought.phantomRender);
		this.callParent(arguments);

		if (Ext.isWindows) {
			Ext.getBody().addCls('is-windows');
		}

		if (Ext.is.iOS) {
			Ext.getBody().on({
				touchstart: this.onTouchStart,
				touchmove: this.onTouchMove,
				touchend: this.onTouchEnd,
			});
		}
	},

	afterRender: function () {
		this.callParent(arguments);
		var me = this,
			map = {
				width: 'right',
				height: 'bottom',
				widthp: 'left',
				heightp: 'top',
			};

		Ext.Object.each(Ext.getScrollbarSize(), function (k, v) {
			if (v) {
				Ext.getBody().addCls('detected-scrollbars');

				var style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = [
					'.scroll-pos-' +
						map[k] +
						' { ' +
						map[k + 'p'] +
						':-' +
						v +
						'px !important; } ',
					'.scroll-margin-' +
						map[k] +
						' { margin-' +
						map[k] +
						':' +
						v +
						'px !important; } ',
					'.scroll-padding-' +
						map[k] +
						' { padding-' +
						map[k] +
						':' +
						v +
						'px !important; } ',
				].join(' \r\n ');

				document.getElementsByTagName('head')[0].appendChild(style);
			}
		});

		Ext.EventManager.onWindowResize(this.onWindowResize, this);
		this.onWindowResize();

		if (Ext.is.iOS) {
			//this.setupTablet();
			//Ext.getDoc().swallowEvent('gesturestart', true);

			//keep element under body from shrinking. Can cause the screen to go white
			Ext.defer(function () {
				me.el.setStyle('min-height', me.el.getHeight() + 'px');
			}, 1000);

			//Adjust the height to get rid of the odd white bar at the bottom
			//Edit: the top bar is getting cut off a little bit
			console.log(Ext.get(Ext.query('.viewport')[0]).getHeight());
			Ext.defer(function () {
				Ext.get(Ext.query('.viewport')[0]).setHeight(
					window.outerHeight
				);
				Ext.get('view').setHeight(
					window.outerHeight - Ext.get('nav').getHeight()
				);
			}, 500);
		}
	},

	onTouchStart: function (e) {
		var touch = e.browserEvent.touches[0],
			mouseEnterEvent,
			mouseOverEvent,
			mouseDownEvent;

		this.touchStartTime = e.browserEvent.timeStamp;
		if (!touch) {
			return;
		}

		if (e.browserEvent.touches[1]) {
			this.scrolledY = null;
			return;
		}

		// Dispatch mouseenter
		mouseEnterEvent = document.createEvent('MouseEvents');
		mouseEnterEvent.initMouseEvent(
			'mouseenter',
			true,
			true,
			window,
			0,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseEnterEvent);

		// Dispatch mouseover
		mouseOverEvent = document.createEvent('MouseEvents');
		mouseOverEvent.initMouseEvent(
			'mouseover',
			true,
			true,
			window,
			0,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseOverEvent);

		// Dispatch mousedown
		mouseDownEvent = document.createEvent('MouseEvents');
		mouseDownEvent.initMouseEvent(
			'mousedown',
			true,
			true,
			window,
			1,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseDownEvent);
	},

	onTouchMove: function (e) {
		var touch = e.browserEvent.touches[0],
			changedTouch = e.browserEvent.changedTouches[0],
			currTarget,
			scrollable = e.getTarget('.scrollable'),
			scrollableElement,
			mouseMoveEvent,
			mouseLeaveEvent,
			mouseOutEvent,
			mouseEnterEvent;

		if (!touch) {
			return;
		}

		this.touchStartTime = 0;

		// If the event target wasn't a scrollable element, then we don't want scrolling
		if (!scrollable) {
			e.preventDefault();
		}

		//Don't scroll page if dragging an element in quiz
		currTarget = Ext.get(touch.target);
		if (
			currTarget &&
			(currTarget.hasCls('draggable-area') ||
				currTarget.up('.draggable-area'))
		) {
			e.preventDefault();
		}

		// Scroll scrollable element on two-finger scrolling
		if (e.browserEvent.changedTouches[1]) {
			scrollableElement = Ext.get(touch.target);

			let cont = true;
			//while true?? ugly.
			while (cont) {
				if (scrollableElement.isScrollable()) {
					cont = false;
					break;
				} else {
					if (scrollableElement.parent()) {
						scrollableElement = scrollableElement.parent();
					} else {
						return;
					}
				}
			}
			if (!this.scrolledY) {
				this.scrolledY = touch.clientY;
			}
			if (!scrollable) {
				scrollableElement.scrollBy(0, this.scrolledY - touch.clientY);
				this.scrolledY = touch.clientY;
			}
		}

		// Dispatch mousemove
		mouseMoveEvent = document.createEvent('MouseEvents');
		mouseMoveEvent.initMouseEvent(
			'mousemove',
			true,
			true,
			window,
			1,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseMoveEvent);

		// Dispatch leave/enter events if moving onto a different element
		if (changedTouch && changedTouch.target !== touch.target) {
			// Dispatch mouseleave
			mouseLeaveEvent = document.createEvent('MouseEvents');
			mouseLeaveEvent.initMouseEvent(
				'mouseleave',
				true,
				true,
				window,
				0,
				changedTouch.screenX,
				changedTouch.screenY,
				changedTouch.clientX,
				changedTouch.clientY,
				false,
				false,
				false,
				false,
				0,
				null
			);
			changedTouch.target.dispatchEvent(mouseLeaveEvent);

			// Dispatch mouseout
			mouseOutEvent = document.createEvent('MouseEvents');
			mouseOutEvent.initMouseEvent(
				'mouseout',
				true,
				true,
				window,
				0,
				changedTouch.screenX,
				changedTouch.screenY,
				changedTouch.clientX,
				changedTouch.clientY,
				false,
				false,
				false,
				false,
				0,
				null
			);
			changedTouch.target.dispatchEvent(mouseOutEvent);

			// Dispatch mouseenter
			mouseEnterEvent = document.createEvent('MouseEvents');
			mouseEnterEvent.initMouseEvent(
				'mouseenter',
				true,
				true,
				window,
				0,
				touch.screenX,
				touch.screenY,
				touch.clientX,
				touch.clientY,
				false,
				false,
				false,
				false,
				0,
				null
			);
			touch.target.dispatchEvent(mouseEnterEvent);
		}
	},

	onTouchEnd: function (e) {
		var touch = e.browserEvent.changedTouches[0],
			clickEvent,
			mouseUpEvent,
			mouseLeaveEvent,
			mouseOutEvent;

		if (!touch) {
			return;
		}

		if (e.browserEvent.changedTouches[1]) {
			return;
		}

		mouseUpEvent = document.createEvent('MouseEvents');
		mouseUpEvent.initMouseEvent(
			'mouseup',
			true,
			true,
			window,
			1,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseUpEvent);

		// Dispatch mouseleave
		mouseLeaveEvent = document.createEvent('MouseEvents');
		mouseLeaveEvent.initMouseEvent(
			'mouseleave',
			true,
			true,
			window,
			0,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseLeaveEvent);

		// Dispatch mouseout
		mouseOutEvent = document.createEvent('MouseEvents');
		mouseOutEvent.initMouseEvent(
			'mouseout',
			true,
			true,
			window,
			0,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
		touch.target.dispatchEvent(mouseOutEvent);

		//Touching on edit whiteboard while keyboard is up isn't clicking, so make sure it gets clicked.
		if (Ext.get(touch.target).up('.whiteboard-wrapper')) {
			e.preventDefault();

			// Dispatch click if touch lasted a half second or less in duration
			if (e.browserEvent.timeStamp - this.touchStartTime <= 500) {
				clickEvent = document.createEvent('MouseEvents');
				clickEvent.initMouseEvent(
					'click',
					true,
					true,
					window,
					1,
					touch.screenX,
					touch.screenY,
					touch.clientX,
					touch.clientY,
					false,
					false,
					false,
					false,
					0,
					null
				);
				touch.target.dispatchEvent(clickEvent);
			}
		}
	},

	onWindowResize: function () {
		var z = 1;
		//var bodyEl = Ext.getBody();
		//var body = Ext.getDom(bodyEl);
		//var fn = this.onWindowResize;
		var currentBar;

		try {
			z = this.DetectZoom.zoom();
			// console.debug('Zoom:', z);
		} catch (e) {
			console.error('Detect Zoom failed to load');
		}

		//IEs returns jacked up coordinates when zoom is applied.  Scold if they are in
		//IE and a zoom level other than 1
		if (Ext.isIE) {
			if (z !== 1) {
				Ext.widget('message-bar', {
					renderTo: Ext.getBody(),
					messageType: 'zoom',
					message:
						"Your browser's current zoom setting is not fully supported. Please reset it to the default zoom.",
				});
			} else {
				//todo: Find another way to do this: (probably move it into the bar itself)
				currentBar = Ext.ComponentQuery.query('message-bar');
				if (!Ext.isEmpty(currentBar)) {
					currentBar[0].destroy();
				}
			}
		}
	},
});
