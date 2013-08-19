Ext.define('NextThought.view.whiteboard.TouchSender', {
	extend: 'NextThought.modules.TouchSender',
	alias: 'whiteboard.touchSender',


	setupTouchHandlers: function () {
		var container = this.container,
			dom = container.getEl().dom;

		dom.addEventListener('touchstart', this.touchStart, false);

		dom.addEventListener('touchmove', this.touchMove, false);

		dom.addEventListener('touchend', this.touchEnd, false);
	},


	// Dispatch a mousedown event
	touchStart: function (e) {
		var touch = e.touches[0];
		if (!touch) {
			return;
		}

		var mouseEvent = document.createEvent('MouseEvents');
		mouseEvent.initMouseEvent('mousedown', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);

		touch.target.dispatchEvent(mouseEvent);
	},


	// Dispatch a mousemove event
	touchMove: function (e) {
		var touch = e.touches[0];
		if (!touch) {
			return;
		}

		var mouseEvent = document.createEvent('MouseEvents');
		mouseEvent.initMouseEvent('mousemove', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);

		touch.target.dispatchEvent(mouseEvent);
	},


	// Dispatch a mouseup event
	touchEnd: function (e) {
		var touch = e.changedTouches[0];
		if (!touch) {
			return;
		}

		var mouseEvent = document.createEvent('MouseEvents');
		mouseEvent.initMouseEvent('mouseup', true, true, window,
			1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
			false, false, false, false, 0, null);

		touch.target.dispatchEvent(mouseEvent);
	}
});