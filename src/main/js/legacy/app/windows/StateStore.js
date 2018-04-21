const Ext = require('@nti/extjs');

require('legacy/common/StateStore');


module.exports = exports = Ext.define('NextThought.app.windows.StateStore', {
	extend: 'NextThought.common.StateStore',

	statics: {
		MIME_TO_CMP: {},
		MIME_REGISTERS: {},

		register: function (mimeType, cmp) {
			this.MIME_TO_CMP[mimeType] = cmp;
		},

		registerCustomResolver: function (mimeType, fn) {
			this.MIME_REGISTERS[mimeType] = fn;
		}
	},


	'obj_map': {},
	OPEN_COUNT: 0,

	constructor: function () {
		this.callParent(arguments);

		this.HTML_ELEMENT = document.getElementsByTagName('html')[0];
		this.VIEWPORT_ELEMENT = document.querySelector('.main-viewport');
	},


	getHTML: function () {
		if (!this.HTML_ELEMENT) {
			this.HTML_ELEMENT = document.getElementsByTagName('html')[0];
		}

		return this.HTML_ELEMENT;
	},


	getViewport: function () {
		if (!this.VIEWPORT_ELEMENT) {
			this.VIEWPORT_ELEMENT = document.querySelector('.main-viewport');
		}

		return this.VIEWPORT_ELEMENT;
	},


	getResolverFor: function (mimeType) {
		return this.self.MIME_REGISTERS[mimeType];
	},


	getComponentForMimeType: function (type) {
		let map = this.self.MIME_TO_CMP;

		if (!Array.isArray(type)) {
			type = [type];
		}

		return type.reduce(function (acc, t) {
			if (!acc) {
				acc = map[t];
			}

			return acc;
		}, null);
	},


	hasComponentForMimeType: function (type) {
		return !!this.self.MIME_TO_CMP[type];
	},


	fireShowWindow: function (object, state, el, monitors, precache) {
		this.fireEvent('show-window', object, state, el, monitors, precache);
	},


	firePushWindow: function (object, mimeType, state, title, route, precache) {
		this.fireEvent('push-window', object, mimeType, state, title, route, precache);
	},

	fireReplaceOpenWindowRoute: function (object, state, title, route, precache) {
		this.fireEvent('replaceOpenWindowRoute', object, state, title, route, precache);
	},

	fireCloseWindow: function () {
		this.fireEvent('close-window');
	},


	navigateToObject: function (record) {
		this.fireEvent('navigate-to-record', record);
	},


	removeCache: function (id) {
		delete this['obj_map'][id];
	},


	cacheObject: function (id, obj, el, monitors, precache) {
		this['obj_map'][id] = {
			obj: obj,
			el: el,
			monitors: monitors,
			precache: precache
		};
	},


	getObject: function (id) {
		return this['obj_map'][id];
	},


	addAllowNavigationHandler: function (fn) {
		if (!this['allow_navigation_handler']) {
			this['allow_navigation_handler'] = fn;
		} else {
			console.error('The window cannot have more than one navigation handler');
		}
	},


	allowNavigation: function () {
		return (this['allow_navigation_handler'] && this['allow_navigation_handler'].call(null)) || false;
	},


	incrementOpenWindows: function () {
		this.OPEN_COUNT += 1;
	},


	decrementOpenWindows: function () {
		this.OPEN_COUNT -= 1;
		this.OPEN_COUNT = this.OPEN_COUNT < 0 ? 0 : this.OPEN_COUNT;
	},


	hasOpenWindows: function () {
		return this.OPEN_COUNT > 0;
	},


	addOpenCls: function (doNotIncrement) {
		var html = this.getHTML();

		if (doNotIncrement !== true) {
			this.incrementOpenWindows();
		}

		this.fireEvent('lock-body-height');

		html.classList.add('window-open');
		// viewport.style.paddingRight = Ext.getScrollBarWidth() + 'px';
	},


	removeOpenCls: function () {
		this.decrementOpenWindows();

		if (this.hasOpenWindows()) { return; }

		var html = this.getHTML();

		this.fireEvent('unlock-body-height');

		html.classList.remove('window-open');
		// viewport.style.paddingRight = null;
	}
});
